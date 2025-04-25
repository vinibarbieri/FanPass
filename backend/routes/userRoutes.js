const express = require("express");
const router = express.Router();
const UserController = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

const userController = new UserController(); // Instanciando o controlador

router.post("/register", userController.register.bind(userController));
router.post("/login", userController.login.bind(userController));
router.get("/:id", authMiddleware, userController.getUser.bind(userController));

router.put(
  "/:id/wallet",
  authMiddleware,
  userController.linkWallet.bind(userController)
);

module.exports = router;
