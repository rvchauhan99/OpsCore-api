"use strict";
const { Router } = require("express");
const ctrl = require("./bom.controller.js");

const router = Router();

router.get("/", ctrl.list);
router.get("/:id", ctrl.getById);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);
router.post("/:id/clone", ctrl.cloneVersion);
router.post("/:id/compute-cost", ctrl.computeCost);

module.exports = router;
