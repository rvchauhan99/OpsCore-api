"use strict";
const { Router } = require("express");
const ctrl = require("./qualityControl.controller.js");
const router = Router();

// QC Templates
router.get("/templates", ctrl.listTemplates);
router.get("/templates/:id", ctrl.getTemplate);
router.post("/templates", ctrl.createTemplate);
router.put("/templates/:id", ctrl.updateTemplate);
router.delete("/templates/:id", ctrl.removeTemplate);

// QC Checks (Inspections)
router.get("/checks", ctrl.listChecks);
router.get("/checks/:id", ctrl.getCheck);
router.post("/checks", ctrl.createCheck);
router.put("/checks/:id", ctrl.updateCheck);

module.exports = router;
