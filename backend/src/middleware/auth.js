import jwt from "jsonwebtoken";
const auth = (req, res, next) => {
  let { token } = req.cookies;
  !token && res.status(401).json({ message: "please provide a token" }); // if no token => !false (true) so goes to the right side
  if (token) {
    let decoded = jwt.verify(token, "SecretKeyCanBeAnything");
    if (decoded) {
      // means user is logged in
      next();
    } else {
      res.status(401).json({ message: "invalid token" });
    }
  }
};

export default auth;

//* This file is another way(shorter syntax)to implement authenticateToken.js (They are doing the same job and one of them can be deleted)
