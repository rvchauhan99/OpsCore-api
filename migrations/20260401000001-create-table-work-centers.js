"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("work_centers", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      code: {
        type: Sequelize.STRING(30),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM("machine", "labor", "both"),
        allowNull: false,
        defaultValue: "machine",
      },
      capacity_per_day: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: "Units or hours of production capacity per day",
      },
      cost_per_hour: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive", "maintenance"),
        allowNull: false,
        defaultValue: "active",
      },
      location: {
        type: Sequelize.STRING(200),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      tenant_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      updated_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    await queryInterface.addIndex("work_centers", ["tenant_id"]);
    await queryInterface.addIndex("work_centers", ["code", "tenant_id"], {
      name: "work_centers_code_tenant_unique",
      unique: true,
      where: { deleted_at: null },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("work_centers");
  },
};
