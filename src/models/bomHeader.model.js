"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");

const BomHeader = sequelize.define(
  "BomHeader",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    product_id: { type: DataTypes.INTEGER, allowNull: false },
    version: { type: DataTypes.STRING(20), allowNull: false, defaultValue: "1.0" },
    name: { type: DataTypes.STRING(200), allowNull: false },
    status: {
      type: DataTypes.ENUM("draft", "active", "obsolete"),
      allowNull: false,
      defaultValue: "draft",
    },
    is_default: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    uom: { type: DataTypes.STRING(30), allowNull: true },
    standard_qty: { type: DataTypes.DECIMAL(10, 4), allowNull: false, defaultValue: 1 },
    notes: { type: DataTypes.TEXT, allowNull: true },
    total_material_cost: { type: DataTypes.DECIMAL(12, 4), allowNull: true, defaultValue: 0 },
    total_labor_cost: { type: DataTypes.DECIMAL(12, 4), allowNull: true, defaultValue: 0 },
    overhead_pct: { type: DataTypes.DECIMAL(5, 2), allowNull: true, defaultValue: 0 },
    total_unit_cost: { type: DataTypes.DECIMAL(12, 4), allowNull: true, defaultValue: 0 },
    tenant_id: { type: DataTypes.INTEGER, allowNull: true },
    created_by: { type: DataTypes.INTEGER, allowNull: true },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
    deleted_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "bom_headers",
    underscored: true,
    paranoid: true,
    deletedAt: "deleted_at",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = BomHeader;
