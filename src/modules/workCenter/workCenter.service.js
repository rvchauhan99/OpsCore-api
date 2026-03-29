"use strict";
const { Op } = require("sequelize");
const db = require("../../models/index.js");
const { WorkCenter } = db;

const getTenantId = (req) => req.tenantId || req.user?.tenant_id || null;

const list = async (req) => {
  const tenantId = getTenantId(req);
  const { search, status, page = 1, limit = 50 } = req.query;

  const where = { deleted_at: null };
  if (tenantId) where.tenant_id = tenantId;
  if (status) where.status = status;
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { code: { [Op.iLike]: `%${search}%` } },
      { location: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const offset = (parseInt(page) - 1) * parseInt(limit);
  const { count, rows } = await WorkCenter.findAndCountAll({
    where,
    order: [["name", "ASC"]],
    limit: parseInt(limit),
    offset,
  });

  return {
    total: count,
    page: parseInt(page),
    limit: parseInt(limit),
    data: rows,
  };
};

const getById = async (id, req) => {
  const tenantId = getTenantId(req);
  const where = { id, deleted_at: null };
  if (tenantId) where.tenant_id = tenantId;

  const workCenter = await WorkCenter.findOne({ where });
  if (!workCenter) {
    const err = new Error("Work center not found");
    err.statusCode = 404;
    throw err;
  }
  return workCenter;
};

const create = async (data, req) => {
  const tenantId = getTenantId(req);
  return await WorkCenter.create({ ...data, tenant_id: tenantId });
};

const update = async (id, data, req) => {
  const workCenter = await getById(id, req);
  return await workCenter.update(data);
};

const remove = async (id, req) => {
  const workCenter = await getById(id, req);
  await workCenter.update({ deleted_at: new Date() });
  return { message: "Work center deleted" };
};

module.exports = { list, getById, create, update, remove };
