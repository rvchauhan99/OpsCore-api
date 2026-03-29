"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const BomRouting = sequelize.define(
    "BomRouting",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      bom_id: { type: DataTypes.INTEGER, allowNull: false },
      step_name: { type: DataTypes.STRING(200), allowNull: false },
      work_center_id: { type: DataTypes.INTEGER, allowNull: true },
      duration_hrs: { type: DataTypes.DECIMAL(8, 4), allowNull: true, defaultValue: 0 },
      labor_cost: { type: DataTypes.DECIMAL(12, 4), allowNull: true, defaultValue: 0 },
      sequence_no: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 10 },
      is_qc_required: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      notes: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: "bom_routings",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return BomRouting;
};
