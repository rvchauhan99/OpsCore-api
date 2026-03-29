"use strict";
const { Router } = require("express");
const ctrl = require("./productionSchedule.controller.js");

const router = Router();
router.get("/", ctrl.list);
router.post("/", ctrl.create);
router.put("/:id", ctrl.update);
router.delete("/:id", ctrl.remove);
module.exports = router;
