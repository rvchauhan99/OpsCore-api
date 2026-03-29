"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");

const ProductionScheduleEntry = sequelize.define(
  "ProductionScheduleEntry",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tenant_id: { type: DataTypes.INTEGER, allowNull: true },
    manufacturing_order_id: { type: DataTypes.INTEGER, allowNull: true },
    work_center_id: { type: DataTypes.INTEGER, allowNull: true },
    scheduled_date: { type: DataTypes.DATEONLY, allowNull: false },
    hours_planned: { type: DataTypes.DECIMAL(8, 2), allowNull: false, defaultValue: 0 },
    status: {
      type: DataTypes.ENUM("planned", "confirmed", "done"),
      allowNull: false,
      defaultValue: "planned",
    },
    notes: { type: DataTypes.TEXT, allowNull: true },
    created_by: { type: DataTypes.INTEGER, allowNull: true },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
    deleted_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "production_schedule_entries",
    underscored: true,
    paranoid: true,
    deletedAt: "deleted_at",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = ProductionScheduleEntry;
