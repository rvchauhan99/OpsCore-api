"use strict";

/**
 * Original reasons table used `name`; model + purchase-return seed expect `reason`,
 * `reason_type`, and `description`. Runs immediately before seed-purchase-return-reasons.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("reasons");
    if (table.name && !table.reason) {
      await queryInterface.renameColumn("reasons", "name", "reason");
    }
    if (!table.reason_type) {
      await queryInterface.addColumn("reasons", "reason_type", {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "general",
      });
    }
    if (!table.description) {
      await queryInterface.addColumn("reasons", "description", {
        type: Sequelize.TEXT,
        allowNull: true,
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("reasons");
    if (table.description) {
      await queryInterface.removeColumn("reasons", "description");
    }
    if (table.reason_type) {
      await queryInterface.removeColumn("reasons", "reason_type");
    }
    if (table.reason && !table.name) {
      await queryInterface.renameColumn("reasons", "reason", "name");
    }
  },
};
