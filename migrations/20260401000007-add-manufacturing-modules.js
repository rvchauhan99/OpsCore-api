"use strict";

/**
 * Adds all OpsCore Manufacturing-specific modules to the module_masters table.
 * These modules enable RBAC for: BOM, Work Centers, Manufacturing Orders, Work Orders,
 * Quality Control, Cost Sheets, and Production Schedule.
 */
module.exports = {
  async up(queryInterface) {
    const { QueryTypes } = require("sequelize");
    const sequelize = queryInterface.sequelize;

    // Fetch existing module routes to avoid duplicates
    const existing = await sequelize.query(
      "SELECT route FROM modules WHERE route IN (:routes)",
      {
        replacements: {
          routes: [
            "/bill-of-materials",
            "/work-centers",
            "/manufacturing-orders",
            "/work-orders",
            "/quality-control",
            "/cost-sheet",
          ],
        },
        type: QueryTypes.SELECT,
      }
    );
    const existingRoutes = new Set(existing.map((r) => r.route));

    const now = new Date();
    const modules = [
      {
        name: "Bill of Materials",
        route: "/bill-of-materials",
        icon: "IconAssembly",
        group: "Manufacturing",
        display_order: 100,
        authorize_with_params: false,
        created_at: now,
        updated_at: now,
      },
      {
        name: "Work Centers",
        route: "/work-centers",
        icon: "IconBuildingFactory2",
        group: "Manufacturing",
        display_order: 101,
        authorize_with_params: false,
        created_at: now,
        updated_at: now,
      },
      {
        name: "Manufacturing Orders",
        route: "/manufacturing-orders",
        icon: "IconClipboardList",
        group: "Manufacturing",
        display_order: 102,
        authorize_with_params: false,
        created_at: now,
        updated_at: now,
      },
      {
        name: "Work Orders",
        route: "/work-orders",
        icon: "IconTools",
        group: "Manufacturing",
        display_order: 103,
        authorize_with_params: false,
        created_at: now,
        updated_at: now,
      },
      {
        name: "Quality Control",
        route: "/quality-control",
        icon: "IconShieldCheck",
        group: "Manufacturing",
        display_order: 104,
        authorize_with_params: false,
        created_at: now,
        updated_at: now,
      },
      {
        name: "Cost Sheet",
        route: "/cost-sheet",
        icon: "IconCalculator",
        group: "Manufacturing",
        display_order: 105,
        authorize_with_params: false,
        created_at: now,
        updated_at: now,
      },
    ];

    const toInsert = modules.filter((m) => !existingRoutes.has(m.route));
    if (toInsert.length > 0) {
      await queryInterface.bulkInsert("modules", toInsert);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("modules", {
      route: [
        "/bill-of-materials",
        "/work-centers",
        "/manufacturing-orders",
        "/work-orders",
        "/quality-control",
        "/cost-sheet",
      ],
    });
  },
};
