"use strict";

const { QueryTypes } = require("sequelize");

/**
 * Adds OpsCore Manufacturing modules to `modules` (same shape as other module migrations).
 */
module.exports = {
  async up(queryInterface) {
    const sequelize = queryInterface.sequelize;

    const specs = [
      { name: "Bill of Materials", key: "bill_of_materials", route: "/bill-of-materials", icon: "assembly" },
      { name: "Work Centers", key: "work_centers", route: "/work-centers", icon: "factory" },
      { name: "Manufacturing Orders", key: "manufacturing_orders", route: "/manufacturing-orders", icon: "clipboard" },
      { name: "Work Orders", key: "work_orders", route: "/work-orders", icon: "tools" },
      { name: "Quality Control", key: "quality_control", route: "/quality-control", icon: "shield" },
      { name: "Cost Sheet", key: "cost_sheet", route: "/cost-sheet", icon: "calculator" },
    ];

    for (const s of specs) {
      const existing = await sequelize.query(
        `SELECT id FROM modules WHERE key = :key AND deleted_at IS NULL LIMIT 1`,
        { replacements: { key: s.key }, type: QueryTypes.SELECT }
      );
      if (existing && existing.length > 0) continue;

      const [{ max_seq }] = await sequelize.query(
        `SELECT COALESCE(MAX(sequence), 0) AS max_seq FROM modules WHERE deleted_at IS NULL`,
        { type: QueryTypes.SELECT }
      );
      const seq = (parseInt(max_seq, 10) || 0) + 1;

      await sequelize.query(
        `INSERT INTO modules (name, key, parent_id, icon, route, sequence, status, authorize_with_params, created_at, updated_at)
         VALUES (:name, :key, NULL, :icon, :route, :seq, 'active', false, NOW(), NOW())`,
        {
          replacements: {
            name: s.name,
            key: s.key,
            icon: s.icon,
            route: s.route,
            seq,
          },
        }
      );
    }
  },

  async down(queryInterface) {
    const keys = [
      "bill_of_materials",
      "work_centers",
      "manufacturing_orders",
      "work_orders",
      "quality_control",
      "cost_sheet",
    ];
    const literal = keys.map((k) => `'${String(k).replace(/'/g, "''")}'`).join(",");
    await queryInterface.sequelize.query(
      `UPDATE modules SET deleted_at = NOW(), updated_at = NOW()
       WHERE key IN (${literal}) AND deleted_at IS NULL`
    );
  },
};
