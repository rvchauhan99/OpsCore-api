"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");

const QcCheck = sequelize.define(
  "QcCheck",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    work_order_id: { type: DataTypes.INTEGER, allowNull: false },
    qc_template_id: { type: DataTypes.INTEGER, allowNull: true },
    inspector_user_id: { type: DataTypes.INTEGER, allowNull: true },
    result: {
      type: DataTypes.ENUM("pass", "fail", "partial"),
      allowNull: false,
      defaultValue: "partial",
    },
    qty_inspected: { type: DataTypes.DECIMAL(10, 4), allowNull: true, defaultValue: 0 },
    qty_passed: { type: DataTypes.DECIMAL(10, 4), allowNull: true, defaultValue: 0 },
    qty_failed: { type: DataTypes.DECIMAL(10, 4), allowNull: true, defaultValue: 0 },
    check_results: { type: DataTypes.JSONB, allowNull: true, defaultValue: [] },
    notes: { type: DataTypes.TEXT, allowNull: true },
    checked_at: { type: DataTypes.DATE, allowNull: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: true },
    created_by: { type: DataTypes.INTEGER, allowNull: true },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
  },
  {
    tableName: "qc_checks",
    underscored: true,
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = QcCheck;
