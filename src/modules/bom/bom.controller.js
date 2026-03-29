"use strict";
const asyncHandler = require("express-async-handler");
const service = require("./bom.service.js");

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
  res.status(201).json({ status: true, data: item, message: "BOM created" });
});

exports.update = asyncHandler(async (req, res) => {
  const item = await service.update(req.params.id, req.body, req);
  res.json({ status: true, data: item, message: "BOM updated" });
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await service.remove(req.params.id, req);
  res.json({ status: true, ...result });
});

exports.cloneVersion = asyncHandler(async (req, res) => {
  const item = await service.cloneVersion(req.params.id, req);
  res.status(201).json({ status: true, data: item, message: "BOM version cloned" });
});

exports.computeCost = asyncHandler(async (req, res) => {
  const bom = await service.getById(req.params.id, req);
  const costSheet = await service.computeBomCost(bom, req.body?.overhead_pct);
  res.json({ status: true, data: costSheet, message: "Cost sheet computed" });
});
