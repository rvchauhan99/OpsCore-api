"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const names = tables.map((t) => (typeof t === "string" ? t : t.tableName || t));
    if (!names.includes("project_phases")) {
      console.log("[seed] skip project_phases (table not in this schema).");
      return;
    }
    await queryInterface.bulkInsert(
      "project_phases",
      [
        {
          id: 1,
          name: "Three Phase",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          name: "Single Phase",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const names = tables.map((t) => (typeof t === "string" ? t : t.tableName || t));
    if (!names.includes("project_phases")) return;
    await queryInterface.bulkDelete("project_phases", null, {});
  },
};
