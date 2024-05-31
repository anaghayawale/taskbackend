import { asyncHandler } from "../utils/asyncHandler.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import { ApiError } from "../utils/ApiError.js";
import {
  bodyDataExists,
  emailIsValid,
  passwordIsValid,
} from "../utils/validation/bodyData.js";
import { User } from "../models/user.model.js";
import { cookieOptions } from "../constants.js";

const generateAccessAndRefreshTokens = async (user = null, id = undefined) => {
  if (!user && !id) throw new ApiError(400, "Invalid data");
  if (!user) user = await User.findById(id);
  const token = user.generateAccessToken();
  const newRefreshToken = user.generateRefreshToken();
  user.refreshToken = newRefreshToken;
  await user.save({
    validateBeforeSave: false,
  });
  console.log("hii", token, newRefreshToken);
  return { token, newRefreshToken };
};

// ------------------------- Register User -------------------------
const registerUser = asyncHandler(async (req, res, next) => {
  const { name, email,password } = req.body;

  if (bodyDataExists(name, email, password)) {
    throw new ApiError(400, "Incomplete data");
  }

  if (!emailIsValid(email)) {
    throw new ApiError(400, "Invalid email");
  }

  if (!passwordIsValid(password)) {
    throw new ApiError(400, "Invalid password");
  }
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(400, "User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  res.status(201).json(new ApiResponse(201, "User created", user));
});

// ------------------------- Login User -------------------------
const loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (bodyDataExists(email, password)) {
    res
    .status(400)
    .json(
      new ApiResponse(
        400,
        "Incomplete data"
      )
    );
    //throw new ApiError(400, "Incomplete data");
  }

  if (!emailIsValid(email)) {
    res
    .status(400)
    .json(
      new ApiResponse(
        400,
        "Invalid credentials"
      )
    );
    //throw new ApiError(400, "Invalid credentials");
  }

  if (!passwordIsValid(password)) {
    res
    .status(400)
    .json(
      new ApiResponse(
        400,
        "Invalid credentials"
      )
    );
    // throw new ApiError(400, "Invalid credentials");
  }

  const existingUser = await User.findOne({ email });
  if (!existingUser) {
    res
    .status(400)
    .json(
      new ApiResponse(
        400,
        "User does not exist"
      )
    );
    //throw new ApiError(400, "User does not exist");
  }

  const isPasswordCorrect = await existingUser.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    res
    .status(400)
    .json(
      new ApiResponse(
        400,
        "Invalid credentials"
      )
    );
    //throw new ApiError(400, "Invalid credentials");
  }

  const token = existingUser.generateAccessToken();
  const refreshToken = existingUser.generateRefreshToken();

  existingUser.refreshToken = refreshToken;
  await existingUser.save();

  //this will not send password and refreshToken to the client
  //TODO: find alternative
  const userForResponse = await User.findOne({ email }).select(
    "-password -refreshToken"
  );

  res
    .status(200)
    .cookie("accessToken", token, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: userForResponse,
          token,
          refreshToken,
        },
        "Login successful"
      )
    );
});

//------------------------- Logout User -------------------------
const logoutUser = asyncHandler(async (req, res, next) => {
  const user = req.user;
  user.refreshToken = "";
  await user.save();

  res
    .status(200)
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json(new ApiResponse(200, "Logout successful"));
});

// ------------------------- Refresh Access Token --------------------------------
const refreshAccessToken = asyncHandler(async (req, res, next) => {
  const { token, newRefreshToken } = await generateAccessAndRefreshTokens(
    null,
    req.user._id
  );
  res
    .status(200)
    .cookie("accessToken", token, cookieOptions)
    .cookie("refreshToken", newRefreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          token,
          refreshToken: newRefreshToken,
        },
        "Token refreshed successfully"
      )
    );
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };