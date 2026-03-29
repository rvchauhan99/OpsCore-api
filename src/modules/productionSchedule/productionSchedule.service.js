"use strict";
const { Op } = require("sequelize");
const db = require("../../models/index.js");
const { ProductionScheduleEntry, ManufacturingOrder, WorkCenter } = db;

const getTenantId = (req) => req.tenantId || req.user?.tenant_id || null;

const list = async (req) => {
  const tenantId = getTenantId(req);
  let { from_date, to_date, work_center_id } = req.query;

  const where = { deleted_at: null };
  if (tenantId != null) where.tenant_id = tenantId;
  if (!from_date && !to_date) {
    const end = new Date();
    const start = new Date();
    start.setUTCDate(start.getUTCDate() - 30);
    from_date = start.toISOString().slice(0, 10);
    to_date = end.toISOString().slice(0, 10);
  }
  if (from_date && to_date) {
    where.scheduled_date = { [Op.between]: [from_date, to_date] };
  } else if (from_date) {
    where.scheduled_date = { [Op.gte]: from_date };
  } else if (to_date) {
    where.scheduled_date = { [Op.lte]: to_date };
  }
  if (work_center_id) where.work_center_id = parseInt(work_center_id, 10);

  const rows = await ProductionScheduleEntry.findAll({
    where,
    include: [
      {
        model: ManufacturingOrder,
        as: "manufacturingOrder",
        required: false,
        attributes: ["id", "mo_number", "status", "planned_qty"],
      },
      { model: WorkCenter, as: "workCenter", required: false, attributes: ["id", "name", "code"] },
    ],
    order: [
      ["scheduled_date", "ASC"],
      ["id", "ASC"],
    ],
  });

  return { data: rows };
};

const create = async (data, req) => {
  const tenantId = getTenantId(req);
  return ProductionScheduleEntry.create({
    manufacturing_order_id: data.manufacturing_order_id || null,
    work_center_id: data.work_center_id || null,
    scheduled_date: data.scheduled_date,
    hours_planned: data.hours_planned != null ? data.hours_planned : 0,
    status: data.status || "planned",
    notes: data.notes || null,
    tenant_id: tenantId,
  });
};

const update = async (id, data, req) => {
  const tenantId = getTenantId(req);
  const where = { id, deleted_at: null };
  if (tenantId != null) where.tenant_id = tenantId;
  const row = await ProductionScheduleEntry.findOne({ where });
  if (!row) {
    const err = new Error("Schedule entry not found");
    err.statusCode = 404;
    throw err;
  }
  await row.update({
    manufacturing_order_id: data.manufacturing_order_id !== undefined ? data.manufacturing_order_id : row.manufacturing_order_id,
    work_center_id: data.work_center_id !== undefined ? data.work_center_id : row.work_center_id,
    scheduled_date: data.scheduled_date ?? row.scheduled_date,
    hours_planned: data.hours_planned !== undefined ? data.hours_planned : row.hours_planned,
    status: data.status ?? row.status,
    notes: data.notes !== undefined ? data.notes : row.notes,
  });
  return row;
};

const remove = async (id, req) => {
  const tenantId = getTenantId(req);
  const where = { id, deleted_at: null };
  if (tenantId != null) where.tenant_id = tenantId;
  const row = await ProductionScheduleEntry.findOne({ where });
  if (!row) {
    const err = new Error("Schedule entry not found");
    err.statusCode = 404;
    throw err;
  }
  await row.destroy();
  return { message: "Schedule entry removed" };
};

module.exports = { list, create, update, remove };
