"use strict";
const { Op } = require("sequelize");
const db = require("../../models/index.js");
const { BomHeader, BomComponent, BomRouting, WorkCenter, Product, CostSheet } = db;

const getTenantId = (req) => req.tenantId || req.user?.tenant_id || null;

/** Auto-compute the cost sheet for a BOM */
const computeBomCost = async (bom, overheadPct) => {
  const components = await BomComponent.findAll({ where: { bom_id: bom.id } });
  const routings = await BomRouting.findAll({
    where: { bom_id: bom.id },
    include: [{ model: WorkCenter, as: "workCenter" }],
  });

  const componentBreakdown = [];
  let materialCost = 0;

  for (const c of components) {
    const effectiveQty = parseFloat(c.qty) * (1 + parseFloat(c.scrap_pct || 0) / 100);
    const lineCost = effectiveQty * parseFloat(c.cost_per_unit || 0);
    materialCost += lineCost;
    componentBreakdown.push({
      component_product_id: c.component_product_id,
      qty: c.qty,
      uom: c.uom,
      scrap_pct: c.scrap_pct,
      cost_per_unit: c.cost_per_unit,
      total_cost: lineCost,
    });
  }

  const routingBreakdown = [];
  let laborCost = 0;

  for (const r of routings) {
    const ratePerHour = r.workCenter ? parseFloat(r.workCenter.cost_per_hour || 0) : 0;
    const lineCost = parseFloat(r.duration_hrs || 0) * ratePerHour;
    laborCost += lineCost;
    // Update labor_cost on the routing row itself
    await r.update({ labor_cost: lineCost });
    routingBreakdown.push({
      step_name: r.step_name,
      work_center_id: r.work_center_id,
      duration_hrs: r.duration_hrs,
      cost_per_hour: ratePerHour,
      total_cost: lineCost,
    });
  }

  const pct = parseFloat(overheadPct || bom.overhead_pct || 0);
  const overheadCost = materialCost * pct / 100;
  const totalUnitCost = materialCost + laborCost + overheadCost;

  // Upsert cost sheet
  const [costSheet] = await CostSheet.findOrCreate({
    where: { bom_id: bom.id },
    defaults: {
      bom_id: bom.id,
      material_cost: 0,
      labor_cost: 0,
      overhead_pct: pct,
      overhead_cost: 0,
      total_unit_cost: 0,
      computed_at: new Date(),
      tenant_id: bom.tenant_id,
    },
  });

  await costSheet.update({
    material_cost: materialCost,
    labor_cost: laborCost,
    overhead_pct: pct,
    overhead_cost: overheadCost,
    total_unit_cost: totalUnitCost,
    component_breakdown: componentBreakdown,
    routing_breakdown: routingBreakdown,
    computed_at: new Date(),
  });

  // Also update summary fields on BOM header
  await bom.update({
    total_material_cost: materialCost,
    total_labor_cost: laborCost,
    overhead_pct: pct,
    total_unit_cost: totalUnitCost,
  });

  return costSheet;
};

