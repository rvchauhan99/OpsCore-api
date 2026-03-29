"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");

const ManufacturingOrder = sequelize.define(
  "ManufacturingOrder",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    mo_number: { type: DataTypes.STRING(50), allowNull: false },
      sales_order_id: { type: DataTypes.INTEGER, allowNull: true },
      b2b_sales_order_item_id: { type: DataTypes.INTEGER, allowNull: true },
      product_id: { type: DataTypes.INTEGER, allowNull: false },
    bom_id: { type: DataTypes.INTEGER, allowNull: true },
    planned_qty: { type: DataTypes.DECIMAL(10, 4), allowNull: false, defaultValue: 1 },
    produced_qty: { type: DataTypes.DECIMAL(10, 4), allowNull: false, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM("draft", "released", "in_progress", "completed", "cancelled"),
      allowNull: false,
      defaultValue: "draft",
    },
    priority: {
      type: DataTypes.ENUM("low", "normal", "high", "urgent"),
      allowNull: false,
      defaultValue: "normal",
    },
    planned_start: { type: DataTypes.DATEONLY, allowNull: true },
    planned_end: { type: DataTypes.DATEONLY, allowNull: true },
    actual_start: { type: DataTypes.DATE, allowNull: true },
    actual_end: { type: DataTypes.DATE, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: true },
    created_by: { type: DataTypes.INTEGER, allowNull: true },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
    deleted_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "manufacturing_orders",
    underscored: true,
    paranoid: true,
    deletedAt: "deleted_at",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = ManufacturingOrder;
