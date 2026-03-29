"use strict";
const { Op } = require("sequelize");
const db = require("../../models/index.js");
const { QcTemplate, QcCheck, WorkOrder, Product, BomRouting } = db;

const getTenantId = (req) => req.tenantId || req.user?.tenant_id || null;

// ── QC Templates ──────────────────────────────────────────────────────────────

const listTemplates = async (req) => {
  const tenantId = getTenantId(req);
  const { search, status } = req.query;
  const where = { deleted_at: null };
  if (tenantId) where.tenant_id = tenantId;
  if (status) where.status = status;
  if (search) where.name = { [Op.iLike]: `%${search}%` };

  const rows = await QcTemplate.findAll({
    where,
    include: [{ model: Product, as: "product", attributes: ["id", "product_name"], required: false }],
    order: [["name", "ASC"]],
  });
  return rows;
};

const getTemplateById = async (id, req) => {
  const tenantId = getTenantId(req);
  const where = { id, deleted_at: null };
  if (tenantId) where.tenant_id = tenantId;
  const tpl = await QcTemplate.findOne({ where });
  if (!tpl) { const e = new Error("QC Template not found"); e.statusCode = 404; throw e; }
  return tpl;
};

const createTemplate = async (data, req) => {
  const tenantId = getTenantId(req);
  return QcTemplate.create({ ...data, tenant_id: tenantId });
};

const updateTemplate = async (id, data, req) => {
  const tpl = await getTemplateById(id, req);
  return tpl.update(data);
};

const removeTemplate = async (id, req) => {
  const tpl = await getTemplateById(id, req);
  await tpl.update({ deleted_at: new Date() });
  return { message: "QC Template deleted" };
};

// ── QC Checks (Inspections) ──────────────────────────────────────────────────

const listChecks = async (req) => {
  const tenantId = getTenantId(req);
  const { work_order_id, result: resultFilter, page = 1, limit = 50 } = req.query;
  const where = {};
  if (tenantId) where.tenant_id = tenantId;
  if (work_order_id) where.work_order_id = parseInt(work_order_id);
  if (resultFilter) where.result = resultFilter;

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { count, rows } = await QcCheck.findAndCountAll({
    where,
    include: [
      { model: WorkOrder, as: "workOrder", attributes: ["id", "wo_number", "status"] },
      { model: QcTemplate, as: "qcTemplate", attributes: ["id", "name"], required: false },
    ],
    order: [["checked_at", "DESC"]],
    limit: parseInt(limit),
    offset,
  });
  return { total: count, page: parseInt(page), limit: parseInt(limit), data: rows };
};

const getCheckById = async (id, req) => {
  const tenantId = getTenantId(req);
  const where = { id };
  if (tenantId) where.tenant_id = tenantId;
  const check = await QcCheck.findOne({
    where,
    include: [
      { model: WorkOrder, as: "workOrder" },
      { model: QcTemplate, as: "qcTemplate", required: false },
    ],
  });
  if (!check) { const e = new Error("QC Check not found"); e.statusCode = 404; throw e; }
  return check;
};

const createCheck = async (data, req) => {
  const tenantId = getTenantId(req);
  const checked_at = data.checked_at || new Date();

  // Auto-determine result from quantities if not provided
  let result = data.result;
  if (!result && data.qty_inspected > 0) {
    if (data.qty_failed === 0) result = "pass";
    else if (data.qty_passed === 0) result = "fail";
    else result = "partial";
  }

  const check = await QcCheck.create({ ...data, result, checked_at, tenant_id: tenantId });

  // Update the Work Order status based on QC result
  if (data.work_order_id) {
    const wo = await WorkOrder.findByPk(data.work_order_id);
    if (wo) {
      if (result === "pass") await wo.update({ status: "qc_passed" });
      else if (result === "fail") await wo.update({ status: "rejected" });
    }
  }

  return check;
};

const updateCheck = async (id, data, req) => {
  const check = await getCheckById(id, req);
  return check.update(data);
};

module.exports = {
  listTemplates, getTemplateById, createTemplate, updateTemplate, removeTemplate,
  listChecks, getCheckById, createCheck, updateCheck,
};
