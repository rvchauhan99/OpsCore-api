"use strict";
const { DataTypes } = require("sequelize");
const sequelize = require("../config/db.js");

const QcTemplate = sequelize.define(
  "QcTemplate",
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(200), allowNull: false },
    product_id: { type: DataTypes.INTEGER, allowNull: true },
    bom_routing_id: { type: DataTypes.INTEGER, allowNull: true },
    check_points: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    notes: { type: DataTypes.TEXT, allowNull: true },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
    tenant_id: { type: DataTypes.INTEGER, allowNull: true },
    created_by: { type: DataTypes.INTEGER, allowNull: true },
    updated_by: { type: DataTypes.INTEGER, allowNull: true },
    deleted_at: { type: DataTypes.DATE, allowNull: true },
  },
  {
    tableName: "qc_templates",
    underscored: true,
    paranoid: true,
    deletedAt: "deleted_at",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

module.exports = QcTemplate;
