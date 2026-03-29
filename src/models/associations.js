"use strict";

module.exports = (db) => {
  const {
    User,
    Role,
    Module,
    RoleModule,
    UserToken,
    PasswordResetOtp,
    State,
    City,
    ProductType,
    ProductMake,
    MeasurementUnit,
    Division,
    SubDivision,
    Company,
    CompanyBankAccount,
    CompanyBranch,
    CompanyWarehouse,
    PaymentMode,
    Bank,
    Supplier,
    PurchaseOrder,
    PurchaseOrderItem,
    POInward,
    POInwardItem,
    POInwardSerial,
    Stock,
    StockSerial,
    InventoryLedger,
    StockTransfer,
    StockTransferItem,
    StockTransferSerial,
    StockAdjustment,
    StockAdjustmentItem,
    StockAdjustmentSerial,
    Challan,
    ChallanItems,
    B2BClient,
    B2BClientShipTo,
    B2BSalesQuote,
    B2BSalesQuoteItem,
    B2BSalesOrder,
    B2BSalesOrderItem,
    B2BShipment,
    B2BShipmentItem,
    B2BInvoice,
    B2BInvoiceItem,
    SerialMaster,
    SerialMasterDetail,
    PurchaseReturn,
    PurchaseReturnItem,
    PurchaseReturnSerial,
    // ── Manufacturing ──────────────────────────────────────────────
    WorkCenter,
    BomHeader,
    BomComponent,
    BomRouting,
    ManufacturingOrder,
    WorkOrder,
    QcTemplate,
    QcCheck,
    CostSheet,
    ProductionScheduleEntry,
  } = db;

  const Product = db.Product;

  // ── Auth & Users ────────────────────────────────────────────────────────────
  if (User && Role) {
    User.belongsTo(Role, { foreignKey: "role_id", as: "role" });
    Role.hasMany(User, { foreignKey: "role_id", as: "users" });
  }
  if (User) {
    User.belongsTo(User, { foreignKey: "manager_id", as: "manager" });
    User.hasMany(User, { foreignKey: "manager_id", as: "reportees" });
  }
  if (Role && Module && RoleModule) {
    Role.hasMany(RoleModule, { foreignKey: "role_id", as: "roleModules" });
    Module.hasMany(RoleModule, { foreignKey: "module_id", as: "roleModules" });
    RoleModule.belongsTo(Module, { foreignKey: "module_id", as: "module" });
    RoleModule.belongsTo(Role, { foreignKey: "role_id", as: "role" });
  }
  if (User && UserToken) {
    User.hasMany(UserToken, { foreignKey: "user_id", as: "tokens" });
    UserToken.belongsTo(User, { foreignKey: "user_id", as: "user" });
  }
  if (User && PasswordResetOtp) {
    User.hasMany(PasswordResetOtp, { foreignKey: "user_id", as: "passwordResetOtps" });
    PasswordResetOtp.belongsTo(User, { foreignKey: "user_id", as: "user" });
  }

  // ── Location Masters ─────────────────────────────────────────────────────────
  if (State && City) {
    City.belongsTo(State, { foreignKey: "state_id", as: "state" });
    State.hasMany(City, { foreignKey: "state_id", as: "cities" });
  }
  if (State && Supplier) {
    Supplier.belongsTo(State, { foreignKey: "state_id", as: "state" });
    State.hasMany(Supplier, { foreignKey: "state_id", as: "suppliers" });
  }

  // ── Product Masters ──────────────────────────────────────────────────────────
  if (ProductType && ProductMake) {
    ProductMake.belongsTo(ProductType, { foreignKey: "product_type_id", as: "productType" });
    ProductType.hasMany(ProductMake, { foreignKey: "product_type_id", as: "productMakes" });
  }
  if (Product && ProductType) {
    Product.belongsTo(ProductType, { foreignKey: "product_type_id", as: "productType" });
    ProductType.hasMany(Product, { foreignKey: "product_type_id", as: "products" });
  }
  if (Product && ProductMake) {
    Product.belongsTo(ProductMake, { foreignKey: "product_make_id", as: "productMake" });
    ProductMake.hasMany(Product, { foreignKey: "product_make_id", as: "products" });
  }
  if (Product && MeasurementUnit) {
    Product.belongsTo(MeasurementUnit, { foreignKey: "measurement_unit_id", as: "measurementUnit" });
    MeasurementUnit.hasMany(Product, { foreignKey: "measurement_unit_id", as: "products" });
  }

  // ── Division ─────────────────────────────────────────────────────────────────
  if (Division && SubDivision) {
    SubDivision.belongsTo(Division, { foreignKey: "division_id", as: "division" });
    Division.hasMany(SubDivision, { foreignKey: "division_id", as: "subDivisions" });
  }

  // ── Company ───────────────────────────────────────────────────────────────────
  if (Company && CompanyBankAccount) {
    Company.hasMany(CompanyBankAccount, { foreignKey: "company_id", as: "bankAccounts" });
    CompanyBankAccount.belongsTo(Company, { foreignKey: "company_id", as: "company" });
  }
  if (Company && CompanyBranch) {
    Company.hasMany(CompanyBranch, { foreignKey: "company_id", as: "branches" });
    CompanyBranch.belongsTo(Company, { foreignKey: "company_id", as: "company" });
  }
  if (CompanyBankAccount && CompanyBranch) {
    CompanyBankAccount.belongsTo(CompanyBranch, { foreignKey: "branch_id", as: "branch" });
    CompanyBranch.hasMany(CompanyBankAccount, { foreignKey: "branch_id", as: "bankAccounts" });
  }
  if (Company && CompanyWarehouse) {
    Company.hasMany(CompanyWarehouse, { foreignKey: "company_id", as: "warehouses" });
    CompanyWarehouse.belongsTo(Company, { foreignKey: "company_id", as: "company" });
  }
  if (CompanyBranch && CompanyWarehouse) {
    CompanyBranch.hasMany(CompanyWarehouse, { foreignKey: "branch_id", as: "warehouses" });
    CompanyWarehouse.belongsTo(CompanyBranch, { foreignKey: "branch_id", as: "branch" });
  }
  if (State && CompanyWarehouse) {
    State.hasMany(CompanyWarehouse, { foreignKey: "state_id", as: "warehouses" });
    CompanyWarehouse.belongsTo(State, { foreignKey: "state_id", as: "state" });
  }
  if (CompanyWarehouse && User) {
    CompanyWarehouse.belongsToMany(User, {
      through: "company_warehouse_managers",
      foreignKey: "warehouse_id",
      otherKey: "user_id",
      as: "managers",
    });
    User.belongsToMany(CompanyWarehouse, {
      through: "company_warehouse_managers",
      foreignKey: "user_id",
      otherKey: "warehouse_id",
      as: "managedWarehouses",
    });
  }

  // ── Purchase Orders ───────────────────────────────────────────────────────────
  if (PurchaseOrder && Supplier) {
    PurchaseOrder.belongsTo(Supplier, { foreignKey: "supplier_id", as: "supplier" });
    Supplier.hasMany(PurchaseOrder, { foreignKey: "supplier_id", as: "purchaseOrders" });
  }
  if (PurchaseOrder && Company) {
    PurchaseOrder.belongsTo(Company, { foreignKey: "bill_to_id", as: "billTo" });
    Company.hasMany(PurchaseOrder, { foreignKey: "bill_to_id", as: "purchaseOrders" });
    CompanyBranch.hasMany(PurchaseOrder, { foreignKey: "bill_to_id", as: "purchaseOrders" });
  }
  if (PurchaseOrder && CompanyWarehouse) {
    PurchaseOrder.belongsTo(CompanyWarehouse, { foreignKey: "ship_to_id", as: "shipTo" });
    CompanyWarehouse.hasMany(PurchaseOrder, { foreignKey: "ship_to_id", as: "purchaseOrders" });
  }
  if (PurchaseOrder && User) {
    PurchaseOrder.belongsTo(User, { foreignKey: "created_by", as: "createdBy" });
    PurchaseOrder.belongsTo(User, { foreignKey: "approved_by", as: "approvedBy" });
    User.hasMany(PurchaseOrder, { foreignKey: "created_by", as: "createdPurchaseOrders" });
    User.hasMany(PurchaseOrder, { foreignKey: "approved_by", as: "approvedPurchaseOrders" });
  }
  if (PurchaseOrder && PurchaseOrderItem) {
    PurchaseOrder.hasMany(PurchaseOrderItem, { foreignKey: "purchase_order_id", as: "items" });
    PurchaseOrderItem.belongsTo(PurchaseOrder, { foreignKey: "purchase_order_id", as: "purchaseOrder" });
  }
  if (PurchaseOrderItem && Product) {
    PurchaseOrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
    Product.hasMany(PurchaseOrderItem, { foreignKey: "product_id", as: "purchaseOrderItems" });
  }

  // ── PO Inward (GRN) ──────────────────────────────────────────────────────────
  if (POInward && PurchaseOrder) {
    POInward.belongsTo(PurchaseOrder, { foreignKey: "purchase_order_id", as: "purchaseOrder" });
    PurchaseOrder.hasMany(POInward, { foreignKey: "purchase_order_id", as: "poInwards" });
  }
  if (POInward && Supplier) {
    POInward.belongsTo(Supplier, { foreignKey: "supplier_id", as: "supplier" });
    Supplier.hasMany(POInward, { foreignKey: "supplier_id", as: "poInwards" });
  }
  if (POInward && CompanyWarehouse) {
    POInward.belongsTo(CompanyWarehouse, { foreignKey: "warehouse_id", as: "warehouse" });
    CompanyWarehouse.hasMany(POInward, { foreignKey: "warehouse_id", as: "poInwards" });
  }
  if (POInward && User) {
    POInward.belongsTo(User, { foreignKey: "received_by", as: "receivedBy" });
    User.hasMany(POInward, { foreignKey: "received_by", as: "poInwards" });
  }
  if (POInward && POInwardItem) {
    POInward.hasMany(POInwardItem, { foreignKey: "po_inward_id", as: "items" });
    POInwardItem.belongsTo(POInward, { foreignKey: "po_inward_id", as: "poInward" });
  }
  if (POInwardItem && PurchaseOrderItem) {
    POInwardItem.belongsTo(PurchaseOrderItem, { foreignKey: "purchase_order_item_id", as: "purchaseOrderItem" });
    PurchaseOrderItem.hasMany(POInwardItem, { foreignKey: "purchase_order_item_id", as: "poInwardItems" });
  }
  if (POInwardItem && Product) {
    POInwardItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
    Product.hasMany(POInwardItem, { foreignKey: "product_id", as: "poInwardItems" });
  }
  if (POInwardItem && POInwardSerial) {
    POInwardItem.hasMany(POInwardSerial, { foreignKey: "po_inward_item_id", as: "serials" });
    POInwardSerial.belongsTo(POInwardItem, { foreignKey: "po_inward_item_id", as: "poInwardItem" });
  }

  // ── Purchase Returns ──────────────────────────────────────────────────────────
  if (PurchaseReturn && PurchaseOrder) {
    PurchaseReturn.belongsTo(PurchaseOrder, { foreignKey: "purchase_order_id", as: "purchaseOrder" });
    PurchaseOrder.hasMany(PurchaseReturn, { foreignKey: "purchase_order_id", as: "purchaseReturns" });
  }
  if (PurchaseReturn && POInward) {
    PurchaseReturn.belongsTo(POInward, { foreignKey: "po_inward_id", as: "poInward" });
    POInward.hasMany(PurchaseReturn, { foreignKey: "po_inward_id", as: "purchaseReturns" });
  }
  if (PurchaseReturn && Supplier) {
    PurchaseReturn.belongsTo(Supplier, { foreignKey: "supplier_id", as: "supplier" });
    Supplier.hasMany(PurchaseReturn, { foreignKey: "supplier_id", as: "purchaseReturns" });
  }
  if (PurchaseReturn && CompanyWarehouse) {
    PurchaseReturn.belongsTo(CompanyWarehouse, { foreignKey: "warehouse_id", as: "warehouse" });
    CompanyWarehouse.hasMany(PurchaseReturn, { foreignKey: "warehouse_id", as: "purchaseReturns" });
  }
  if (PurchaseReturn && User) {
    PurchaseReturn.belongsTo(User, { foreignKey: "created_by", as: "createdByUser" });
    User.hasMany(PurchaseReturn, { foreignKey: "created_by", as: "createdPurchaseReturns" });
  }
  if (PurchaseReturn && PurchaseReturnItem) {
    PurchaseReturn.hasMany(PurchaseReturnItem, { foreignKey: "purchase_return_id", as: "items" });
    PurchaseReturnItem.belongsTo(PurchaseReturn, { foreignKey: "purchase_return_id", as: "purchaseReturn" });
  }
  if (PurchaseReturnItem && POInwardItem) {
    PurchaseReturnItem.belongsTo(POInwardItem, { foreignKey: "po_inward_item_id", as: "poInwardItem" });
    POInwardItem.hasMany(PurchaseReturnItem, { foreignKey: "po_inward_item_id", as: "purchaseReturnItems" });
  }
  if (PurchaseReturnItem && PurchaseOrderItem) {
    PurchaseReturnItem.belongsTo(PurchaseOrderItem, { foreignKey: "purchase_order_item_id", as: "purchaseOrderItem" });
    PurchaseOrderItem.hasMany(PurchaseReturnItem, { foreignKey: "purchase_order_item_id", as: "purchaseReturnItems" });
  }
  if (PurchaseReturnItem && Product) {
    PurchaseReturnItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
    Product.hasMany(PurchaseReturnItem, { foreignKey: "product_id", as: "purchaseReturnItems" });
  }
  if (PurchaseReturnItem && PurchaseReturnSerial) {
    PurchaseReturnItem.hasMany(PurchaseReturnSerial, { foreignKey: "purchase_return_item_id", as: "serials" });
    PurchaseReturnSerial.belongsTo(PurchaseReturnItem, { foreignKey: "purchase_return_item_id", as: "purchaseReturnItem" });
  }

  // ── Stock ─────────────────────────────────────────────────────────────────────
  if (Stock && Product) {
    Stock.belongsTo(Product, { foreignKey: "product_id", as: "product" });
    Product.hasMany(Stock, { foreignKey: "product_id", as: "stocks" });
  }
  if (Stock && CompanyWarehouse) {
    Stock.belongsTo(CompanyWarehouse, { foreignKey: "warehouse_id", as: "warehouse" });
    CompanyWarehouse.hasMany(Stock, { foreignKey: "warehouse_id", as: "stocks" });
  }
  if (Stock && User) {
    Stock.belongsTo(User, { foreignKey: "last_updated_by", as: "lastUpdatedBy" });
    User.hasMany(Stock, { foreignKey: "last_updated_by", as: "updatedStocks" });
  }
  if (Stock && StockSerial) {
    Stock.hasMany(StockSerial, { foreignKey: "stock_id", as: "serials" });
    StockSerial.belongsTo(Stock, { foreignKey: "stock_id", as: "stock" });
  }
  if (StockSerial && Product) {
    StockSerial.belongsTo(Product, { foreignKey: "product_id", as: "product" });
    Product.hasMany(StockSerial, { foreignKey: "product_id", as: "stockSerials" });
  }
  if (StockSerial && CompanyWarehouse) {
    StockSerial.belongsTo(CompanyWarehouse, { foreignKey: "warehouse_id", as: "warehouse" });
    CompanyWarehouse.hasMany(StockSerial, { foreignKey: "warehouse_id", as: "stockSerials" });
  }

  // ── Inventory Ledger ──────────────────────────────────────────────────────────
  if (InventoryLedger && Product) {
    InventoryLedger.belongsTo(Product, { foreignKey: "product_id", as: "product" });
    Product.hasMany(InventoryLedger, { foreignKey: "product_id", as: "inventoryLedgerEntries" });
  }
  if (InventoryLedger && CompanyWarehouse) {
    InventoryLedger.belongsTo(CompanyWarehouse, { foreignKey: "warehouse_id", as: "warehouse" });
    CompanyWarehouse.hasMany(InventoryLedger, { foreignKey: "warehouse_id", as: "inventoryLedgerEntries" });
  }
  if (InventoryLedger && Stock) {
    InventoryLedger.belongsTo(Stock, { foreignKey: "stock_id", as: "stock" });
    Stock.hasMany(InventoryLedger, { foreignKey: "stock_id", as: "ledgerEntries" });
  }
  if (InventoryLedger && StockSerial) {
    InventoryLedger.belongsTo(StockSerial, { foreignKey: "serial_id", as: "serial" });
    StockSerial.hasMany(InventoryLedger, { foreignKey: "serial_id", as: "ledgerEntries" });
  }
  if (InventoryLedger && User) {
    InventoryLedger.belongsTo(User, { foreignKey: "performed_by", as: "performedBy" });
    User.hasMany(InventoryLedger, { foreignKey: "performed_by", as: "inventoryLedgerEntries" });
  }

  // ── Stock Transfers ───────────────────────────────────────────────────────────
  if (StockTransfer && CompanyWarehouse) {
    StockTransfer.belongsTo(CompanyWarehouse, { foreignKey: "from_warehouse_id", as: "fromWarehouse" });
    StockTransfer.belongsTo(CompanyWarehouse, { foreignKey: "to_warehouse_id", as: "toWarehouse" });
    CompanyWarehouse.hasMany(StockTransfer, { foreignKey: "from_warehouse_id", as: "outgoingTransfers" });
    CompanyWarehouse.hasMany(StockTransfer, { foreignKey: "to_warehouse_id", as: "incomingTransfers" });
  }
  if (StockTransfer && User) {
    StockTransfer.belongsTo(User, { foreignKey: "requested_by", as: "requestedBy" });
    StockTransfer.belongsTo(User, { foreignKey: "approved_by", as: "approvedBy" });
    User.hasMany(StockTransfer, { foreignKey: "requested_by", as: "requestedStockTransfers" });
    User.hasMany(StockTransfer, { foreignKey: "approved_by", as: "approvedStockTransfers" });
  }
  if (StockTransfer && StockTransferItem) {
    StockTransfer.hasMany(StockTransferItem, { foreignKey: "stock_transfer_id", as: "items" });
    StockTransferItem.belongsTo(StockTransfer, { foreignKey: "stock_transfer_id", as: "stockTransfer" });
  }
  if (StockTransferItem && Product) {
    StockTransferItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
    Product.hasMany(StockTransferItem, { foreignKey: "product_id", as: "stockTransferItems" });
  }
  if (StockTransferItem && StockTransferSerial) {
    StockTransferItem.hasMany(StockTransferSerial, { foreignKey: "stock_transfer_item_id", as: "serials" });
    StockTransferSerial.belongsTo(StockTransferItem, { foreignKey: "stock_transfer_item_id", as: "stockTransferItem" });
  }
  if (StockTransferSerial && StockSerial) {
    StockTransferSerial.belongsTo(StockSerial, { foreignKey: "stock_serial_id", as: "stockSerial" });
    StockSerial.hasMany(StockTransferSerial, { foreignKey: "stock_serial_id", as: "stockTransferSerials" });
  }

  // ── Stock Adjustments ─────────────────────────────────────────────────────────
  if (StockAdjustment && CompanyWarehouse) {
    StockAdjustment.belongsTo(CompanyWarehouse, { foreignKey: "warehouse_id", as: "warehouse" });
    CompanyWarehouse.hasMany(StockAdjustment, { foreignKey: "warehouse_id", as: "stockAdjustments" });
  }
  if (StockAdjustment && User) {
    StockAdjustment.belongsTo(User, { foreignKey: "requested_by", as: "requestedBy" });
    StockAdjustment.belongsTo(User, { foreignKey: "approved_by", as: "approvedBy" });
    User.hasMany(StockAdjustment, { foreignKey: "requested_by", as: "requestedStockAdjustments" });
    User.hasMany(StockAdjustment, { foreignKey: "approved_by", as: "approvedStockAdjustments" });
  }
  if (StockAdjustment && StockAdjustmentItem) {
    StockAdjustment.hasMany(StockAdjustmentItem, { foreignKey: "stock_adjustment_id", as: "items" });
    StockAdjustmentItem.belongsTo(StockAdjustment, { foreignKey: "stock_adjustment_id", as: "stockAdjustment" });
  }
  if (StockAdjustmentItem && Product) {
    StockAdjustmentItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
    Product.hasMany(StockAdjustmentItem, { foreignKey: "product_id", as: "stockAdjustmentItems" });
  }
  if (StockAdjustmentItem && StockAdjustmentSerial) {
    StockAdjustmentItem.hasMany(StockAdjustmentSerial, { foreignKey: "stock_adjustment_item_id", as: "serials" });
    StockAdjustmentSerial.belongsTo(StockAdjustmentItem, { foreignKey: "stock_adjustment_item_id", as: "stockAdjustmentItem" });
  }
  if (StockAdjustmentSerial && StockSerial) {
    StockAdjustmentSerial.belongsTo(StockSerial, { foreignKey: "stock_serial_id", as: "stockSerial" });
    StockSerial.hasMany(StockAdjustmentSerial, { foreignKey: "stock_serial_id", as: "stockAdjustmentSerials" });
  }

  // ── Delivery Challan ──────────────────────────────────────────────────────────
  if (Challan && B2BSalesOrder) {
    Challan.belongsTo(B2BSalesOrder, { foreignKey: "b2b_sales_order_id", as: "b2bSalesOrder" });
    B2BSalesOrder.hasMany(Challan, { foreignKey: "b2b_sales_order_id", as: "challans" });
  }
  if (Challan && CompanyWarehouse) {
    Challan.belongsTo(CompanyWarehouse, { foreignKey: "warehouse_id", as: "warehouse" });
    CompanyWarehouse.hasMany(Challan, { foreignKey: "warehouse_id", as: "challans" });
  }
  if (Challan && User) {
    Challan.belongsTo(User, { foreignKey: "reversed_by", as: "reversedByUser" });
  }
  if (Challan && ChallanItems) {
    Challan.hasMany(ChallanItems, { foreignKey: "challan_id", as: "items" });
    ChallanItems.belongsTo(Challan, { foreignKey: "challan_id", as: "challan" });
  }
  if (ChallanItems && Product) {
    ChallanItems.belongsTo(Product, { foreignKey: "product_id", as: "product" });
    Product.hasMany(ChallanItems, { foreignKey: "product_id", as: "challanItems" });
  }
  if (ChallanItems && B2BSalesOrderItem) {
    ChallanItems.belongsTo(B2BSalesOrderItem, { foreignKey: "b2b_sales_order_item_id", as: "b2bSalesOrderItem" });
    B2BSalesOrderItem.hasMany(ChallanItems, { foreignKey: "b2b_sales_order_item_id", as: "challanItems" });
  }

  // ── B2B Sales ─────────────────────────────────────────────────────────────────
  if (B2BClient && B2BClientShipTo) {
    B2BClient.hasMany(B2BClientShipTo, { foreignKey: "client_id", as: "shipToAddresses" });
    B2BClientShipTo.belongsTo(B2BClient, { foreignKey: "client_id", as: "client" });
  }
  if (B2BClient && B2BSalesQuote) {
    B2BSalesQuote.belongsTo(B2BClient, { foreignKey: "client_id", as: "client" });
    B2BClient.hasMany(B2BSalesQuote, { foreignKey: "client_id", as: "salesQuotes" });
  }
  if (B2BClientShipTo && B2BSalesQuote) {
    B2BSalesQuote.belongsTo(B2BClientShipTo, { foreignKey: "ship_to_id", as: "shipTo" });
    B2BClientShipTo.hasMany(B2BSalesQuote, { foreignKey: "ship_to_id", as: "salesQuotes" });
  }
  if (B2BSalesQuote && B2BSalesQuoteItem) {
    B2BSalesQuote.hasMany(B2BSalesQuoteItem, { foreignKey: "b2b_sales_quote_id", as: "items" });
    B2BSalesQuoteItem.belongsTo(B2BSalesQuote, { foreignKey: "b2b_sales_quote_id", as: "salesQuote" });
  }
  if (B2BSalesQuoteItem && Product) {
    B2BSalesQuoteItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
    Product.hasMany(B2BSalesQuoteItem, { foreignKey: "product_id", as: "b2bSalesQuoteItems" });
  }
  if (B2BSalesQuote && User) {
    B2BSalesQuote.belongsTo(User, { foreignKey: "user_id", as: "user" });
    User.hasMany(B2BSalesQuote, { foreignKey: "user_id", as: "b2bSalesQuotes" });
  }
  if (B2BSalesQuote && B2BSalesOrder) {
    B2BSalesOrder.belongsTo(B2BSalesQuote, { foreignKey: "quote_id", as: "quote" });
    B2BSalesQuote.hasMany(B2BSalesOrder, { foreignKey: "quote_id", as: "salesOrders" });
  }
  if (B2BClient && B2BSalesOrder) {
    B2BSalesOrder.belongsTo(B2BClient, { foreignKey: "client_id", as: "client" });
    B2BClient.hasMany(B2BSalesOrder, { foreignKey: "client_id", as: "salesOrders" });
  }
  if (B2BClientShipTo && B2BSalesOrder) {
    B2BSalesOrder.belongsTo(B2BClientShipTo, { foreignKey: "ship_to_id", as: "shipTo" });
    B2BClientShipTo.hasMany(B2BSalesOrder, { foreignKey: "ship_to_id", as: "salesOrders" });
  }
  if (B2BSalesOrder && B2BSalesOrderItem) {
    B2BSalesOrder.hasMany(B2BSalesOrderItem, { foreignKey: "b2b_sales_order_id", as: "items" });
    B2BSalesOrderItem.belongsTo(B2BSalesOrder, { foreignKey: "b2b_sales_order_id", as: "salesOrder" });
  }
  if (B2BSalesOrderItem && Product) {
    B2BSalesOrderItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
    Product.hasMany(B2BSalesOrderItem, { foreignKey: "product_id", as: "b2bSalesOrderItems" });
  }
  if (B2BSalesOrder && CompanyWarehouse) {
    B2BSalesOrder.belongsTo(CompanyWarehouse, { foreignKey: "planned_warehouse_id", as: "plannedWarehouse" });
    CompanyWarehouse.hasMany(B2BSalesOrder, { foreignKey: "planned_warehouse_id", as: "b2bSalesOrders" });
  }
  if (B2BSalesOrder && User) {
    B2BSalesOrder.belongsTo(User, { foreignKey: "user_id", as: "user" });
    User.hasMany(B2BSalesOrder, { foreignKey: "user_id", as: "b2bSalesOrders" });
  }
  if (B2BSalesOrder && B2BShipment) {
    B2BShipment.belongsTo(B2BSalesOrder, { foreignKey: "b2b_sales_order_id", as: "salesOrder" });
    B2BSalesOrder.hasMany(B2BShipment, { foreignKey: "b2b_sales_order_id", as: "shipments" });
  }
  if (B2BClient && B2BShipment) {
    B2BShipment.belongsTo(B2BClient, { foreignKey: "client_id", as: "client" });
    B2BClient.hasMany(B2BShipment, { foreignKey: "client_id", as: "shipments" });
  }
  if (B2BClientShipTo && B2BShipment) {
    B2BShipment.belongsTo(B2BClientShipTo, { foreignKey: "ship_to_id", as: "shipTo" });
    B2BClientShipTo.hasMany(B2BShipment, { foreignKey: "ship_to_id", as: "shipments" });
  }
  if (B2BShipment && B2BShipmentItem) {
    B2BShipment.hasMany(B2BShipmentItem, { foreignKey: "b2b_shipment_id", as: "items" });
    B2BShipmentItem.belongsTo(B2BShipment, { foreignKey: "b2b_shipment_id", as: "shipment" });
  }
  if (B2BShipmentItem && Product) {
    B2BShipmentItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
    Product.hasMany(B2BShipmentItem, { foreignKey: "product_id", as: "b2bShipmentItems" });
  }
  if (B2BShipmentItem && B2BSalesOrderItem) {
    B2BShipmentItem.belongsTo(B2BSalesOrderItem, { foreignKey: "b2b_sales_order_item_id", as: "salesOrderItem" });
    B2BSalesOrderItem.hasMany(B2BShipmentItem, { foreignKey: "b2b_sales_order_item_id", as: "shipmentItems" });
  }
  if (B2BShipment && CompanyWarehouse) {
    B2BShipment.belongsTo(CompanyWarehouse, { foreignKey: "warehouse_id", as: "warehouse" });
    CompanyWarehouse.hasMany(B2BShipment, { foreignKey: "warehouse_id", as: "b2bShipments" });
  }
  if (B2BShipment && User) {
    B2BShipment.belongsTo(User, { foreignKey: "created_by", as: "createdBy" });
    User.hasMany(B2BShipment, { foreignKey: "created_by", as: "b2bShipments" });
  }
  if (B2BShipment && B2BInvoice) {
    B2BInvoice.belongsTo(B2BShipment, { foreignKey: "b2b_shipment_id", as: "shipment" });
    B2BShipment.hasOne(B2BInvoice, { foreignKey: "b2b_shipment_id", as: "invoice" });
  }
  if (B2BSalesOrder && B2BInvoice) {
    B2BInvoice.belongsTo(B2BSalesOrder, { foreignKey: "b2b_sales_order_id", as: "salesOrder" });
    B2BSalesOrder.hasMany(B2BInvoice, { foreignKey: "b2b_sales_order_id", as: "invoices" });
  }
  if (B2BClient && B2BInvoice) {
    B2BInvoice.belongsTo(B2BClient, { foreignKey: "client_id", as: "client" });
    B2BClient.hasMany(B2BInvoice, { foreignKey: "client_id", as: "invoices" });
  }
  if (B2BClientShipTo && B2BInvoice) {
    B2BInvoice.belongsTo(B2BClientShipTo, { foreignKey: "ship_to_id", as: "shipTo" });
    B2BClientShipTo.hasMany(B2BInvoice, { foreignKey: "ship_to_id", as: "invoices" });
  }
  if (B2BInvoice && B2BInvoiceItem) {
    B2BInvoice.hasMany(B2BInvoiceItem, { foreignKey: "b2b_invoice_id", as: "items" });
    B2BInvoiceItem.belongsTo(B2BInvoice, { foreignKey: "b2b_invoice_id", as: "invoice" });
  }
  if (B2BInvoiceItem && Product) {
    B2BInvoiceItem.belongsTo(Product, { foreignKey: "product_id", as: "product" });
    Product.hasMany(B2BInvoiceItem, { foreignKey: "product_id", as: "b2bInvoiceItems" });
  }
  if (B2BInvoice && User) {
    B2BInvoice.belongsTo(User, { foreignKey: "created_by", as: "createdBy" });
    User.hasMany(B2BInvoice, { foreignKey: "created_by", as: "b2bInvoices" });
  }

  // ── Serial Master ─────────────────────────────────────────────────────────────
  if (SerialMaster && SerialMasterDetail) {
    SerialMaster.hasMany(SerialMasterDetail, { foreignKey: "serial_master_id", as: "details" });
    SerialMasterDetail.belongsTo(SerialMaster, { foreignKey: "serial_master_id", as: "serialMaster" });
  }

  // ── Manufacturing ─────────────────────────────────────────────────────────────

  // BOM Header ↔ Product
  if (BomHeader && Product) {
    BomHeader.belongsTo(Product, { foreignKey: "product_id", as: "product" });
    Product.hasMany(BomHeader, { foreignKey: "product_id", as: "boms" });
  }

  // BOM Components ↔ BOM Header
  if (BomHeader && BomComponent) {
    BomHeader.hasMany(BomComponent, { foreignKey: "bom_id", as: "components" });
    BomComponent.belongsTo(BomHeader, { foreignKey: "bom_id", as: "bom" });
  }

  // BOM Component ↔ Product (the component material)
  if (BomComponent && Product) {
    BomComponent.belongsTo(Product, { foreignKey: "component_product_id", as: "componentProduct" });
    Product.hasMany(BomComponent, { foreignKey: "component_product_id", as: "bomComponents" });
  }

  // BOM Routing ↔ BOM Header
  if (BomHeader && BomRouting) {
    BomHeader.hasMany(BomRouting, { foreignKey: "bom_id", as: "routings" });
    BomRouting.belongsTo(BomHeader, { foreignKey: "bom_id", as: "bom" });
  }

  // BOM Routing ↔ Work Center
  if (BomRouting && WorkCenter) {
    BomRouting.belongsTo(WorkCenter, { foreignKey: "work_center_id", as: "workCenter" });
    WorkCenter.hasMany(BomRouting, { foreignKey: "work_center_id", as: "bomRoutings" });
  }

  // Cost Sheet ↔ BOM Header (one-to-one)
  if (CostSheet && BomHeader) {
    BomHeader.hasOne(CostSheet, { foreignKey: "bom_id", as: "costSheet" });
    CostSheet.belongsTo(BomHeader, { foreignKey: "bom_id", as: "bom" });
  }

  // Manufacturing Order ↔ Product
  if (ManufacturingOrder && Product) {
    ManufacturingOrder.belongsTo(Product, { foreignKey: "product_id", as: "product" });
    Product.hasMany(ManufacturingOrder, { foreignKey: "product_id", as: "manufacturingOrders" });
  }

  // Manufacturing Order ↔ BOM Header
  if (ManufacturingOrder && BomHeader) {
    ManufacturingOrder.belongsTo(BomHeader, { foreignKey: "bom_id", as: "bom" });
    BomHeader.hasMany(ManufacturingOrder, { foreignKey: "bom_id", as: "manufacturingOrders" });
  }

  // Manufacturing Order ↔ B2B Sales Order
  if (ManufacturingOrder && B2BSalesOrder) {
    ManufacturingOrder.belongsTo(B2BSalesOrder, { foreignKey: "sales_order_id", as: "salesOrder" });
    B2BSalesOrder.hasMany(ManufacturingOrder, { foreignKey: "sales_order_id", as: "manufacturingOrders" });
  }

  if (ManufacturingOrder && B2BSalesOrderItem) {
    ManufacturingOrder.belongsTo(B2BSalesOrderItem, {
      foreignKey: "b2b_sales_order_item_id",
      as: "b2bSalesOrderItem",
    });
    B2BSalesOrderItem.hasMany(ManufacturingOrder, {
      foreignKey: "b2b_sales_order_item_id",
      as: "manufacturingOrders",
    });
  }

  // Production schedule
  if (ProductionScheduleEntry && ManufacturingOrder) {
    ProductionScheduleEntry.belongsTo(ManufacturingOrder, {
      foreignKey: "manufacturing_order_id",
      as: "manufacturingOrder",
    });
    ManufacturingOrder.hasMany(ProductionScheduleEntry, {
      foreignKey: "manufacturing_order_id",
      as: "scheduleEntries",
    });
  }
  if (ProductionScheduleEntry && WorkCenter) {
    ProductionScheduleEntry.belongsTo(WorkCenter, { foreignKey: "work_center_id", as: "workCenter" });
    WorkCenter.hasMany(ProductionScheduleEntry, { foreignKey: "work_center_id", as: "scheduleEntries" });
  }

  // Work Order ↔ Manufacturing Order
  if (WorkOrder && ManufacturingOrder) {
    ManufacturingOrder.hasMany(WorkOrder, { foreignKey: "manufacturing_order_id", as: "workOrders" });
    WorkOrder.belongsTo(ManufacturingOrder, { foreignKey: "manufacturing_order_id", as: "manufacturingOrder" });
  }

  // Work Order ↔ Work Center
  if (WorkOrder && WorkCenter) {
    WorkOrder.belongsTo(WorkCenter, { foreignKey: "work_center_id", as: "workCenter" });
    WorkCenter.hasMany(WorkOrder, { foreignKey: "work_center_id", as: "workOrders" });
  }

  // Work Order ↔ BOM Routing
  if (WorkOrder && BomRouting) {
    WorkOrder.belongsTo(BomRouting, { foreignKey: "routing_step_id", as: "routingStep" });
    BomRouting.hasMany(WorkOrder, { foreignKey: "routing_step_id", as: "workOrders" });
  }

  // Work Order ↔ Operator (User)
  if (WorkOrder && User) {
    WorkOrder.belongsTo(User, { foreignKey: "operator_user_id", as: "operator" });
    User.hasMany(WorkOrder, { foreignKey: "operator_user_id", as: "operatedWorkOrders" });
  }

  // QC Template ↔ Product
  if (QcTemplate && Product) {
    QcTemplate.belongsTo(Product, { foreignKey: "product_id", as: "product" });
    Product.hasMany(QcTemplate, { foreignKey: "product_id", as: "qcTemplates" });
  }

  // QC Template ↔ BOM Routing
  if (QcTemplate && BomRouting) {
    QcTemplate.belongsTo(BomRouting, { foreignKey: "bom_routing_id", as: "bomRouting" });
    BomRouting.hasMany(QcTemplate, { foreignKey: "bom_routing_id", as: "qcTemplates" });
  }

  // QC Check ↔ Work Order
  if (QcCheck && WorkOrder) {
    WorkOrder.hasMany(QcCheck, { foreignKey: "work_order_id", as: "qcChecks" });
    QcCheck.belongsTo(WorkOrder, { foreignKey: "work_order_id", as: "workOrder" });
  }

  // QC Check ↔ QC Template
  if (QcCheck && QcTemplate) {
    QcCheck.belongsTo(QcTemplate, { foreignKey: "qc_template_id", as: "qcTemplate" });
    QcTemplate.hasMany(QcCheck, { foreignKey: "qc_template_id", as: "qcChecks" });
  }

  // QC Check ↔ Inspector (User)
  if (QcCheck && User) {
    QcCheck.belongsTo(User, { foreignKey: "inspector_user_id", as: "inspector" });
    User.hasMany(QcCheck, { foreignKey: "inspector_user_id", as: "inspectedQcChecks" });
  }

  // ── Automatic audit field associations (created_by → User, updated_by → User) ─
  const ensureAuditAssociations = (Model) => {
    if (!Model || Model === User) return;
    const rawAttributes = Model.rawAttributes || {};
    const associations = Object.values(Model.associations || {});

    const hasAssociationForKey = (foreignKey) =>
      associations.some((assoc) => assoc.foreignKey === foreignKey);

    if (rawAttributes.created_by && !hasAssociationForKey("created_by")) {
      Model.belongsTo(User, { foreignKey: "created_by", as: "createdByUser" });
    }

    if (rawAttributes.updated_by && !hasAssociationForKey("updated_by")) {
      Model.belongsTo(User, { foreignKey: "updated_by", as: "updatedByUser" });
    }
  };

  if (User) {
    Object.values(db).forEach(ensureAuditAssociations);
  }
};
