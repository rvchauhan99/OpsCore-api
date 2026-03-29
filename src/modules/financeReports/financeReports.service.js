"use strict";
const { Op, fn, col } = require("sequelize");
const db = require("../../models/index.js");
const { B2BSalesOrder, B2BInvoice, ManufacturingOrder } = db;

const getTenantId = (req) => req.tenantId || req.user?.tenant_id || null;

/**
 * Lightweight finance dashboard: B2B order / invoice totals and open MO value proxy.
 */
const summary = async (req) => {
  const tenantId = getTenantId(req);
  const moScope = tenantId != null ? { tenant_id: tenantId, deleted_at: null } : { deleted_at: null };

  const [orderStats] = await B2BSalesOrder.findAll({
    attributes: [
      [fn("COUNT", col("id")), "count"],
      [fn("SUM", col("grand_total")), "grand_total_sum"],
    ],
    where: { deleted_at: null },
    raw: true,
  });

  const ordersByStatus = await B2BSalesOrder.findAll({
    attributes: ["status", [fn("COUNT", col("id")), "count"], [fn("SUM", col("grand_total")), "total"]],
    where: { deleted_at: null },
    group: ["status"],
    raw: true,
  });

  const [invoiceStats] = await B2BInvoice.findAll({
    attributes: [
      [fn("COUNT", col("id")), "count"],
      [fn("SUM", col("grand_total")), "grand_total_sum"],
    ],
    where: { deleted_at: null, cancelled_at: null },
    raw: true,
  });

  const [moOpen] = await ManufacturingOrder.findAll({
    attributes: [[fn("COUNT", col("id")), "count"]],
    where: { ...moScope, status: { [Op.notIn]: ["completed", "cancelled"] } },
    raw: true,
  });

  return {
    b2b_sales_orders: {
      total_count: Number(orderStats?.count || 0),
      grand_total_sum: orderStats?.grand_total_sum != null ? String(orderStats.grand_total_sum) : "0",
      by_status: ordersByStatus.map((r) => ({
        status: r.status,
        count: Number(r.count || 0),
        total: r.total != null ? String(r.total) : "0",
      })),
    },
    b2b_invoices: {
      total_count: Number(invoiceStats?.count || 0),
      grand_total_sum: invoiceStats?.grand_total_sum != null ? String(invoiceStats.grand_total_sum) : "0",
    },
    manufacturing: {
      open_mo_count: Number(moOpen?.count || 0),
    },
  };
};

module.exports = { summary };
