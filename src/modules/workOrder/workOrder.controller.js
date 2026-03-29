"use strict";
const asyncHandler = require("express-async-handler");
const service = require("./workOrder.service.js");

exports.list = asyncHandler(async (req, res) => {
  const result = await service.list(req);
  res.json({ status: true, ...result });
});
exports.getById = asyncHandler(async (req, res) => {
  const item = await service.getById(req.params.id, req);
  res.json({ status: true, data: item });
});
exports.create = asyncHandler(async (req, res) => {
  const item = await service.create(req.body, req);
  res.status(201).json({ status: true, data: item, message: "Work Order created" });
});
exports.update = asyncHandler(async (req, res) => {
  const item = await service.update(req.params.id, req.body, req);
  res.json({ status: true, data: item, message: "Work Order updated" });
});
exports.updateStatus = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const item = await service.updateStatus(req.params.id, status, notes, req);
  res.json({ status: true, data: item, message: `Status updated to ${status}` });
});
exports.remove = asyncHandler(async (req, res) => {
  const result = await service.remove(req.params.id, req);
  res.json({ status: true, ...result });
});
