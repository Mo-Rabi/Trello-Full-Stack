import userModel from "../../db/model/user.model.js";
import bcrypt from "bcrypt";
import { signInSchem, signUpValidationSchema } from "./user.validation.js";
import jwt from "jsonwebtoken";
import { sendToEmail } from "../../utils/sendEmail.js";
import fs from "fs";
import multer from "multer"; //to be able to access req.file object

//!Upload Photo Without Multer*********************************************************************
const uploadPhotoWithoutMulter = async (req, res) => {
  const { token } = req.cookies;
  const decodedToken = jwt.verify(token, "SecretKeyCanBeAnything");
  const userId = decodedToken.id;
  console.log(`RAW ${req.body}`);
  try {
    const imgBufferBase64 = req.body.image;
    const imgBuffer = Buffer.from(imgBufferBase64, 'base64');

    let updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { avatar: imgBuffer },
      { new: true }
    );
    res.json({
      message: "File uploaded and saved to the database successfully!",
      updatedUser,
    });
  } catch (error) {
    res.json({ message: "Error emerged :(", error });
  }
};

//!Avatar Upload () to local uploads folder
const uploadAvatar = async (req, res) => {
  const { token } = req.cookies;
  const decodedToken = jwt.verify(token, "SecretKeyCanBeAnything");
  const userId = decodedToken.id;

  // Assuming you have a 'photo' field in your User model to store the photo URL or file path
  const photoUrl = req.file.path; // Replace with the appropriate field to store the photo URL or file path

  // Update the user's document in the database with the photo URL or file path
  await userModel
    .findByIdAndUpdate(userId, { photo: photoUrl }, { new: true })
    .then((updatedUser) => {
      res.json({
        message: "File uploaded and saved to the database successfully!",
        user: updatedUser,
      });
    })
    .catch((error) => {
      res.status(500).json({
        error: "An error occurred while saving the file to the database.",
        error,
      });
    });
};

