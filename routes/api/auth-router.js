const express = require("express");

const authController = require("../../controllers/auth-controller");
const { validateBody } = require("../../decorators");

const { isBodyEmpty, authenticate, upload } = require("../../middlewares");

const userSchemas = require("../../schemas/userSchemas");

const authRouter = express.Router();

authRouter.post(
  "/register",
  isBodyEmpty,
  validateBody(userSchemas.userCheckSchema),
  authController.register
);

authRouter.get("/verify/:verificationToken", authController.verify);

authRouter.post(
  "/verify",
  validateBody(userSchemas.userEmailSchema),
  authController.resendVerifyEmail
);

authRouter.post(
  "/login",
  isBodyEmpty,
  validateBody(userSchemas.userCheckSchema),
  authController.login
);

authRouter.get("/current", authenticate, authController.getCurrent);

authRouter.post("/logout", authenticate, authController.logout);

authRouter.patch(
  "/",
  authenticate,
  isBodyEmpty,
  validateBody(userSchemas.subscriptionUpdateSchema),
  authController.updateSubscription
);

authRouter.patch(
  "/avatars",
  upload.single("avatar"),
  authenticate,
  authController.updateAvatar
);

module.exports = authRouter;
