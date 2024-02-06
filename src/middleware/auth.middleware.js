import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

const checkJWT = asyncHandler(async (req, res, next) => {
  const { accessToken } =
    req.cookies || req.header("Authorization")?.replace("Bearer ", "");
  const { refreshToken } = req.cookies || req.body?.refreshToken;

  if (!(accessToken || refreshToken)) {
    throw new ApiError(401, "Unauthorized");
  }

  const { _id } = accessToken
    ? jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
    : jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

  if (!_id) {
    throw new ApiError(401, "Unauthorized");
  }

  const existingUser = await User.findById(_id).select(
    "-password -refreshToken"
  );
  if (!existingUser) {
    throw new ApiError(401, "Unauthorized");
  }
  req.user = existingUser;
  next();
});

export { checkJWT };