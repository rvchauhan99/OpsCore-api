"use strict";

/** Link delivery challans to B2B sales orders; relax legacy order_id constraint. */

module.exports = {
  async up(queryInterface, Sequelize) {
    const challans = await queryInterface.describeTable("challans");
    if (!challans.b2b_sales_order_id) {
      await queryInterface.addColumn("challans", "b2b_sales_order_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "b2b_sales_orders", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    }
    if (challans.order_id && challans.order_id.allowNull === false) {
      await queryInterface.changeColumn("challans", "order_id", {
        type: Sequelize.BIGINT,
        allowNull: true,
      });
    }

    const items = await queryInterface.describeTable("challan_items");
    if (!items.b2b_sales_order_item_id) {
      await queryInterface.addColumn("challan_items", "b2b_sales_order_item_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "b2b_sales_order_items", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      });
    }
  },

  async down(queryInterface, Sequelize) {
    const items = await queryInterface.describeTable("challan_items");
    if (items.b2b_sales_order_item_id) {
      await queryInterface.removeColumn("challan_items", "b2b_sales_order_item_id");
    }
    const challans = await queryInterface.describeTable("challans");
    if (challans.b2b_sales_order_id) {
      await queryInterface.removeColumn("challans", "b2b_sales_order_id");
    }
    if (challans.order_id) {
      await queryInterface.changeColumn("challans", "order_id", {
        type: Sequelize.BIGINT,
        allowNull: false,
      });
    }
  },
};
