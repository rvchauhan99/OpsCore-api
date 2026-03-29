"use strict";
const asyncHandler = require("express-async-handler");
const service = require("./financeReports.service.js");

exports.summary = asyncHandler(async (req, res) => {
  const data = await service.summary(req);
  res.json({ status: true, data });
});