const list = async (req) => {
  const tenantId = getTenantId(req);
  const { search, status, product_id, page = 1, limit = 50 } = req.query;

  const where = { deleted_at: null };
  if (tenantId) where.tenant_id = tenantId;
  if (status) where.status = status;
  if (product_id) where.product_id = parseInt(product_id);
  if (search) where.name = { [Op.iLike]: `%${search}%` };

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { count, rows } = await BomHeader.findAndCountAll({
    where,
    include: [
      { model: Product, as: "product", attributes: ["id", "name", "sku"] },
      { model: CostSheet, as: "costSheet", required: false },
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

  const bom = await BomHeader.findOne({
    where,
    include: [
      { model: Product, as: "product", attributes: ["id", "name", "sku"] },
      {
        model: BomComponent,
        as: "components",
        include: [{ model: Product, as: "componentProduct", attributes: ["id", "name", "sku"] }],
        order: [["sequence_no", "ASC"]],
      },
      {
        model: BomRouting,
        as: "routings",
        include: [{ model: WorkCenter, as: "workCenter", attributes: ["id", "name", "code", "cost_per_hour"] }],
        order: [["sequence_no", "ASC"]],
      },
      { model: CostSheet, as: "costSheet", required: false },
    ],
  });

  if (!bom) {
    const err = new Error("BOM not found");
    err.statusCode = 404;
    throw err;
  }
  return bom;
};

const create = async (data, req) => {
  const tenantId = getTenantId(req);
  const { components = [], routings = [], overhead_pct = 0, ...headerData } = data;

  // If marking as default, unset others first
  if (headerData.is_default) {
    await BomHeader.update(
      { is_default: false },
      { where: { product_id: headerData.product_id, tenant_id: tenantId, deleted_at: null } }
    );
  }

  const bom = await BomHeader.create({ ...headerData, tenant_id: tenantId, overhead_pct });

  if (components.length) {
    await BomComponent.bulkCreate(components.map((c, i) => ({ ...c, bom_id: bom.id, sequence_no: c.sequence_no ?? (i + 1) * 10 })));
  }
  if (routings.length) {
    await BomRouting.bulkCreate(routings.map((r, i) => ({ ...r, bom_id: bom.id, sequence_no: r.sequence_no ?? (i + 1) * 10 })));
  }

  // Compute cost
  await computeBomCost(bom, overhead_pct);

  return getById(bom.id, req);
};

const update = async (id, data, req) => {
  const bom = await getById(id, req);
  const { components, routings, overhead_pct, ...headerData } = data;

  if (headerData.is_default) {
    await BomHeader.update(
      { is_default: false },
      { where: { product_id: bom.product_id, tenant_id: bom.tenant_id, deleted_at: null, id: { [Op.ne]: id } } }
    );
  }

  await bom.update({ ...headerData, ...(overhead_pct !== undefined ? { overhead_pct } : {}) });

  if (components !== undefined) {
    await BomComponent.destroy({ where: { bom_id: id } });
    if (components.length) {
      await BomComponent.bulkCreate(components.map((c, i) => ({ ...c, bom_id: id, sequence_no: c.sequence_no ?? (i + 1) * 10 })));
    }
  }
  if (routings !== undefined) {
    await BomRouting.destroy({ where: { bom_id: id } });
    if (routings.length) {
      await BomRouting.bulkCreate(routings.map((r, i) => ({ ...r, bom_id: id, sequence_no: r.sequence_no ?? (i + 1) * 10 })));
    }
  }

  await computeBomCost(bom, overhead_pct ?? bom.overhead_pct);
  return getById(id, req);
};

const cloneVersion = async (id, req) => {
  const original = await getById(id, req);
  const tenantId = getTenantId(req);

  // Increment version string
  const versionParts = (original.version || "1.0").split(".");
  versionParts[versionParts.length - 1] = String(parseInt(versionParts[versionParts.length - 1]) + 1);
  const newVersion = versionParts.join(".");

  const clonedBom = await BomHeader.create({
    product_id: original.product_id,
    version: newVersion,
    name: `${original.name} (v${newVersion})`,
    status: "draft",
    is_default: false,
    uom: original.uom,
    standard_qty: original.standard_qty,
    notes: original.notes,
    overhead_pct: original.overhead_pct,
    tenant_id: tenantId,
  });

  const origComponents = await BomComponent.findAll({ where: { bom_id: id } });
  if (origComponents.length) {
    await BomComponent.bulkCreate(origComponents.map((c) => ({
      bom_id: clonedBom.id,
      component_product_id: c.component_product_id,
      qty: c.qty,
      uom: c.uom,
      is_sub_assembly: c.is_sub_assembly,
      scrap_pct: c.scrap_pct,
      cost_per_unit: c.cost_per_unit,
      sequence_no: c.sequence_no,
      notes: c.notes,
    })));
  }

  const origRoutings = await BomRouting.findAll({ where: { bom_id: id } });
  if (origRoutings.length) {
    await BomRouting.bulkCreate(origRoutings.map((r) => ({
      bom_id: clonedBom.id,
      step_name: r.step_name,
      work_center_id: r.work_center_id,
      duration_hrs: r.duration_hrs,
      sequence_no: r.sequence_no,
      is_qc_required: r.is_qc_required,
      notes: r.notes,
    })));
  }

  await computeBomCost(clonedBom, clonedBom.overhead_pct);
  return getById(clonedBom.id, req);
};

const remove = async (id, req) => {
  const bom = await getById(id, req);
  await bom.update({ deleted_at: new Date() });
  return { message: "BOM deleted" };
};

module.exports = { list, getById, create, update, remove, cloneVersion, computeBomCost };
