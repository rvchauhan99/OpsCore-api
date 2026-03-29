"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const CostSheet = sequelize.define(
    "CostSheet",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      bom_id: { type: DataTypes.INTEGER, allowNull: false },
      material_cost: { type: DataTypes.DECIMAL(12, 4), allowNull: false, defaultValue: 0 },
      labor_cost: { type: DataTypes.DECIMAL(12, 4), allowNull: false, defaultValue: 0 },
      overhead_pct: { type: DataTypes.DECIMAL(5, 2), allowNull: false, defaultValue: 0 },
      overhead_cost: { type: DataTypes.DECIMAL(12, 4), allowNull: false, defaultValue: 0 },
      total_unit_cost: { type: DataTypes.DECIMAL(12, 4), allowNull: false, defaultValue: 0 },
      component_breakdown: { type: DataTypes.JSONB, allowNull: true, defaultValue: [] },
      routing_breakdown: { type: DataTypes.JSONB, allowNull: true, defaultValue: [] },
      computed_at: { type: DataTypes.DATE, allowNull: false },
      tenant_id: { type: DataTypes.INTEGER, allowNull: true },
      created_by: { type: DataTypes.INTEGER, allowNull: true },
      updated_by: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      tableName: "cost_sheets",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return CostSheet;
};
