"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("work_orders", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      wo_number: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: "Auto-generated e.g. WO-2026-0001",
      },
      manufacturing_order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "manufacturing_orders", key: "id" },
        onDelete: "CASCADE",
      },
      work_center_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "work_centers", key: "id" },
        onDelete: "SET NULL",
      },
      routing_step_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "bom_routings", key: "id" },
        onDelete: "SET NULL",
        comment: "The specific BOM routing step this WO covers",
      },
      planned_qty: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 1,
      },
      completed_qty: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 0,
      },
      rejected_qty: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM(
          "pending",
          "in_progress",
          "completed",
          "qc_pending",
          "qc_passed",
          "rejected"
        ),
        allowNull: false,
        defaultValue: "pending",
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
      operator_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "Assigned operator/worker",
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

    await queryInterface.addIndex("work_orders", ["tenant_id"]);
    await queryInterface.addIndex("work_orders", ["manufacturing_order_id"]);
    await queryInterface.addIndex("work_orders", ["work_center_id"]);
    await queryInterface.addIndex("work_orders", ["status"]);
    await queryInterface.addIndex("work_orders", ["wo_number", "tenant_id"], {
      name: "work_orders_wo_number_tenant_unique",
      unique: true,
      where: { deleted_at: null },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("work_orders");
  },
};
