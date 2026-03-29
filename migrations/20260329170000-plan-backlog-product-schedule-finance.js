"use strict";

const { QueryTypes } = require("sequelize");

/**
 * Plan backlog: product classification, production schedule table, finance + schedule modules,
 * optional MO link to B2B SO line, SuperAdmin grants for new modules.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("products", "category", {
      type: Sequelize.STRING(120),
      allowNull: true,
    });
    await queryInterface.addColumn("products", "subcategory", {
      type: Sequelize.STRING(120),
      allowNull: true,
    });

    await queryInterface.addColumn("manufacturing_orders", "b2b_sales_order_item_id", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: { model: "b2b_sales_order_items", key: "id" },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
    await queryInterface.addIndex("manufacturing_orders", ["b2b_sales_order_item_id"], {
      name: "manufacturing_orders_b2b_sales_order_item_id_idx",
    });

    await queryInterface.createTable("production_schedule_entries", {
      id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      tenant_id: { type: Sequelize.INTEGER, allowNull: true },
      manufacturing_order_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "manufacturing_orders", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      work_center_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "work_centers", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      scheduled_date: { type: Sequelize.DATEONLY, allowNull: false },
      hours_planned: { type: Sequelize.DECIMAL(8, 2), allowNull: false, defaultValue: 0 },
      status: {
        type: Sequelize.ENUM("planned", "confirmed", "done"),
        allowNull: false,
        defaultValue: "planned",
      },
      notes: { type: Sequelize.TEXT, allowNull: true },
      created_by: { type: Sequelize.INTEGER, allowNull: true },
      updated_by: { type: Sequelize.INTEGER, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal("CURRENT_TIMESTAMP") },
      deleted_at: { type: Sequelize.DATE, allowNull: true },
    });
    await queryInterface.addIndex("production_schedule_entries", ["tenant_id", "scheduled_date"], {
      name: "prod_sched_tenant_date_idx",
    });

    const sequelize = queryInterface.sequelize;

    const moduleSpecs = [
      { name: "Finance", key: "finance_reports", route: "/finance", icon: "account_balance" },
      { name: "Production Schedule", key: "production_schedule", route: "/production-schedule", icon: "calendar_month" },
    ];

    for (const s of moduleSpecs) {
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

    const [roleRows] = await sequelize.query(
      `SELECT id FROM roles WHERE name = 'SuperAdmin' AND deleted_at IS NULL LIMIT 1`
    );
    if (roleRows?.length) {
      const roleId = roleRows[0].id;
      const keys = ["finance_reports", "production_schedule"];
      for (const key of keys) {
        const [modRows] = await sequelize.query(
          `SELECT id FROM modules WHERE key = :key AND deleted_at IS NULL LIMIT 1`,
          { replacements: { key } }
        );
        if (!modRows?.length) continue;
        const moduleId = modRows[0].id;
        const [existingRm] = await sequelize.query(
          `SELECT id FROM role_modules WHERE role_id = :rid AND module_id = :mid AND deleted_at IS NULL LIMIT 1`,
          { replacements: { rid: roleId, mid: moduleId } }
        );
        if (existingRm?.length) continue;
        await sequelize.query(
          `INSERT INTO role_modules (role_id, module_id, can_create, can_read, can_update, can_delete, listing_criteria, created_at, updated_at)
           VALUES (:rid, :mid, true, true, true, true, 'all', NOW(), NOW())`,
          { replacements: { rid: roleId, mid: moduleId } }
        );
      }
    }

    await sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'bill_of_materials'
        ) AND NOT EXISTS (SELECT 1 FROM bill_of_materials LIMIT 1) THEN
          DROP TABLE IF EXISTS bill_of_materials CASCADE;
        END IF;
      END $$;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      `UPDATE modules SET deleted_at = NOW(), updated_at = NOW()
       WHERE key IN ('finance_reports', 'production_schedule') AND deleted_at IS NULL`
    );
    await queryInterface.dropTable("production_schedule_entries");
    await queryInterface.removeIndex("manufacturing_orders", "manufacturing_orders_b2b_sales_order_item_id_idx");
    await queryInterface.removeColumn("manufacturing_orders", "b2b_sales_order_item_id");
    await queryInterface.removeColumn("products", "subcategory");
    await queryInterface.removeColumn("products", "category");
  },
};
