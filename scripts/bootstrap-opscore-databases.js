#!/usr/bin/env node
/**
 * Bootstrap OpsCore PostgreSQL databases (registry + tenant), run migrations,
 * seed sample data, grant SuperAdmin full module access, and keep a single admin user.
 *
 * Prerequisites:
 *   - PostgreSQL running; DB_USER can CREATE DATABASE (or create DBs manually).
 *   - .env: DB_HOST, DB_PORT, DB_USER, DB_PASS, MASTER_ENCRYPTION_KEY (if multi-tenant)
 *   - Optional: TENANT_REGISTRY_DB_URL (otherwise built from DB_* + OPSCORE_REGISTRY_DB)
 *
 * Usage:
 *   node scripts/bootstrap-opscore-databases.js
 *   node scripts/bootstrap-opscore-databases.js --dedicated
 *   node scripts/bootstrap-opscore-databases.js --skip-create-db
 *
 * Env overrides:
 *   OPSCORE_REGISTRY_DB=opscore_registry
 *   OPSCORE_TENANT_DB=opscore
 *   OPSCORE_TENANT_KEY=default
 */

/* eslint-disable no-console */
"use strict";

const path = require("path");
const { execSync } = require("child_process");
const { Sequelize } = require("sequelize");

require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const ROOT = path.join(__dirname, "..");

function parseArgs(argv) {
  const flags = new Set();
  for (const a of argv) {
    if (a.startsWith("--")) flags.add(a);
  }
  return {
    dedicated: flags.has("--dedicated"),
    skipCreateDb: flags.has("--skip-create-db"),
  };
}

function buildPostgresUrl(user, password, host, port, database) {
  const u = encodeURIComponent(user || "");
  const p = encodeURIComponent(password || "");
  return `postgres://${u}:${p}@${host}:${port}/${database}`;
}

function getConnectionParams() {
  const host = process.env.DB_HOST || "127.0.0.1";
  const port = parseInt(process.env.DB_PORT, 10) || 5432;
  const user = process.env.DB_USER;
  const pass = process.env.DB_PASS;
  if (!user) throw new Error("DB_USER is required");
  return { host, port, user, pass };
}

function getRegistryUrl(registryDbName) {
  if (process.env.TENANT_REGISTRY_DB_URL && process.env.TENANT_REGISTRY_DB_URL.trim()) {
    return process.env.TENANT_REGISTRY_DB_URL.trim();
  }
  const { host, port, user, pass } = getConnectionParams();
  return buildPostgresUrl(user, pass, host, port, registryDbName);
}

async function ensureDatabase({ host, port, user, pass, database }) {
  const admin = new Sequelize("postgres", user, pass || undefined, {
    host,
    port,
    dialect: "postgres",
    logging: false,
  });
  await admin.authenticate();
  try {
    const [rows] = await admin.query(
      `SELECT 1 FROM pg_database WHERE datname = :name LIMIT 1`,
      { replacements: { name: database } }
    );
    if (rows.length === 0) {
      await admin.query(`CREATE DATABASE "${database.replace(/"/g, '""')}"`);
      console.log(`Created database: ${database}`);
    } else {
      console.log(`Database already exists: ${database}`);
    }
  } finally {
    await admin.close();
  }
}

async function registryTableExists(registryUrl, tableName) {
  const sequelize = new Sequelize(registryUrl, { dialect: "postgres", logging: false });
  try {
    await sequelize.authenticate();
    const [rows] = await sequelize.query(
      `SELECT to_regclass(:reg) AS oid`,
      { replacements: { reg: `public.${tableName}` } }
    );
    return Boolean(rows[0]?.oid);
  } finally {
    await sequelize.close();
  }
}

function runCmd(command, extraEnv = {}) {
  const env = {
    ...process.env,
    NODE_ENV: process.env.NODE_ENV || "development",
    ...extraEnv,
  };
  for (const k of Object.keys(env)) {
    if (env[k] === undefined) delete env[k];
  }
  execSync(command, {
    cwd: ROOT,
    stdio: "inherit",
    env,
  });
}

async function syncSuperAdminAllModules(tenantUrl) {
  const sequelize = new Sequelize(tenantUrl, { dialect: "postgres", logging: false });
  try {
    await sequelize.authenticate();
    const now = new Date();
    const [inserted] = await sequelize.query(
      `
      INSERT INTO role_modules (role_id, module_id, can_create, can_read, can_update, can_delete, listing_criteria, created_at, updated_at)
      SELECT r.id, m.id, true, true, true, true, 'all', :now, :now
      FROM roles r
      CROSS JOIN modules m
      WHERE r.name = 'SuperAdmin'
        AND r.deleted_at IS NULL
        AND m.deleted_at IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM role_modules rm
          WHERE rm.role_id = r.id AND rm.module_id = m.id AND rm.deleted_at IS NULL
        )
      RETURNING id
      `,
      { replacements: { now } }
    );
    const n = Array.isArray(inserted) ? inserted.length : 0;
    console.log(
      n > 0
        ? `Linked ${n} new module permission row(s) to SuperAdmin.`
        : "SuperAdmin already had permissions for all modules (no new rows)."
    );
  } finally {
    await sequelize.close();
  }
}

