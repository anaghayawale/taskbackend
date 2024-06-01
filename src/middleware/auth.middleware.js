import jwt from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";

const checkJWT = asyncHandler(async (req, res, next) => {
  const authHeader = req.header("Authorization");
  const accessToken = authHeader ? authHeader.replace("Bearer ", "") : null;
  
  if (!accessToken) {
    throw new ApiError(401, "Unauthorized");
  }
  console.log("accessToken:",accessToken);
  let { _id } = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
  console.log("id:",_id);
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