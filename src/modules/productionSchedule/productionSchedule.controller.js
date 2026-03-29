"use strict";
const asyncHandler = require("express-async-handler");
const service = require("./productionSchedule.service.js");

exports.list = asyncHandler(async (req, res) => {
  const result = await service.list(req);
  res.json({ status: true, ...result });
});

exports.create = asyncHandler(async (req, res) => {
  const item = await service.create(req.body, req);
  res.status(201).json({ status: true, data: item, message: "Schedule entry created" });
});

exports.update = asyncHandler(async (req, res) => {
  const item = await service.update(req.params.id, req.body, req);
  res.json({ status: true, data: item, message: "Schedule entry updated" });
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await service.remove(req.params.id, req);
  res.json({ status: true, ...result });
});