async function removeSecondarySeedAdmin(tenantUrl) {
  const sequelize = new Sequelize(tenantUrl, { dialect: "postgres", logging: false });
  try {
    await sequelize.authenticate();
    const [, meta] = await sequelize.query(
      `UPDATE users SET deleted_at = NOW(), updated_at = NOW()
       WHERE email = 'admin@user.com' AND deleted_at IS NULL`
    );
    const n = meta && typeof meta.rowCount === "number" ? meta.rowCount : 0;
    if (n > 0) console.log(`Soft-deleted extra seed user admin@user.com (${n} row).`);
    else console.log("No extra admin@user.com user to remove (already absent or removed).");
  } finally {
    await sequelize.close();
  }
}

async function main() {
  const { dedicated, skipCreateDb } = parseArgs(process.argv.slice(2));
  const { host, port, user, pass } = getConnectionParams();
  const registryDbName = process.env.OPSCORE_REGISTRY_DB || "opscore_registry";
  const tenantDbName = process.env.OPSCORE_TENANT_DB || "opscore";
  const tenantKey = (process.env.OPSCORE_TENANT_KEY || "default").trim();

  console.log("OpsCore database bootstrap");
  console.log("==========================");
  console.log(`Host: ${host}:${port} user: ${user}`);
  console.log(`Registry DB: ${registryDbName}`);
  console.log(`Tenant DB:   ${tenantDbName}`);
  console.log(`Mode:        ${dedicated ? "dedicated (single DB, no registry tenant row)" : "multi-tenant"}\n`);

  if (!skipCreateDb) {
    await ensureDatabase({ host, port, user, pass, database: tenantDbName });
    if (!dedicated) {
      await ensureDatabase({ host, port, user, pass, database: registryDbName });
    }
  }

  const tenantUrl = buildPostgresUrl(user, pass, host, port, tenantDbName);

  if (!dedicated) {
    if (!process.env.MASTER_ENCRYPTION_KEY || !String(process.env.MASTER_ENCRYPTION_KEY).trim()) {
      console.error("MASTER_ENCRYPTION_KEY is required for multi-tenant bootstrap (tenant DB password encryption).");
      console.error("Generate one e.g.: openssl rand -base64 32");
      process.exit(1);
    }

    const registryUrl = getRegistryUrl(registryDbName);
    process.env.TENANT_REGISTRY_DB_URL = registryUrl;

    const regReady = await registryTableExists(registryUrl, "tenants");
    if (!regReady) {
      console.log("\nRunning registry migrations...");
      runCmd("node scripts/run-registry-migrations.js");
    } else {
      console.log("\nRegistry already has schema (tenants table exists); skipping registry migrations.");
    }

    const { initializeRegistryConnection } = require("../src/config/registryDb.js");
    await initializeRegistryConnection();
    const tenantAdmin = require("../src/modules/admin/tenantAdmin.service.js");

    console.log(`\nRegistering tenant_key=${tenantKey} -> db ${tenantDbName} ...`);
    try {
      await tenantAdmin.createTenant({
        tenant_key: tenantKey,
        mode: "shared",
        status: "active",
        db_host: host,
        db_port: port,
        db_name: tenantDbName,
        db_user: user,
        db_password: pass ?? "",
      });
      console.log("Tenant row created in registry.");
    } catch (err) {
      if (err.statusCode === 409) {
        console.log("Tenant key already registered; continuing.");
      } else {
        throw err;
      }
    }

    console.log("\nRunning tenant migrations (all active shared tenants)...");
    runCmd("node scripts/run-tenant-migrations.js");
  } else {
    console.log("\nDedicated mode: running migrations against DB_NAME only...");
    runCmd("node scripts/run-tenant-migrations.js", {
      TENANT_REGISTRY_DB_URL: "",
      DB_NAME: tenantDbName,
      DB_HOST: host,
      DB_PORT: String(port),
      DB_USER: user,
      DB_PASS: pass ?? "",
    });
  }

  console.log("\nSeeding tenant database...");
  runCmd("npx sequelize-cli db:seed:all --env development", {
    DB_NAME: tenantDbName,
    DB_HOST: host,
    DB_PORT: String(port),
    DB_USER: user,
    DB_PASS: pass ?? "",
    TENANT_REGISTRY_DB_URL: dedicated ? "" : process.env.TENANT_REGISTRY_DB_URL,
  });

  console.log("\nEnsuring SuperAdmin has access to every module...");
  await syncSuperAdminAllModules(tenantUrl);

  console.log("\nKeeping a single bootstrap admin (superadmin@user.com)...");
  await removeSecondarySeedAdmin(tenantUrl);

  console.log("\n==========================");
  console.log("Done.");
  console.log(`Login (sample): superadmin@user.com / Admin@123`);
  console.log(`Tenant key (multi-tenant): ${tenantKey}`);
  if (!dedicated) {
    console.log("Set TENANT_REGISTRY_DB_URL in .env to:");
    console.log(`  ${getRegistryUrl(registryDbName)}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
