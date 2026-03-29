const { Router } = require("express");
const db = require("../models/index.js");
const { requireAuthWithTenant } = require("../common/middlewares/auth.js");
const {
  requireModulePermissionByMethod,
  requireModulePermissionAnyByMethod,
  STOCK_API_CONSUMER_ROUTES,
} = require("../common/middlewares/modulePermission.js");

// ── Core & Admin ──────────────────────────────────────────────────────────────
const globalSearchRoutes = require("../modules/globalSearch/globalSearch.routes.js");
const authRoutes = require("../modules/auth/auth.routes.js");
const moduleMasterRoutes = require("../modules/moduleMaster/moduleMaster.routes.js");
const roleMasterRoutes = require("../modules/roleMaster/roleMaster.routes.js");
const roleModuleRoutes = require("../modules/roleModule/roleModule.routes.js");
const roleModulePermissionRoutes = require("../modules/roleModule/roleModule.permission.routes.js");
const userMasterRoutes = require("../modules/userMaster/userMaster.routes.js");
const mastersRoutes = require("../modules/masters/masters.routes.js");
const companyMasterRoutes = require("../modules/companyMaster/companyMaster.routes.js");
const adminRoutes = require("../modules/admin/admin.routes.js");
const notificationRoutes = require("../modules/notification/notification.routes.js");
const configMasterRoutes = require("../modules/config-master/configMaster.routes.js");
const homeRoutes = require("../modules/home/home.routes.js");

// ── Products & Inventory ──────────────────────────────────────────────────────
const productRoutes = require("../modules/product/product.routes.js");
const supplierRoutes = require("../modules/supplier/supplier.routes.js");
const purchaseOrderRoutes = require("../modules/purchaseOrder/purchaseOrder.routes.js");
const poInwardRoutes = require("../modules/poInward/poInward.routes.js");
const purchaseReturnRoutes = require("../modules/purchaseReturn/purchaseReturn.routes.js");
const stockRoutes = require("../modules/stock/stock.routes.js");
const inventoryLedgerRoutes = require("../modules/inventoryLedger/inventoryLedger.routes.js");
const stockTransferRoutes = require("../modules/stockTransfer/stockTransfer.routes.js");
const stockAdjustmentRoutes = require("../modules/stockAdjustment/stockAdjustment.routes.js");
const serialMasterRoutes = require("../modules/serialMaster/serialMaster.routes.js");

// ── B2B Sales ──────────────────────────────────────────────────────────────────
const b2bClientsRoutes = require("../modules/b2bClients/b2bClients.routes.js");
const b2bSalesQuotesRoutes = require("../modules/b2bSalesQuotes/b2bSalesQuotes.routes.js");
const b2bSalesOrdersRoutes = require("../modules/b2bSalesOrders/b2bSalesOrders.routes.js");
const b2bShipmentsRoutes = require("../modules/b2bShipments/b2bShipments.routes.js");
const b2bInvoicesRoutes = require("../modules/b2bInvoices/b2bInvoices.routes.js");
const challanRoutes = require("../modules/challan/challan.routes.js");
const billingRoutes = require("../modules/billing/billing.routes.js");

// ── Reports ───────────────────────────────────────────────────────────────────
const serializedInventoryReportRoutes = require("../modules/reports/serializedInventory/serializedInventory.routes.js");
const deliveryReportRoutes = require("../modules/reports/deliveryReport/deliveryReport.routes.js");
const paymentsReportRoutes = require("../modules/reports/payments/paymentsReport.routes.js");

// ── Manufacturing ─────────────────────────────────────────────────────────────
const workCenterRoutes = require("../modules/workCenter/workCenter.routes.js");
const bomRoutes = require("../modules/bom/bom.routes.js");
const manufacturingOrderRoutes = require("../modules/manufacturingOrder/manufacturingOrder.routes.js");
const workOrderRoutes = require("../modules/workOrder/workOrder.routes.js");
const qualityControlRoutes = require("../modules/qualityControl/qualityControl.routes.js");
const productionScheduleRoutes = require("../modules/productionSchedule/productionSchedule.routes.js");
const financeReportsRoutes = require("../modules/financeReports/financeReports.routes.js");

const router = Router();

// ── Health Check ──────────────────────────────────────────────────────────────
router.get("/health-check", async (req, res) => {
  try {
    await db.sequelize.authenticate();
    res.status(200).json({
      status: "ok",
      database: "connected",
      message: "OpsCore Manufacturing API is running",
      service: "OpsCore API",
      version: "1.0.0",
    });
  } catch (err) {
    res.status(503).json({
      status: "error",
      database: "disconnected",
      message: err?.message || "Database unavailable",
    });
  }
});

// ── Auth (public) ─────────────────────────────────────────────────────────────
router.use("/auth", authRoutes);
router.use("/role-module", roleModulePermissionRoutes);

// ── Core Admin ────────────────────────────────────────────────────────────────
router.use(
  "/module-master",
  requireAuthWithTenant,
  requireModulePermissionByMethod({ moduleRoute: "/module-master" }),
  moduleMasterRoutes
);
router.use(
  "/role-master",
  requireAuthWithTenant,
  requireModulePermissionByMethod({ moduleRoute: "/role-master" }),
  roleMasterRoutes
);
router.use(
  "/role-module",
  requireAuthWithTenant,
  requireModulePermissionByMethod({ moduleRoute: "/role-module" }),
  roleModuleRoutes
);
router.use("/user-master", requireAuthWithTenant, userMasterRoutes);
router.use("/masters", requireAuthWithTenant, mastersRoutes);
router.use("/company", requireAuthWithTenant, companyMasterRoutes);
router.use("/admin", adminRoutes);
router.use("/notifications", requireAuthWithTenant, notificationRoutes);
router.use("/config-master", configMasterRoutes);
router.use("/home", homeRoutes);

