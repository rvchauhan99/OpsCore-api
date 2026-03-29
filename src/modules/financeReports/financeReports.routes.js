"use strict";
const { Router } = require("express");
const ctrl = require("./financeReports.controller.js");

const router = Router();
router.get("/summary", ctrl.summary);
module.exports = router;
