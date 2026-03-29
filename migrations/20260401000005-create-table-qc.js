"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // QC Templates — define what to check for a product/routing step
    await queryInterface.createTable("qc_templates", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: "Optional: link template to a specific product",
      },
      bom_routing_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "bom_routings", key: "id" },
        onDelete: "SET NULL",
        comment: "Optional: link template to a specific BOM routing step",
      },
      check_points: {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: [],
        comment: "Array of { item: string, type: pass_fail|measurement|text, unit?: string, min?: number, max?: number }",
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
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

    await queryInterface.addIndex("qc_templates", ["tenant_id"]);
    await queryInterface.addIndex("qc_templates", ["product_id"]);

    // QC Checks — actual inspection records per work order
    await queryInterface.createTable("qc_checks", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      work_order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "work_orders", key: "id" },
        onDelete: "CASCADE",
      },
      qc_template_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "qc_templates", key: "id" },
        onDelete: "SET NULL",
      },
      inspector_user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      result: {
        type: Sequelize.ENUM("pass", "fail", "partial"),
        allowNull: false,
        defaultValue: "partial",
      },
      qty_inspected: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
        defaultValue: 0,
      },
      qty_passed: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
        defaultValue: 0,
      },
      qty_failed: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: true,
        defaultValue: 0,
      },
      check_results: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: "Array of { checkpoint_index, result, value, notes }",
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      checked_at: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
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

    await queryInterface.addIndex("qc_checks", ["work_order_id"]);
    await queryInterface.addIndex("qc_checks", ["tenant_id"]);
    await queryInterface.addIndex("qc_checks", ["result"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("qc_checks");
    await queryInterface.dropTable("qc_templates");
  },
};
