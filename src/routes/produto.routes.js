const express = require("express");
const router = express.router();

const controller = require("../controllers/produto.controller");

router.get("/", controller.listar);
router.post("/", controller.criar);

module.exports = router;