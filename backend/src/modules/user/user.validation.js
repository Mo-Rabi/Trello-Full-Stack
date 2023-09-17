import Joi from "joi";

const signUpValidationSchema = Joi.object({
  firstName: Joi.string().min(3).max(10).required(),
  lastName: Joi.string().min(3).max(10).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(/^[A-Z][a-z]{3,8}$/)
    .required(),
  confirmPassword: Joi.any()
    .equal(Joi.ref("password"))
    .required()
    .label("Confirm password")
    .options({ messages: { "any.only": "{{#label}} does not match" } }),
  age: Joi.number().min(10).max(30),
  phone: Joi.string(),
});

const signInSchem = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: ["com", "net"] } }) //Top Level Domains accepted
    .required(),
  password: Joi.string()
    .pattern(/^[A-Z][a-z]{3,8}$/)
    .required(),
});

export { signUpValidationSchema, signInSchem };
