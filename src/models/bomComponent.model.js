"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const BomComponent = sequelize.define(
    "BomComponent",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      bom_id: { type: DataTypes.INTEGER, allowNull: false },
      component_product_id: { type: DataTypes.INTEGER, allowNull: false },
      qty: { type: DataTypes.DECIMAL(10, 4), allowNull: false, defaultValue: 1 },
      uom: { type: DataTypes.STRING(30), allowNull: true },
      is_sub_assembly: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
      scrap_pct: { type: DataTypes.DECIMAL(5, 2), allowNull: true, defaultValue: 0 },
      cost_per_unit: { type: DataTypes.DECIMAL(12, 4), allowNull: true, defaultValue: 0 },
      sequence_no: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 10 },
      notes: { type: DataTypes.TEXT, allowNull: true },
    },
    {
      tableName: "bom_components",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return BomComponent;
};
