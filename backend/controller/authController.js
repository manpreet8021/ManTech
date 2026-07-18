import Joi from "joi";
import asyncHandler from "../middleware/asyncHandler.js";
import { sequelize } from "../config/sequelize.js";

const validateUserUpdateSchema = Joi.object({
  name: Joi.string().required(),
  dob: Joi.string().required(),
  gender: Joi.string().required(),
  interest: Joi.array().items(Joi.number().integer().positive().required()).min(5).required(),
  lookingFor: Joi.array().items(Joi.number().integer().positive().required()).min(1).required(),
  smoke: Joi.number().required()
})

const checkWork = asyncHandler(async (req, res) => {
  // const { error } = sendOtpValidationSchema.validate(req.body, {
  //   abortEarly: false,
  // });

  // if (error) {
  //   res.status(400);
  //   throw new Error(error.message);
  // }

  // const { phone, countryCode } = req.body;

  res.status(200).json({ message: "OTP sent successfully" });
});

export {
  checkWork
};
