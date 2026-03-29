"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("cost_sheets", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      bom_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "bom_headers", key: "id" },
        onDelete: "CASCADE",
        comment: "Each BOM version has one cost sheet",
      },
      material_cost: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: false,
        defaultValue: 0,
        comment: "Sum of (component qty * cost_per_unit) for all components",
      },
      labor_cost: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: false,
        defaultValue: 0,
        comment: "Sum of (routing duration_hrs * work_center cost_per_hour)",
      },
      overhead_pct: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0,
        comment: "Overhead percentage applied on material cost",
      },
      overhead_cost: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: false,
        defaultValue: 0,
        comment: "Computed: material_cost * overhead_pct / 100",
      },
      total_unit_cost: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: false,
        defaultValue: 0,
        comment: "material_cost + labor_cost + overhead_cost",
      },
      component_breakdown: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: "Array of { product_id, name, qty, uom, cost_per_unit, total_cost }",
      },
      routing_breakdown: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: [],
        comment: "Array of { step_name, work_center, duration_hrs, cost_per_hour, total_cost }",
      },
      computed_at: {
        type: Sequelize.DATE,
        allowNull: false,
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

    await queryInterface.addIndex("cost_sheets", ["bom_id"], {
      name: "cost_sheets_bom_id_unique",
      unique: true,
    });
    await queryInterface.addIndex("cost_sheets", ["tenant_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("cost_sheets");
  },
};
