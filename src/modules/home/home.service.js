"use strict";

const { Op, fn, col } = require("sequelize");
const { getTenantModels } = require("../tenant/tenantModels.js");

/** Placeholder pipeline keys kept for legacy dashboard widgets; values are zeroed. */
const STAGE_KEYS = [
  "estimate_generated",
  "estimate_paid",
  "planner",
  "delivery",
  "fabrication",
  "installation",
  "netmeter_apply",
  "netmeter_installed",
  "subsidy_claim",
  "subsidy_disbursed",
  "order_completed",
];

function emptyStageBreakdown() {
  return STAGE_KEYS.map((current_stage_key) => ({
    current_stage_key,
    count: 0,
    total_capacity_kw: 0,
    total_project_cost: 0,
  }));
}

async function safeSum(model, where, sumCol) {
  if (!model || !sumCol) return 0;
  try {
    const row = await model.findOne({
      where,
      attributes: [[fn("COALESCE", fn("SUM", col(sumCol)), 0), "total"]],
      raw: true,
    });
    return Number(row?.total || 0);
  } catch {
    return 0;
  }
}

async function safeCount(model, where) {
  if (!model?.count) return 0;
  try {
    return await model.count({ where });
  } catch {
    return 0;
  }
}

async function getDashboardKpis() {
  const models = getTenantModels();
  const { B2BSalesOrder, ManufacturingOrder, WorkOrder } = models;

  const activeSoWhere = {
    deleted_at: null,
    status: { [Op.in]: ["DRAFT", "CONFIRMED"] },
  };
  const activeCount = await safeCount(B2BSalesOrder, activeSoWhere);
  const activeValue = await safeSum(B2BSalesOrder, activeSoWhere, "grand_total");

  const openMoWhere = {
    deleted_at: null,
    status: { [Op.notIn]: ["completed", "cancelled"] },
  };
  const openMoCount = await safeCount(ManufacturingOrder, openMoWhere);
  const moPlannedQty = await safeSum(ManufacturingOrder, openMoWhere, "planned_qty");

  const openWoWhere = {
    deleted_at: null,
    status: { [Op.notIn]: ["completed", "rejected"] },
  };
  const openWoCount = await safeCount(WorkOrder, openWoWhere);

  // "Capacity" strip on the legacy dashboard: use open MO planned qty as a volume proxy (not kW).
  const totalCapacityProxy = Number(moPlannedQty || 0) + Number(openWoCount || 0);

  return {
    active: {
      total_orders: activeCount + openMoCount,
      total_project_cost: activeValue,
      total_capacity_kw: totalCapacityProxy,
    },
    completed: {
      total_orders: 0,
      total_project_cost: 0,
      total_capacity_kw: await safeCount(ManufacturingOrder, { deleted_at: null, status: "completed" }),
    },
    by_stage: emptyStageBreakdown(),
    by_delivery_status: [
      { delivery_status: "partial", count: 0 },
      { delivery_status: "complete", count: 0 },
    ],
    red_flag_payment_outstanding: 0,
  };
}

function getDashboardPipeline() {
  return {
    by_stage: emptyStageBreakdown(),
    by_delivery_status: [
      { delivery_status: "partial", count: 0 },
      { delivery_status: "complete", count: 0 },
    ],
  };
}

function getDashboardTrend() {
  return { points: [] };
}

async function listDashboardOrders({ page = 1, limit = 20 } = {}) {
  const models = getTenantModels();
  const { B2BSalesOrder, B2BClient, CompanyWarehouse } = models;
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.max(1, parseInt(limit, 10) || 20);
  const offset = (p - 1) * l;

  if (!B2BSalesOrder) {
    return {
      data: [],
      meta: { total: 0, page: p, limit: l, pages: 0 },
    };
  }

  try {
    const { count, rows } = await B2BSalesOrder.findAndCountAll({
      where: { deleted_at: null },
      include: [
        { model: B2BClient, as: "client", attributes: ["id", "client_name"], required: false },
        { model: CompanyWarehouse, as: "plannedWarehouse", attributes: ["id", "name"], required: false },
      ],
      order: [["order_date", "DESC"], ["id", "DESC"]],
      limit: l,
      offset,
      distinct: true,
    });

    const data = (rows || []).map((r) => {
      const j = r.toJSON ? r.toJSON() : r;
      return {
        id: j.id,
        order_number: j.order_no,
        customer_name: j.client?.client_name || null,
        branch_name: j.plannedWarehouse?.name || "—",
        capacity: null,
        project_cost: j.grand_total != null ? Number(j.grand_total) : null,
        current_stage_key: j.status,
        delivery_status: "pending",
        order_date: j.order_date,
        estimate_due_date: j.order_date,
      };
    });

    return {
      data,
      meta: {
        total: count,
        page: p,
        limit: l,
        pages: l > 0 ? Math.ceil(count / l) : 0,
      },
    };
  } catch {
    return {
      data: [],
      meta: { total: 0, page: p, limit: l, pages: 0 },
    };
  }
}

module.exports = {
  getDashboardKpis,
  getDashboardPipeline,
  getDashboardTrend,
  listDashboardOrders,
};
