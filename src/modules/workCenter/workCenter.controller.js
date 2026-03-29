"use strict";
const asyncHandler = require("express-async-handler");
const service = require("./workCenter.service.js");

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
  res.status(201).json({ status: true, data: item, message: "Work center created" });
});

exports.update = asyncHandler(async (req, res) => {
  const item = await service.update(req.params.id, req.body, req);
  res.json({ status: true, data: item, message: "Work center updated" });
});

exports.remove = asyncHandler(async (req, res) => {
  const result = await service.remove(req.params.id, req);
  res.json({ status: true, ...result });
});