// ── Products & Inventory ──────────────────────────────────────────────────────
router.use("/product", requireAuthWithTenant, productRoutes);
router.use("/supplier", requireAuthWithTenant, supplierRoutes);
router.use(
  "/purchase-orders",
  requireAuthWithTenant,
  requireModulePermissionByMethod({ moduleRoute: "/purchase-orders" }),
  purchaseOrderRoutes
);
router.use(
  "/po-inwards",
  requireAuthWithTenant,
  requireModulePermissionByMethod({ moduleRoute: "/po-inwards" }),
  poInwardRoutes
);
router.use(
  "/purchase-returns",
  requireAuthWithTenant,
  requireModulePermissionByMethod({ moduleRoute: "/purchase-returns" }),
  purchaseReturnRoutes
);
router.use(
  "/stocks",
  requireAuthWithTenant,
  requireModulePermissionAnyByMethod({ moduleRoutes: STOCK_API_CONSUMER_ROUTES }),
  stockRoutes
);
router.use(
  "/inventory-ledger",
  requireAuthWithTenant,
  requireModulePermissionByMethod({ moduleRoute: "/inventory-ledger" }),
  inventoryLedgerRoutes
);
router.use(
  "/stock-transfers",
  requireAuthWithTenant,
  requireModulePermissionByMethod({ moduleRoute: "/stock-transfers" }),
  stockTransferRoutes
);
router.use(
  "/stock-adjustments",
  requireAuthWithTenant,
  requireModulePermissionByMethod({ moduleRoute: "/stock-adjustments" }),
  stockAdjustmentRoutes
);
router.use("/serial-master", requireAuthWithTenant, serialMasterRoutes);

// ── B2B Sales ──────────────────────────────────────────────────────────────────
router.use(
  "/b2b-clients",
  requireAuthWithTenant,
  requireModulePermissionByMethod({ moduleRoute: "/b2b-clients" }),
  b2bClientsRoutes
);
router.use(
  "/b2b-sales-quotes",
  requireAuthWithTenant,
  requireModulePermissionByMethod({ moduleRoute: "/b2b-sales-quotes" }),
  b2bSalesQuotesRoutes
);
router.use(
  "/b2b-sales-orders",
  requireAuthWithTenant,
  requireModulePermissionByMethod({ moduleRoute: "/b2b-sales-orders" }),
  b2bSalesOrdersRoutes
);
router.use(
  "/b2b-shipments",
  requireAuthWithTenant,
  requireModulePermissionByMethod({ moduleRoute: "/b2b-shipments" }),
  b2bShipmentsRoutes
);
router.use(
  "/b2b-invoices",
  requireAuthWithTenant,
  requireModulePermissionByMethod({ moduleRoute: "/b2b-invoices" }),
  b2bInvoicesRoutes
);
router.use(
  "/challan",
  requireAuthWithTenant,
  requireModulePermissionAnyByMethod({ moduleRoutes: ["/b2b-sales-orders", "/delivery-challans"] }),
  challanRoutes
);
router.use(
  "/billing",
  requireAuthWithTenant,
  requireModulePermissionByMethod({ moduleRoute: "/billing" }),
  billingRoutes
);

// ── Reports ───────────────────────────────────────────────────────────────────
router.use(
  "/reports/serialized-inventory",
  requireAuthWithTenant,
  requireModulePermissionAnyByMethod({ moduleRoutes: ["/reports/serialized-inventory", "/stocks"] }),
  serializedInventoryReportRoutes
);
router.use(
  "/reports/deliveries",
  requireAuthWithTenant,
  requireModulePermissionByMethod({ moduleRoute: "/reports/deliveries" }),
  deliveryReportRoutes
);
router.use("/reports/payments", paymentsReportRoutes);

// ── Global Search ─────────────────────────────────────────────────────────────
router.use("/global-search", globalSearchRoutes);

// ── Manufacturing ─────────────────────────────────────────────────────────────
router.use(
  "/work-centers",
  requireAuthWithTenant,
  requireModulePermissionByMethod({ moduleRoute: "/work-centers" }),
  workCenterRoutes
);
router.use(
  "/bill-of-materials",
  requireAuthWithTenant,
  requireModulePermissionByMethod({ moduleRoute: "/bill-of-materials" }),
  bomRoutes
);
router.use(
  "/manufacturing-orders",
  requireAuthWithTenant,
  requireModulePermissionByMethod({ moduleRoute: "/manufacturing-orders" }),
  manufacturingOrderRoutes
);
router.use(
  "/work-orders",
  requireAuthWithTenant,
  requireModulePermissionByMethod({ moduleRoute: "/work-orders" }),
  workOrderRoutes
);
router.use(
  "/quality-control",
  requireAuthWithTenant,
  requireModulePermissionByMethod({ moduleRoute: "/quality-control" }),
  qualityControlRoutes
);
router.use(
  "/production-schedule",
  requireAuthWithTenant,
  requireModulePermissionByMethod({ moduleRoute: "/production-schedule" }),
  productionScheduleRoutes
);
router.use(
  "/finance",
  requireAuthWithTenant,
  requireModulePermissionByMethod({ moduleRoute: "/finance" }),
  financeReportsRoutes
);

router.get("/", (req, res) => res.send("OpsCore API Running ✅"));

module.exports = router;
