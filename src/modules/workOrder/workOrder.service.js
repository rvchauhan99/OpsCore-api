"use strict";
const { Op } = require("sequelize");
const db = require("../../models/index.js");
const { WorkOrder, ManufacturingOrder, WorkCenter, BomRouting, User } = db;

const getTenantId = (req) => req.tenantId || req.user?.tenant_id || null;

const generateWoNumber = async (tenantId) => {
  const year = new Date().getFullYear();
  const count = await WorkOrder.count({ where: { tenant_id: tenantId } });
  return `WO-${year}-${String(count + 1).padStart(4, "0")}`;
};

const list = async (req) => {
  const tenantId = getTenantId(req);
  const { search, status, manufacturing_order_id, work_center_id, page = 1, limit = 50 } = req.query;

  const where = { deleted_at: null };
  if (tenantId) where.tenant_id = tenantId;
  if (status) where.status = status;
  if (manufacturing_order_id) where.manufacturing_order_id = parseInt(manufacturing_order_id);
  if (work_center_id) where.work_center_id = parseInt(work_center_id);
  if (search) where.wo_number = { [Op.iLike]: `%${search}%` };

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { count, rows } = await WorkOrder.findAndCountAll({
    where,
    include: [
      {
        model: ManufacturingOrder,
        as: "manufacturingOrder",
        attributes: ["id", "mo_number", "status"],
        include: [{ model: db.Product, as: "product", attributes: ["id", "product_name", "barcode_number"] }],
      },
      { model: WorkCenter, as: "workCenter", attributes: ["id", "name", "code"] },
      { model: BomRouting, as: "routingStep", attributes: ["id", "step_name", "sequence_no"] },
    ],
    order: [["created_at", "DESC"]],
    limit: parseInt(limit),
    offset,
  });

  return { total: count, page: parseInt(page), limit: parseInt(limit), data: rows };
};

const getById = async (id, req) => {
  const tenantId = getTenantId(req);
  const where = { id, deleted_at: null };
  if (tenantId) where.tenant_id = tenantId;

  const wo = await WorkOrder.findOne({
    where,
    include: [
      {
        model: ManufacturingOrder,
        as: "manufacturingOrder",
        include: [{ model: db.Product, as: "product", attributes: ["id", "product_name", "barcode_number"] }],
      },
      { model: WorkCenter, as: "workCenter" },
      { model: BomRouting, as: "routingStep" },
    ],
  });

  if (!wo) {
    const err = new Error("Work Order not found");
    err.statusCode = 404;
    throw err;
  }
  return wo;
};

const create = async (data, req) => {
  const tenantId = getTenantId(req);
  const wo_number = await generateWoNumber(tenantId);
  return await WorkOrder.create({ ...data, wo_number, tenant_id: tenantId });
};

const update = async (id, data, req) => {
  const wo = await getById(id, req);
  return await wo.update(data);
};

const updateStatus = async (id, status, notes, req) => {
  const wo = await getById(id, req);
  const upd = { status };
  if (notes) upd.notes = notes;
  if (status === "in_progress" && !wo.actual_start) upd.actual_start = new Date();
  if ((status === "completed" || status === "qc_pending" || status === "rejected") && !wo.actual_end) {
    upd.actual_end = new Date();
  }
  return await wo.update(upd);
};

const remove = async (id, req) => {
  const wo = await getById(id, req);
  await wo.update({ deleted_at: new Date() });
  return { message: "Work Order deleted" };
};

module.exports = { list, getById, create, update, updateStatus, remove };
