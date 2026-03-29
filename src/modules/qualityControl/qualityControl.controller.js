"use strict";
const asyncHandler = require("express-async-handler");
const service = require("./qualityControl.service.js");

// Templates
exports.listTemplates = asyncHandler(async (req, res) => {
  const data = await service.listTemplates(req);
  res.json({ status: true, data });
});
exports.getTemplate = asyncHandler(async (req, res) => {
  const data = await service.getTemplateById(req.params.id, req);
  res.json({ status: true, data });
});
exports.createTemplate = asyncHandler(async (req, res) => {
  const data = await service.createTemplate(req.body, req);
  res.status(201).json({ status: true, data, message: "QC Template created" });
});
exports.updateTemplate = asyncHandler(async (req, res) => {
  const data = await service.updateTemplate(req.params.id, req.body, req);
  res.json({ status: true, data, message: "QC Template updated" });
});
exports.removeTemplate = asyncHandler(async (req, res) => {
  const result = await service.removeTemplate(req.params.id, req);
  res.json({ status: true, ...result });
});

// Checks
exports.listChecks = asyncHandler(async (req, res) => {
  const result = await service.listChecks(req);
  res.json({ status: true, ...result });
});
exports.getCheck = asyncHandler(async (req, res) => {
  const data = await service.getCheckById(req.params.id, req);
  res.json({ status: true, data });
});
exports.createCheck = asyncHandler(async (req, res) => {
  const data = await service.createCheck(req.body, req);
  res.status(201).json({ status: true, data, message: "QC Check recorded" });
});
exports.updateCheck = asyncHandler(async (req, res) => {
  const data = await service.updateCheck(req.params.id, req.body, req);
  res.json({ status: true, data, message: "QC Check updated" });
});
