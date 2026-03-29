"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const names = tables.map((t) => (typeof t === "string" ? t : t.tableName || t));
    if (!names.includes("order_payment_details")) {
      console.log(
        "[migrations] skip approval_remarks on order_payment_details (table not present in this product schema)."
      );
      return;
    }
    await queryInterface.addColumn("order_payment_details", "approval_remarks", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const names = tables.map((t) => (typeof t === "string" ? t : t.tableName || t));
    if (!names.includes("order_payment_details")) return;
    await queryInterface.removeColumn("order_payment_details", "approval_remarks");
  },
};

