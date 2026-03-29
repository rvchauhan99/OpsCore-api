"use strict";
const { Op } = require("sequelize");
const db = require("../../models/index.js");
const { ManufacturingOrder, BomHeader, Product, WorkOrder, B2BSalesOrder } = db;

const getTenantId = (req) => req.tenantId || req.user?.tenant_id || null;

const generateMoNumber = async (tenantId) => {
  const year = new Date().getFullYear();
  const count = await ManufacturingOrder.count({ where: { tenant_id: tenantId } });
  return `MO-${year}-${String(count + 1).padStart(4, "0")}`;
};

const list = async (req) => {
  const tenantId = getTenantId(req);
  const { search, status, priority, product_id, page = 1, limit = 50 } = req.query;

  const where = { deleted_at: null };
  if (tenantId) where.tenant_id = tenantId;
  if (status) where.status = status;
  if (priority) where.priority = priority;
  if (product_id) where.product_id = parseInt(product_id);
  if (search) where.mo_number = { [Op.iLike]: `%${search}%` };

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { count, rows } = await ManufacturingOrder.findAndCountAll({
    where,
    include: [
      { model: Product, as: "product", attributes: ["id", "name", "sku"] },
      { model: BomHeader, as: "bom", attributes: ["id", "name", "version"] },
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

  const mo = await ManufacturingOrder.findOne({
    where,
    include: [
      { model: Product, as: "product", attributes: ["id", "name", "sku"] },
      { model: BomHeader, as: "bom", attributes: ["id", "name", "version", "total_unit_cost"] },
      {
        model: WorkOrder,
        as: "workOrders",
        required: false,
        where: { deleted_at: null },
      },
    ],
  });

  if (!mo) {
    const err = new Error("Manufacturing Order not found");
    err.statusCode = 404;
    throw err;
  }
  return mo;
};

const create = async (data, req) => {
  const tenantId = getTenantId(req);
  const mo_number = await generateMoNumber(tenantId);
  return await ManufacturingOrder.create({ ...data, mo_number, tenant_id: tenantId });
};

const update = async (id, data, req) => {
  const mo = await getById(id, req);
  return await mo.update(data);
};

const updateStatus = async (id, status, req) => {
  const mo = await getById(id, req);
  const update = { status };
  if (status === "in_progress" && !mo.actual_start) update.actual_start = new Date();
  if (status === "completed" && !mo.actual_end) update.actual_end = new Date();
  return await mo.update(update);
};

const remove = async (id, req) => {
  const mo = await getById(id, req);
  await mo.update({ deleted_at: new Date() });
  return { message: "Manufacturing Order deleted" };
};

module.exports = { list, getById, create, update, updateStatus, remove };