//! 1.A Directly upload photos to MongoB as Binary (Buffer)
const uploadPhoto = async (req, res) => {
  const { token } = req.cookies;
  const decodedToken = jwt.verify(token, "SecretKeyCanBeAnything");
  const userId = decodedToken.id;

  /// Access the uploaded file from the request
  const photoBuffer = req.file.buffer;
  console.log(typeof photoBuffer); // Assuming you're using Express and multer for file handling
  //console.log(`Photo Buffer is: ${photoBuffer}`); //Weird Characters

  try {
    // Update the user's document with the binary photo data
    const user = await userModel.findByIdAndUpdate(userId, {
      avatar: photoBuffer,
    });

    res.send("Photo was added as binary");
  } catch (error) {
    // Handle any errors, such as database errors or file upload issues
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//! 1.B Get back photo data from MongoDB
const getPhoto = async (req, res) => {
  const { token } = req.cookies;
  const decodedToken = jwt.verify(token, "SecretKeyCanBeAnything");
  const userId = decodedToken.id;

  let user = await userModel.findById(userId);
  let photo = user.avatar;
  console.log(`photo is: ${photo}`);
  //let photo = await userModel.findById(userId).select("avatar");

// Set the appropriate content type based on your image format
res.setHeader('Content-Type', 'image/png'); // Adjust this based on your image format

// Send the image data as the response body
res.send(photo);
};

//! Retrieve all users
const getAllUsers = async (req, res) => {
  let viewUsers = await userModel.find();
  res.json({ message: "Here's a list of all users", viewUsers });
};

//! Sign up(email must be unique )
const signUp = async (req, res) => {
  try {
    let { error } = signUpValidationSchema.validate(req.body, {
      abortEarly: false,
    }); //abortEarly false let's the validate method continue to validate all fields even after facing a validation error. normally it stops at the first error.
    if (error) {
      res.status(400).json({ message: "Validation error", error });
    } else {
      let { email } = req.body;
      let foundUser = await userModel.findOne({ email: email }); // findOne returns either a single document (if a match is found) or null (if no match is found). find() returns a query object so always truthy
      foundUser && res.status(409).json({ message: "Email already exists" }); //? if foundUser is truthy it will go to right side of && operator.
      //!This is called short-circuit ecaluation
      //*If foundUser is truthy (i.e., it exists), then the second operand is executed. If foundUser is falsy (i.e., it doesn't exist), then the second operand is not executed, and the && operation returns foundUser
      // or use if (foundUser) {
      //   res.status(409).json({ message: "Email already exists" });
      if (!foundUser) {
        let hashedPassword = bcrypt.hashSync(req.body.password, 10); //hash takes a callback as its third parameter which will be called when the hash is completed. bcrypt. hashSync runs the hash, waits for it to complete and returns the hashed value. In other words "hash" is asynchronous and hashSync is synschronous.
        let addedUser = await userModel.create({
          ...req.body,
          password: hashedPassword,
        });
        const token = jwt.sign({ id: addedUser._id }, "secret_key", {
          expiresIn: "1d",
        });
        sendToEmail(req.body.email, token);
        res.status(201).json({
          message: "SignUp successful, please check your email",
          addedUser,
          token,
        });
      }
    }
  } catch (error) {
    res.status(400).json({ message: "error", error });
  }
};

//! user signUp verification
const userSignUpVerification = async (req, res) => {
  // Verify the token
  const payload = jwt.verify(req.params.token, "secret_key");

  // Mark user as verified
  const user = await userModel.findByIdAndUpdate(
    payload.id,
    {
      isVerified: true,
    },
    { new: true }
  );
  //console.log(user);

  // Redirect user to login page or send a response
  res.redirect("/login");
};

//! Sign in
const signIn = async (req, res) => {
  let { error } = signInSchem.validate(req.body);
  if (error) {
    res.status(400).json({ message: "Error", error });
  } else {
    let foundUser = await userModel.findOne({ email: req.body.email });
    if (!foundUser) {
      res
        .status(404)
        .json({ message: "User not found, You need to create an account" });
    } else if (foundUser.isVerified === false) {
      res
        .status(404)
        .json({ message: "Please check your email to verify your account" });
    } else if (foundUser.isVerified === true) {
      //console.log(foundUser.password, req.body.password);
      //console.log(foundUser.password, req.body.password) //comparing hashed password in the DB with unhashed password we're getting from the user

      let matched = bcrypt.compareSync(req.body.password, foundUser.password);

      if (matched) {
        let token = jwt.sign({ id: foundUser.id }, "SecretKeyCanBeAnything", {
          expiresIn: "5h", // when expired you cannot access /profile
        });

        res.cookie(
          "token",
          token, //?res.cookie(name, value [, options])
          { httpOnly: true }
        );

        res.status(200).redirect("/profile");
        //res.status(200).json({ message: "You're logged in :)", token });
      } else {
        res.status(404).json({ message: "Please check your password" });
      }
    }
  }
};

//! Logout
const logout = (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Token Cookie removed successfully" });
};

//! Update Password (While user is loggedIn)
const changePassword = async (req, res) => {
  try {
    const { token } = req.cookies;
    const { newPassword } = req.body;
    const decodedToken = jwt.verify(token, "SecretKeyCanBeAnything");
    const userId = decodedToken.id;
    // Replace 'your-secret-key' with your actual secret key
    let hashedPassword = bcrypt.hashSync(newPassword, 10);
    console.log(`
    Hashed Password: ${hashedPassword}
    Token: ${token}
    Decoded Token:${decodedToken}
    User ID from Decoded Token: ${userId}`);
    let saveNewPassword = await userModel.findByIdAndUpdate(userId, {
      password: hashedPassword,
    });
    res
      .status(200)
      .json({ message: "Password updatd successfully", saveNewPassword });
  } catch (error) {
    res.status(400).json({ message: "error", error });
  }
};

//! update fName, lName (User must be logged in)
const updateUser = async (req, res) => {
  try {
    const { newFName, newLName } = req.body;

    const { token } = req.cookies;
    const decodedToken = jwt.verify(token, "SecretKeyCanBeAnything");
    const userId = decodedToken.id;
    let updateUserDetais = await userModel.findByIdAndUpdate(userId, {
      firstName: newFName,
      lastName: newLName,
    });
    res.status(200).json({
      message: "User Details were updatd successfully",
      updateUserDetais,
    });
  } catch (error) {
    res.status(400).json({ message: "error", error });
  }
};

//! Soft Delete
const softDelete = async (req, res) => {
  try {
    const { token } = req.cookies;
    const decodedToken = jwt.verify(token, "SecretKeyCanBeAnything");
    const userId = decodedToken.id;
    let softDeletedUser = await userModel.findByIdAndUpdate(
      userId,
      { isDeleted: true },
      { new: true }
    );

    // Clear the token cookie (to logout from current page)
    res.clearCookie("token");
    res.status(200).json({
      message: "User account is permanently deleted",
      softDeletedUser,
    });
  } catch (error) {
    res.status(400).json({ message: "error", error });
  }
};

//! Hard Delete
const hardDelete = async (req, res) => {
  try {
    const { token } = req.cookies;
    const decodedToken = jwt.verify(token, "SecretKeyCanBeAnything");
    const userId = decodedToken.id;
    let hardDeletedUser = await userModel.findByIdAndDelete(userId);

    // Clear the token cookie (to logout from current page)
    res.clearCookie("token");
    res.status(200).json({
      message: "User account is permanently deleted",
      hardDeletedUser,
    });
  } catch (error) {
    res.status(400).json({ message: "error", error });
  }
};

export {
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
  uploadPhotoWithoutMulter,
};
