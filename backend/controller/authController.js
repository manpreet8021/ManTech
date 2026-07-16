import Joi from "joi";
import asyncHandler from "../middleware/asyncHandler.js";
import { parsePhoneNumberFromString } from 'libphonenumber-js';
import { updateOtpActive, insertOtp } from "../model/otpLogModel.js";
import twilio from 'twilio'
import { checkOrCreateUser, getUserMainImage, updateUser } from "../model/userService.js";
import { generateToken } from "../config/jwtTojen.js";
import { sequelize } from "../config/sequelize.js";
import { insertInterest } from "../model/userService.js";
import { imageUpload, uploadMultipleImages } from "../config/imageUpload.js";
import { insertImages } from "../model/userService.js";
import { insertLocation } from "../model/userService.js";
import moment from 'moment';
import { insertLookingForData } from "../model/userService.js";

const validatePhoneNumber = (phone, countryCode) => {
  const phoneNumber = parsePhoneNumberFromString(phone, countryCode);
  return phoneNumber ? { number: phoneNumber.isValid() && phoneNumber.number, valid: phoneNumber.isValid() } : { number: null, valid: false };
};

const sendOtpValidationSchema = Joi.object({
  phone: Joi.string().required(),
  countryCode: Joi.string().required(),
})

const validateOtpSchema = Joi.object({
  phone: Joi.string().required(),
  otp: Joi.string().length(4).pattern(/^[0-9]+$/).required(),
})

const validateGoogleLoginSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().required(),
  token: Joi.string().required(),
})

const validateUserUpdateSchema = Joi.object({
  name: Joi.string().required(),
  dob: Joi.string().required(),
  gender: Joi.string().required(),
  interest: Joi.array().items(Joi.number().integer().positive().required()).min(5).required(),
  lookingFor: Joi.array().items(Joi.number().integer().positive().required()).min(1).required(),
  smoke: Joi.number().required()
})

const insertLocationSchema = Joi.object({
  latitude: Joi.number().precision(6).required(),
  longitude: Joi.number().precision(6).required()
})

const sendOtp = asyncHandler(async (req, res) => {
  const { error } = sendOtpValidationSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    res.status(400);
    throw new Error(error.message);
  }

  const { phone, countryCode } = req.body;
  const validate = validatePhoneNumber(phone, countryCode)
  if (!validate.valid) {
    res.status(400)
    throw new Error('Invalid phone number')
  }
  const updated = await updateOtpActive({ active: false }, { number: phone })

  const otp = Math.floor(1000 + Math.random() * 9000);
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_TOKEN);

  // const response = await client.messages.create({
  //   body: `Your OTP is ${otp}. Please donot share with anyone.`,
  //   to: validate.number,
  //   from: process.env.TWILIO_NUMBER,
  // })

  const inserted = await insertOtp({ number: phone, otp: otp, active: true, response: '3456' })

  res.status(200).json({ message: "OTP sent successfully" });
});

const validateOtp = asyncHandler(async (req, res) => {
  const { error } = validateOtpSchema.validate(req.body, {
    abortEarly: false,
  });

  if (error) {
    res.status(400);
    throw new Error(error.message);
  }

  const { phone, otp } = req.body;

  const [updatedCount] = await updateOtpActive({ active: false }, { number: phone, otp: otp })

  if (updatedCount === 0) {
    res.status(400);
    throw new Error("OTP verification failed, please try again.");
  }

  const data = {
    condition: {
      mobile: phone,
      active: 1
    },
    defaults: {
      mobile: phone,
      authtype: 'mobile'
    }
  }

  const user = await checkOrCreateUser(data)

  const response = {
    isNewData: user.isNewRecord,
    name: user.name,
    token: generateToken(user.id),
    updated: user.updated
  }

  res.status(200).json(response);
});

const updateUserDetail = asyncHandler(async (req, res) => {
  const { error } = validateUserUpdateSchema.validate(req.body, { abortEarly: false })

  if (error) {
    res.status(400);
    throw new Error(error.message)
  }
  let imagesInfo = {}
  let imageValue = []
  if (req.files) {
    if(req.files.image) {
      imagesInfo = await uploadMultipleImages(req.files.image, 'profile', req.user.id, 'secondary')
      imageValue.push(...imagesInfo)
    } else {
      res.status(400);
      throw new Error("Image not found")
    }
  }
  
  const transaction = await sequelize.transaction();
  const { name, dob, gender, interest, lookingFor, smoke } = req.body

  const dateOfBirth = moment(dob, "DD/MM/YYYY").format("YYYY-MM-DD")
  const interestData = interest.map((interest_id) => ({
    user_id: req.user.id,
    interest_id,
    active: true,
  }));
  
  const lookingForData = lookingFor.map((lookingFor) => ({
    user_id: req.user.id,
    gender: lookingFor
  }))

  try {
    await Promise.all([
      updateUser({ name, dob: dateOfBirth, gender, smoke, updated: true }, req.user.id, transaction),
      insertInterest(interestData, transaction),
      insertImages(imageValue, transaction),
      insertLookingForData(lookingForData, transaction)
    ]);
    await transaction.commit();
    res.status(200).json({ name: name })
  } catch (error) {
    await transaction.rollback();
    res.status(400)
    throw new Error(error.message)
  }
})

const googleLogin = asyncHandler(async (req, res) => {
  const { error } = validateGoogleLoginSchema.validate(req.body, { abortEarly: false })

  if (error) {
    res.status(400);
    throw new Error(error.message);
  }

  const { token, name, email } = req.body;

  const data = {
    condition: {
      email,
      active: 1
    },
    defaults: {
      token,
      email,
      name,
      authtype: 'google'
    }
  }

  const user = await checkOrCreateUser(data)

  const response = {
    updated: user.updated,
    isNewData: user.isNewRecord,
    name: user.name,
    token: generateToken(user.id)
  }
  res.status(200).json(response);
})

const insertUserLocation = asyncHandler(async (req, res) => {
  const { error } = insertLocationSchema.validate(req.body, { abortEarly: false })

  if (error) {
    res.status(400)
    throw new Error(error.message)
  }

  const user_id = req.user.id
  const { latitude, longitude } = req.body

  const location = await insertLocation({ latitude, longitude, user_id })
  res.status(201).json()
})

const getLoggedInUserDetail = asyncHandler(async(req, res) => {
  const mainImage = await getUserMainImage({user_id: req.user.id, image_type: 'main'})
  const response = {
    ...req.user.dataValues,
    image_url: mainImage.image_url
  }
  res.status(200).json(response)
})

export {
  sendOtp,
  validateOtp,
  googleLogin,
  updateUserDetail,
  insertUserLocation,
  getLoggedInUserDetail
};
