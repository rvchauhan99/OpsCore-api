"use strict";

/** Soft-delete legacy solar CRM / pipeline menu modules and detached role_module rows. */

const SOLAR_MODULE_KEYS = [
  "marketing_leads",
  "inquiry_management",
  "order_management",
  "execution_planner",
  "add_quick_service",
  "pending_orders",
  "confirm_orders",
  "closed_orders",
  "cancelled_orders",
  "inquiry",
  "site_visit",
  "followup",
  "quotation",
];

module.exports = {
  async up(queryInterface) {
    const keysSql = SOLAR_MODULE_KEYS.map((k) => `'${String(k).replace(/'/g, "''")}'`).join(", ");
    await queryInterface.sequelize.query(`
      UPDATE role_modules
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE deleted_at IS NULL
        AND module_id IN (
          SELECT id FROM modules WHERE deleted_at IS NULL AND key IN (${keysSql})
        )
    `);
    await queryInterface.sequelize.query(`
      UPDATE modules
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE deleted_at IS NULL AND key IN (${keysSql})
    `);
  },

  async down() {
    // Intentionally left blank: restoring deleted menu keys is unsafe without tenant review.
  },
};
