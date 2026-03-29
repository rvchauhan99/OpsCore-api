"use strict";

const b2bClientsService = require("../b2bClients/b2bClients.service.js");
const productService = require("../product/product.service.js");
const supplierService = require("../supplier/supplier.service.js");
const purchaseOrderService = require("../purchaseOrder/purchaseOrder.service.js");
const b2bSalesQuotesService = require("../b2bSalesQuotes/b2bSalesQuotes.service.js");
const b2bSalesOrdersService = require("../b2bSalesOrders/b2bSalesOrders.service.js");

const MIN_Q_LEN = 2;
const DEFAULT_PER_MODULE = 25;
const DEFAULT_MAX_TOTAL = 100;

function ts(row) {
  const u = row.updated_at || row.sort_at;
  const c = row.created_at || row.reference_date;
  const t = u || c;
  if (!t) return 0;
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}

function asJson(row) {
  if (!row) return null;
  return typeof row.toJSON === "function" ? row.toJSON() : row;
}

function baseHit({
  entityType,
  entity_label,
  id,
  pui,
  status = "",
  customer_name = "",
  mobile_number = "",
  address = "",
  scheme = null,
  reference_date = null,
  order_date = null,
  detail_path,
  updated_at = null,
  created_at = null,
}) {
  return {
    entityType,
    entity_label,
    id,
    pui: pui != null ? String(pui) : String(id),
    status,
    customer_name,
    mobile_number,
    address,
    consumer_no: null,
    application_no: null,
    guvnl_no: null,
    scheme,
    inquiry_or_lead_date: reference_date,
    order_date,
    netmeter_installed_on: null,
    detail_path,
    updated_at,
    created_at,
    sort_at: ts({ updated_at, created_at, sort_at: updated_at || created_at, reference_date }),
  };
}

function normalizeB2bClientRow(row) {
  const r = asJson(row);
  return baseHit({
    entityType: "b2b_client",
    entity_label: "B2B client",
    id: r.id,
    pui: r.client_code || r.id,
    status: r.is_active === false ? "inactive" : "active",
    customer_name: r.client_name || "",
    mobile_number: r.phone || "",
    address: [r.billing_address, r.billing_city, r.billing_state].filter(Boolean).join(", ") || "",
    scheme: r.gstin || null,
    reference_date: r.created_at || null,
    detail_path: `/b2b-clients`,
    updated_at: r.updated_at || null,
    created_at: r.created_at || null,
  });
}

function normalizeProductRow(row) {
  const r = typeof row === "object" && "product_name" in row ? row : asJson(row);
  return baseHit({
    entityType: "product",
    entity_label: "Product",
    id: r.id,
    pui: r.product_name || r.id,
    status: r.is_active === false ? "inactive" : "active",
    customer_name: r.product_name || "",
    mobile_number: "",
    address: "",
    scheme: r.hsn_ssn_code || null,
    reference_date: r.created_at || null,
    detail_path: `/product`,
    updated_at: r.updated_at || null,
    created_at: r.created_at || null,
  });
}

function normalizeSupplierRow(row) {
  const r = typeof row === "object" && "supplier_code" in row ? row : asJson(row);
  return baseHit({
    entityType: "supplier",
    entity_label: "Supplier",
    id: r.id,
    pui: r.supplier_code || r.id,
    status: r.is_active === false ? "inactive" : "active",
    customer_name: r.supplier_name || "",
    mobile_number: r.phone || "",
    address: [r.address, r.city, r.state_name].filter(Boolean).join(", ") || "",
    scheme: r.gstin || null,
    reference_date: r.created_at || null,
    detail_path: `/supplier`,
    updated_at: r.updated_at || null,
    created_at: r.created_at || null,
  });
}

function normalizePurchaseOrderRow(row) {
  const r = typeof row === "object" && "po_number" in row ? row : asJson(row);
  return baseHit({
    entityType: "purchase_order",
    entity_label: "Purchase order",
    id: r.id,
    pui: r.po_number || r.id,
    status: r.status || "",
    customer_name: r.supplier?.supplier_name || r.supplier_name || "",
    mobile_number: r.supplier?.phone || "",
    address: r.supplier?.address || r.ship_to_name || "",
    scheme: r.bill_to?.company_name || null,
    reference_date: r.po_date || r.created_at || null,
    order_date: r.po_date || null,
    detail_path: `/purchase-orders`,
    updated_at: r.updated_at || null,
    created_at: r.created_at || null,
  });
}

