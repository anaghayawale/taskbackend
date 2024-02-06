import { Router } from "express";
import { checkJWT } from "../middleware/auth.middleware.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
} from "../controllers/user.controller.js";

const router = Router();

// POST
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);

// PROTECTED ROUTES
router.route("/logout").post(checkJWT, logoutUser);
router.route("/refresh-accesstoken").post(checkJWT, refreshAccessToken);

export default router;