"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // BOM Headers — one per finished product version
    await queryInterface.createTable("bom_headers", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "The finished goods product this BOM is for",
      },
      version: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: "1.0",
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("draft", "active", "obsolete"),
        allowNull: false,
        defaultValue: "draft",
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Only one BOM per product can be default",
      },
      uom: {
        type: Sequelize.STRING(30),
        allowNull: true,
        comment: "Unit of measure for the finished good",
      },
      standard_qty: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 1,
        comment: "How many units this BOM produces",
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      total_material_cost: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: true,
        defaultValue: 0,
        comment: "Computed sum of component costs",
      },
      total_labor_cost: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: true,
        defaultValue: 0,
        comment: "Computed sum of routing step labor costs",
      },
      overhead_pct: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0,
        comment: "Overhead as percentage of material cost",
      },
      total_unit_cost: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: true,
        defaultValue: 0,
        comment: "Material + Labor + Overhead",
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

    await queryInterface.addIndex("bom_headers", ["product_id", "tenant_id"]);
    await queryInterface.addIndex("bom_headers", ["status"]);

    // BOM Components — materials/sub-assemblies used in the BOM
    await queryInterface.createTable("bom_components", {
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
      },
      component_product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "The raw material or sub-assembly product",
      },
      qty: {
        type: Sequelize.DECIMAL(10, 4),
        allowNull: false,
        defaultValue: 1,
      },
      uom: {
        type: Sequelize.STRING(30),
        allowNull: true,
      },
      is_sub_assembly: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      scrap_pct: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        defaultValue: 0,
        comment: "Expected scrap percentage for this component",
      },
      cost_per_unit: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: true,
        defaultValue: 0,
        comment: "Last purchase price or standard cost",
      },
      sequence_no: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      notes: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex("bom_components", ["bom_id"]);
    await queryInterface.addIndex("bom_components", ["component_product_id"]);

    // BOM Routings — production steps / operations
    await queryInterface.createTable("bom_routings", {
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
      },
      step_name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      work_center_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "work_centers", key: "id" },
        onDelete: "SET NULL",
      },
      duration_hrs: {
        type: Sequelize.DECIMAL(8, 4),
        allowNull: true,
        defaultValue: 0,
        comment: "Expected duration in hours per standard_qty",
      },
      labor_cost: {
        type: Sequelize.DECIMAL(12, 4),
        allowNull: true,
        defaultValue: 0,
        comment: "Computed: duration_hrs * work_center.cost_per_hour",
      },
      sequence_no: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 10,
      },
      is_qc_required: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      notes: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex("bom_routings", ["bom_id"]);
    await queryInterface.addIndex("bom_routings", ["work_center_id"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("bom_routings");
    await queryInterface.dropTable("bom_components");
    await queryInterface.dropTable("bom_headers");
  },
};
