"use strict";
const { Op } = require("sequelize");
const db = require("../../models/index.js");
const {
  ManufacturingOrder,
  BomHeader,
  Product,
  WorkOrder,
  B2BSalesOrder,
  B2BSalesOrderItem,
} = db;

const getTenantId = (req) => req.tenantId || req.user?.tenant_id || null;

const productIncludeLite = { model: Product, as: "product", attributes: ["id", "product_name", "barcode_number"] };

const generateMoNumber = async (tenantId) => {
  const year = new Date().getFullYear();
  const count = await ManufacturingOrder.count({ where: { tenant_id: tenantId } });
  return `MO-${year}-${String(count + 1).padStart(4, "0")}`;
};

const findDefaultBomForProduct = async (productId, tenantId) => {
  const where = {
    product_id: productId,
    status: "active",
    is_default: true,
    deleted_at: null,
  };
  if (tenantId != null) where.tenant_id = tenantId;
  return BomHeader.findOne({ where, order: [["id", "DESC"]] });
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
      productIncludeLite,
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
      productIncludeLite,
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

/**
 * Create one MO per B2B sales order line (or a subset via item_ids). Uses default active BOM when present.
 */
const createFromB2bSalesOrder = async (salesOrderId, body, req) => {
  const tenantId = getTenantId(req);
  const itemIds = Array.isArray(body?.b2b_sales_order_item_ids)
    ? body.b2b_sales_order_item_ids.map((x) => parseInt(x, 10)).filter((n) => !Number.isNaN(n))
    : null;

  const so = await B2BSalesOrder.findOne({
    where: { id: salesOrderId, deleted_at: null },
    include: [
      {
        model: B2BSalesOrderItem,
        as: "items",
        required: false,
        where: { deleted_at: null },
        include: [{ model: Product, as: "product", attributes: ["id", "product_name"], required: false }],
      },
    ],
  });

  if (!so) {
    const err = new Error("B2B Sales Order not found");
    err.statusCode = 404;
    throw err;
  }

  if (!["CONFIRMED", "CLOSED"].includes(String(so.status || "").toUpperCase())) {
    const err = new Error("Sales order must be confirmed or closed to create manufacturing orders");
    err.statusCode = 400;
    throw err;
  }

  let lines = so.items || [];
  if (itemIds?.length) {
    lines = lines.filter((l) => itemIds.includes(l.id));
  }
  if (!lines.length) {
    const err = new Error("No line items to manufacture");
    err.statusCode = 400;
    throw err;
  }

  const created = [];
  const notesBase = `From B2B SO ${so.order_no || so.id}`;

  for (const line of lines) {
    const qty = Number(line.quantity || 0);
    if (qty <= 0) continue;

    const dup = await ManufacturingOrder.findOne({
      where: { b2b_sales_order_item_id: line.id, deleted_at: null },
    });
    if (dup) {
      created.push({ item_id: line.id, skipped: true, reason: "MO already exists for this line", manufacturing_order_id: dup.id });
      continue;
    }

    const bom = await findDefaultBomForProduct(line.product_id, tenantId);
    const mo_number = await generateMoNumber(tenantId);
    const mo = await ManufacturingOrder.create({
      mo_number,
      sales_order_id: so.id,
      b2b_sales_order_item_id: line.id,
      product_id: line.product_id,
      bom_id: bom ? bom.id : null,
      planned_qty: qty,
      priority: body?.priority || "normal",
      planned_start: body?.planned_start || null,
      planned_end: body?.planned_end || null,
      notes: body?.notes ? `${notesBase} — ${body.notes}` : notesBase,
      tenant_id: tenantId,
      status: "draft",
    });
    created.push({ item_id: line.id, skipped: false, manufacturing_order: mo.toJSON() });
  }

  return { sales_order_id: so.id, order_no: so.order_no, results: created };
};

module.exports = { list, getById, create, update, updateStatus, remove, createFromB2bSalesOrder };
