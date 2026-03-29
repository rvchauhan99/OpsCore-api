"use strict";

const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    // Fetch role dynamically
    const [roles] = await queryInterface.sequelize.query(
      `SELECT id, name FROM roles WHERE deleted_at IS NULL`
    );
    const adminRole = roles.find((r) => r.name === "SuperAdmin");

    if (!adminRole)
      throw new Error("Admin role not found. Please seed roles first.");

    // Any row with this email blocks inserts: table-level UNIQUE(email) still applies to soft-deleted rows.
    const [existingUsers] = await queryInterface.sequelize.query(
      `SELECT LOWER(TRIM(email)) AS email FROM users WHERE email IS NOT NULL`
    );
    const existingEmails = new Set(existingUsers.map((u) => String(u.email)));

    const hashedPassword = await bcrypt.hash("Admin@123", 10);
    const now = new Date();

    const usersToInsert = [
      {
        name: "Super Admin User",
        email: "superadmin@user.com",
        password: hashedPassword,
        google_id: null,
        photo: null,
        role_id: adminRole.id,
        status: "active",
        last_login: null,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
      {
        name: "Admin User",
        email: "admin@user.com",
        password: hashedPassword,
        google_id: null,
        photo: null,
        role_id: adminRole.id,
        status: "active",
        last_login: null,
        created_at: now,
        updated_at: now,
        deleted_at: null,
      },
    ].filter((user) => !existingEmails.has(String(user.email).toLowerCase().trim()));

    if (usersToInsert.length > 0) {
      await queryInterface.bulkInsert("users", usersToInsert);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users", null, {});
  },
};
