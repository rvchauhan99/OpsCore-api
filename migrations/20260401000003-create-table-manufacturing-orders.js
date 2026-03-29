"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("manufacturing_orders", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      mo_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: "Auto-generated e.g. MO-2026-0001",
      },
      sales_order_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "Links to b2b_sales_orders if triggered from a sales order",
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "The finished good to be manufactured",
      },
      bom_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "The BOM version used for this MO",
      },
      planned_qty: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 1,
      },
      produced_qty: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM(
          "draft",
          "released",
          "in_progress",
          "completed",
          "cancelled"
        ),
        allowNull: false,
        defaultValue: "draft",
      },
      priority: {
        type: Sequelize.ENUM("low", "normal", "high", "urgent"),
        allowNull: false,
        defaultValue: "normal",
      },
      planned_start: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      planned_end: {
        type: Sequelize.DATEONLY,
        allowNull: true,
      },
      actual_start: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      actual_end: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      tenant_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("manufacturing_orders", ["tenant_id"]);
    await queryInterface.addIndex("manufacturing_orders", ["mo_number", "tenant_id"], {
      name: "manufacturing_orders_mo_number_tenant_unique",
      unique: true,
      where: { deleted_at: null },
    });
    await queryInterface.addIndex("manufacturing_orders", ["status"]);
    await queryInterface.addIndex("manufacturing_orders", ["product_id"]);
    await queryInterface.addIndex("manufacturing_orders", ["sales_order_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("manufacturing_orders");
  },
};
