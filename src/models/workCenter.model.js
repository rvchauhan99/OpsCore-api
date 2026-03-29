"use strict";
const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const WorkCenter = sequelize.define(
    "WorkCenter",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(100), allowNull: false },
      code: { type: DataTypes.STRING(30), allowNull: false },
      type: {
        type: DataTypes.ENUM("machine", "labor", "both"),
        allowNull: false,
        defaultValue: "machine",
      },
      capacity_per_day: { type: DataTypes.DECIMAL(10, 2), allowNull: true },
      cost_per_hour: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "maintenance"),
        allowNull: false,
        defaultValue: "active",
      },
      location: { type: DataTypes.STRING(200), allowNull: true },
      notes: { type: DataTypes.TEXT, allowNull: true },
      tenant_id: { type: DataTypes.INTEGER, allowNull: true },
      created_by: { type: DataTypes.INTEGER, allowNull: true },
      updated_by: { type: DataTypes.INTEGER, allowNull: true },
      deleted_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "work_centers",
      underscored: true,
      paranoid: true,
      deletedAt: "deleted_at",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return WorkCenter;
};
