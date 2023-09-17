import jwt from "jsonwebtoken";

const authenticateTokenCookie = (req, res, next) => {
  //console.log(req);
  const token = req.cookies.token;

  if (token) {
    jwt.verify(token, "SecretKeyCanBeAnything", handleVerificationResult);
  } else {
    res.status(401).json({ message: "Please provide a cookie token" });
  }

  function handleVerificationResult(err, decoded) {
    //!if the token verification fails, the err parameter will contain an error object. If the token verification is successful, the decoded parameter will contain the decoded payload of the token.
    if (err) {
      // Token verification failed
      res.status(403).json({
        message: "Cookie token verification failed",
        err: err,
      });
    } else {
      //!If the token verification is successful, this line sets the decoded payload as the user property of the req object. This allows you to access the decoded user information in subsequent middleware or route handlers.
      req.user = decoded;
      //res.status(201).json({ message: "Successful Cookie Token Verification" });
      next();
    }
  }
};

export { authenticateTokenCookie };
