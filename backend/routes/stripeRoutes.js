const express = require("express");
const StripeController = require("../controllers/stripeController");

const router = express.Router();
const stripeController = new StripeController();

router.post(
  "/create-session",
  stripeController.createSession.bind(stripeController)
);

module.exports = router;
