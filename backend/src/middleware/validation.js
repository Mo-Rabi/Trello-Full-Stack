//! validate req.body
const validation = (schema) => {
  return (req, res, next) => {
    let { error } = schema.validate(req.body);

    if (error) {
      res.status(400).json({ message: "Err", error });
    } else {
      next(); //if all is good with validation, go execute the next function where validation function is called (inside user.routes.js)
    }
  };
};

//! validate req.params
// const validationParams = (schema) => {
//   return (req, res, next) => {
//     let { error } = schema.validate(req.params);

//     if (error) {
//       res.status(400).json({ message: "Err", error });
//     } else {
//       next(); //if all is good with validation, go execute the next function where validation function is called (inside user.routes.js)
//     }
//   };
// };

export { validation };
