import express from "express";
import {
  signUp,
  getAllUsers,
  signIn,
  userSignUpVerification,
  changePassword,
  updateUser,
  hardDelete,
  softDelete,
  logout,
  uploadAvatar,
  uploadPhoto,
  getPhoto,
  uploadPhotoWithoutMulter
} from "./user.controller.js";
import { signInSchem, signUpValidationSchema } from "./user.validation.js";
import { validation } from "../../middleware/validation.js";
import { authenticateTokenCookie } from "../../middleware/authenticateToken.js";
import { upload } from "./multerUploadImg.js";

const userRoutes = express.Router();

userRoutes.get("/users", getAllUsers);

userRoutes.post("/user/signUp", validation(signUpValidationSchema), signUp);

userRoutes.post(
  "/user/login",
  validation(signInSchem),
  signIn,
  authenticateTokenCookie
);

userRoutes.get("/logout", logout);

userRoutes.get("/user/verify/:token", userSignUpVerification);

//change password while user is loggedin
userRoutes.put("/changePassword", changePassword);

//updateUser fName, lName
userRoutes.put("/updateUser", updateUser);

//Delete User (Hard) when clicking Delete (Soft)
userRoutes.delete("/softDelete", softDelete);

//Delete User (Hard) when clicking Delete (Hard)
userRoutes.delete("/hardDelete", hardDelete);

// Upload a photo with Multer
userRoutes.post("/upload", upload.single("avatar"), uploadAvatar);

//!1.A upload photo direcly to MongoDB as Binary
userRoutes.post("/uploadBinary", upload.single("photoBinary"), uploadPhoto);

//! 1.B Get the image data back from DB
userRoutes.get("/getImage",getPhoto)

//! Wightout Multer✅
userRoutes.post("/photoBufferWithoutMulter", uploadPhotoWithoutMulter)


export default userRoutes;