function normalizeB2bQuoteRow(row) {
  const r = asJson(row);
  return baseHit({
    entityType: "b2b_sales_quote",
    entity_label: "B2B sales quote",
    id: r.id,
    pui: r.quote_no || r.id,
    status: r.status || "",
    customer_name: r.client?.client_name || "",
    mobile_number: "",
    address: r.shipTo ? [r.shipTo.address, r.shipTo.city].filter(Boolean).join(", ") : "",
    scheme: r.client?.client_code || null,
    reference_date: r.quote_date || r.created_at || null,
    detail_path: `/b2b-sales-quotes/edit?id=${r.id}`,
    updated_at: r.updated_at || null,
    created_at: r.created_at || null,
  });
}

function normalizeB2bOrderRow(row) {
  const r = asJson(row);
  return baseHit({
    entityType: "b2b_sales_order",
    entity_label: "B2B sales order",
    id: r.id,
    pui: r.order_no || r.id,
    status: r.status || "",
    customer_name: r.client?.client_name || "",
    mobile_number: "",
    address: r.shipTo?.ship_to_name || "",
    scheme: r.client?.client_code || null,
    reference_date: r.order_date || r.created_at || null,
    order_date: r.order_date || null,
    detail_path: `/b2b-sales-orders/edit?id=${r.id}`,
    updated_at: r.updated_at || null,
    created_at: r.created_at || null,
  });
}

async function runGlobalSearch(req, { q, perModuleLimit, maxTotal }) {
  void req;
  const trimmed = (q || "").trim();
  if (trimmed.length < MIN_Q_LEN) {
    const err = new Error(`Search text must be at least ${MIN_Q_LEN} characters`);
    err.statusCode = 400;
    throw err;
  }

  const limitEach = Math.min(
    Math.max(1, parseInt(perModuleLimit, 10) || DEFAULT_PER_MODULE),
    50
  );
  const cap = Math.min(
    Math.max(1, parseInt(maxTotal, 10) || DEFAULT_MAX_TOTAL),
    200
  );

  const jobs = [
    (async () => {
      const result = await b2bClientsService.listClients({
        page: 1,
        limit: limitEach,
        q: trimmed,
        sortBy: "updated_at",
        sortOrder: "DESC",
      });
      return (result?.data || []).map(normalizeB2bClientRow);
    })(),
    (async () => {
      const result = await productService.listProducts({
        page: 1,
        limit: limitEach,
        q: trimmed,
        sortBy: "updated_at",
        sortOrder: "DESC",
        visibility: "all",
      });
      return (result?.data || []).map(normalizeProductRow);
    })(),
    (async () => {
      const result = await supplierService.listSuppliers({
        page: 1,
        limit: limitEach,
        q: trimmed,
        sortBy: "updated_at",
        sortOrder: "DESC",
        visibility: "all",
      });
      return (result?.data || []).map(normalizeSupplierRow);
    })(),
    (async () => {
      const result = await purchaseOrderService.listPurchaseOrders({
        page: 1,
        limit: limitEach,
        q: trimmed,
        status: null,
        include_closed: true,
        sortBy: "updated_at",
        sortOrder: "DESC",
      });
      return (result?.data || []).map(normalizePurchaseOrderRow);
    })(),
    (async () => {
      const result = await b2bSalesQuotesService.listQuotes({
        page: 1,
        limit: limitEach,
        q: trimmed,
        sortBy: "updated_at",
        sortOrder: "DESC",
      });
      return (result?.data || []).map(normalizeB2bQuoteRow);
    })(),
    (async () => {
      const result = await b2bSalesOrdersService.listOrders({
        page: 1,
        limit: limitEach,
        q: trimmed,
        sortBy: "updated_at",
        sortOrder: "DESC",
      });
      return (result?.data || []).map(normalizeB2bOrderRow);
    })(),
  ];

  const settled = await Promise.allSettled(jobs);
  const chunks = [];
  const countsByEntity = {
    b2b_client: 0,
    product: 0,
    supplier: 0,
    purchase_order: 0,
    b2b_sales_quote: 0,
    b2b_sales_order: 0,
  };

  for (const s of settled) {
    if (s.status === "fulfilled" && Array.isArray(s.value)) {
      for (const row of s.value) {
        chunks.push(row);
        if (countsByEntity[row.entityType] != null) {
          countsByEntity[row.entityType] += 1;
        }
      }
    }
  }

  chunks.sort((a, b) => (b.sort_at || 0) - (a.sort_at || 0));
  const items = chunks.slice(0, cap).map((row) => {
    const { sort_at, ...rest } = row;
    return rest;
  });

  return {
    items,
    meta: {
      q: trimmed,
      per_module_limit: limitEach,
      max_total: cap,
      counts_by_entity: countsByEntity,
      merged_count: chunks.length,
      returned_count: items.length,
    },
  };
}

module.exports = {
  runGlobalSearch,
  MIN_Q_LEN,
};
