"use strict";

/**
 * OpsCore baseline modules (no solar CRM / pipeline parents).
 * B2B, manufacturing, and other product areas are added via follow-up migrations/seeds.
 */

module.exports = {
  async up(queryInterface, Sequelize) {
    const now = new Date();

    const parentModules = [
      {
        name: "Home",
        key: "home",
        parent_id: null,
        icon: "home",
        route: "/home",
        status: "active",
      },
      {
        name: "Task Planner",
        key: "task_planner",
        parent_id: null,
        icon: "calendar",
        route: "/task-planner",
        status: "active",
      },
      {
        name: "Procurement",
        key: "procurement",
        parent_id: null,
        icon: "procurement",
        route: "/procurement",
        status: "active",
      },
      {
        name: "Settings",
        key: "settings",
        parent_id: null,
        icon: "settings",
        route: "/settings",
        status: "active",
      },
    ];

    const [existingModules] = await queryInterface.sequelize.query(
      `SELECT key FROM modules WHERE deleted_at IS NULL`
    );
    const existingModuleKeys = existingModules.map((m) => m.key);

    const parentModulesToInsert = parentModules.filter((m) => !existingModuleKeys.includes(m.key));

    if (parentModulesToInsert.length > 0) {
      const [maxSeqResult] = await queryInterface.sequelize.query(
        `SELECT COALESCE(MAX(sequence), 0) as max_seq FROM modules WHERE deleted_at IS NULL`
      );
      const maxSeq = maxSeqResult[0]?.max_seq || 0;

      parentModulesToInsert.forEach((m, i) => {
        m.sequence = maxSeq + i + 1;
        m.created_at = now;
        m.updated_at = now;
      });

      await queryInterface.bulkInsert("modules", parentModulesToInsert, {});
    }

    const [allParents] = await queryInterface.sequelize.query(`
      SELECT id, key FROM modules WHERE parent_id IS NULL AND deleted_at IS NULL;
    `);

    const parentMap = allParents.reduce((map, mod) => {
      map[mod.key] = mod.id;
      return map;
    }, {});

    const childModulesData = [
      {
        name: "Users Master",
        key: "users_master",
        parent_id: parentMap["settings"],
        icon: "users",
        route: "/user-master",
        status: "active",
      },
      {
        name: "Roles",
        key: "roles",
        parent_id: parentMap["settings"],
        icon: "roles",
        route: "/role-master",
        status: "active",
      },
      {
        name: "Modules",
        key: "modules",
        parent_id: parentMap["settings"],
        icon: "modules",
        route: "/module-master",
        status: "active",
      },
      {
        name: "Roles Modules",
        key: "role_modules",
        parent_id: parentMap["settings"],
        icon: "role-modules",
        route: "/role-module",
        status: "active",
      },
      {
        name: "Masters",
        key: "masters",
        parent_id: parentMap["settings"],
        icon: "masters",
        route: "/masters",
        status: "active",
      },
      {
        name: "Company Profile",
        key: "company_profile",
        parent_id: parentMap["settings"],
        icon: "company_profile",
        route: "/company-profile",
        status: "active",
      },
      {
        name: "Product",
        key: "product",
        parent_id: parentMap["procurement"],
        icon: "product",
        route: "/product",
        status: "active",
      },
      {
        name: "Bill of Materials",
        key: "bill_of_materials",
        parent_id: parentMap["procurement"],
        icon: "bill_of_materials",
        route: "/bill-of-materials",
        status: "active",
      },
      {
        name: "Project Price List",
        key: "project_price_list",
        parent_id: parentMap["procurement"],
        icon: "project_price_list",
        route: "/project-price",
        status: "active",
      },
    ]
      .filter((m) => m.parent_id != null)
      .filter((m) => !existingModuleKeys.includes(m.key));

    if (childModulesData.length > 0) {
      const [maxSeqResult] = await queryInterface.sequelize.query(
        `SELECT COALESCE(MAX(sequence), 0) as max_seq FROM modules WHERE deleted_at IS NULL`
      );
      const maxSeq = maxSeqResult[0]?.max_seq || 0;
      let seq = maxSeq + 1;

      const childModules = childModulesData.map((m) => ({
        ...m,
        sequence: seq++,
        created_at: now,
        updated_at: now,
      }));

      await queryInterface.bulkInsert("modules", childModules, {});
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("modules", null, {});
  },
};
