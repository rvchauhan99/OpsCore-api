"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const WorkOrder = sequelize.define(
    "WorkOrder",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      wo_number: { type: DataTypes.STRING(50), allowNull: false },
      manufacturing_order_id: { type: DataTypes.INTEGER, allowNull: false },
      work_center_id: { type: DataTypes.INTEGER, allowNull: true },
      routing_step_id: { type: DataTypes.INTEGER, allowNull: true },
      planned_qty: { type: DataTypes.DECIMAL(10, 4), allowNull: false, defaultValue: 1 },
      completed_qty: { type: DataTypes.DECIMAL(10, 4), allowNull: false, defaultValue: 0 },
      rejected_qty: { type: DataTypes.DECIMAL(10, 4), allowNull: false, defaultValue: 0 },
      status: {
        type: DataTypes.ENUM(
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
      planned_start: { type: DataTypes.DATEONLY, allowNull: true },
      planned_end: { type: DataTypes.DATEONLY, allowNull: true },
      actual_start: { type: DataTypes.DATE, allowNull: true },
      actual_end: { type: DataTypes.DATE, allowNull: true },
      operator_user_id: { type: DataTypes.INTEGER, allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
      tenant_id: { type: DataTypes.INTEGER, allowNull: true },
      created_by: { type: DataTypes.INTEGER, allowNull: true },
      updated_by: { type: DataTypes.INTEGER, allowNull: true },
      deleted_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "work_orders",
      underscored: true,
      paranoid: true,
      deletedAt: "deleted_at",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return WorkOrder;
};
