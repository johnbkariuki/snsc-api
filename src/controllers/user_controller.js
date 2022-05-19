/* eslint-disable prefer-destructuring */
import jwt from 'jwt-simple';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/user_model';

// loads in .env file if needed
dotenv.config({ silent: true });

const nodemailer = require('nodemailer');

const { google } = require('googleapis');

const otpGenerator = require('otp-generator');

const crypto = require('crypto');

// Key for cryptograpy
const key = process.env.OTP_SECRET_KEY;

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// login and signup functions
export const login = (user) => {
  return tokenForUser(user);
};

export const signup = async ({ name, email, password }) => {
  if (!email || !password) {
    throw new Error('You must provide email and password');
  }

  // See if a user with the given email exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email is in use');
  }

  const user = new User();
  user.name = name;
  user.email = email;
  user.password = password;
  user.dateOfBirth = '';
  user.location = '';
  user.disability = '';
  user.insurance = '';
  user.favoriteIds = [];

  try {
    const savedUser = await user.save();
    return { token: tokenForUser(savedUser), user: savedUser };
  } catch (error) {
    throw new Error(`signup error: ${error}`);
  }
};

export const adminSignup = async ({ name, email, password }) => {
  if (!email || !password) {
    throw new Error('You must provide email and password');
  }

  // See if a user with the given email exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Email is in use');
  }

  const user = new User();
  user.name = name;
  user.email = email;
  user.password = password;
  user.dateOfBirth = '';
  user.location = '';
  user.disability = '';
  user.insurance = '';
  user.favoriteIds = [];
  user.isAdmin = true;

  try {
    const savedUser = await user.save();
    return { token: tokenForUser(savedUser), user: savedUser };
  } catch (error) {
    throw new Error(`signup error: ${error}`);
  }
};

// other user functions
export const getAllUsers = async () => {
  try {
    const allusers = await User.find({});
    return allusers;
  } catch (error) {
    throw new Error(`get all users error: ${error}`);
  }
};

export const getUser = async (id) => {
  try {
    const user = await User.findById(id).exec();
    return user;
  } catch (error) {
    throw new Error(`Could not find user: ${error}`);
  }
};

// make sure it updates everything but the userId
export const updateUser = async (userId, userFields) => {
  try {
    let user = await User.findOne({ _id: userId });

    if (user.email !== userFields.email) {
      const newEmail = userFields.email;
      const existingUser = await User.findOne({ email: newEmail });

      if (existingUser) {
        throw new Error('Email is in use');
      }
    }
    user = await User.findOneAndUpdate({ _id: userId }, userFields, { new: true });
    return user;
  } catch (error) {
    throw new Error(`Could not update user: ${error}`);
  }
};

// encodes a new token for a user object
function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, process.env.AUTH_SECRET);
}

export const updatePassword = async (userId, passwords) => {
  try {
    let user = await User.findOne({ _id: userId });
    const isMatch = await user.comparePassword(passwords.old);
    if (!isMatch) { // old password does not match
      throw new Error('Passwords dont match');
    } else { // old password matches
      // salt, hash, then set password to hash
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(passwords.new, salt);
      user = await User.findOneAndUpdate({ _id: userId }, { password: hash }, { new: true });
      return user;
    }
  } catch (error) {
    throw new Error(`Could not update password: ${error}`);
  }
};

export const resetPassword = async (userId, newPassword) => {
  try {
    // salt, hash, then set password to hash
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);
    const user = await User.findOneAndUpdate({ _id: userId }, { password: hash }, { new: true });
    return user;
  } catch (error) {
    throw new Error(`Could not update password: ${error}`);
  }
};

const sendMail = async (otp, userEmail) => {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'snscapp@gmail.com',
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        // below is equivalent to accessToken = accessToken
        accessToken,
      },
    });

    const email = await transport.sendMail({
      from: 'SNSC App (No-Reply) <snscapp@gmail.com>',
      to: userEmail,
      subject: 'Password Reset',
      html: `
      <div
        class="container"
        style="max-width: 90%; margin: auto; padding-top: 20px"
      >
        <h2>Password Reset</h2>
        <p style="margin-bottom: 30px;">Please use the following code to reset your password</p>
        <h1 style="font-size: 40px; letter-spacing: 2px; text-align:center;">${otp}</h1>
   </div>
    `,
    });
    return email;
  } catch (error) {
    throw new Error(`Could not send OTP email: ${error}`);
  }
};

export const createNewOTP = async (userEmail) => {
  // See if a user with the given email exists
  const existingUser = await User.findOne({ email: userEmail });

  if (!existingUser) {
    throw new Error('Email address given is not associated with a registered account');
  }

  try {
  // Generate a 4 digit numeric OTP
    const otp = otpGenerator.generate(4, {
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    // 10 Minutes in miliseconds
    const ttl = 10 * 60 * 1000;

    // timestamp to 10 minutes in the future
    const expires = Date.now() + ttl;

    // phone.otp.expiry_timestamp
    const data = `${userEmail}.${otp}.${expires}`;

    // creating SHA256 hash of the data
    const hash = crypto.createHmac('sha256', key).update(data).digest('hex');

    // full has  = Hash + expires
    // format to send to the user
    const fullHash = `${hash}.${expires}`;

    await sendMail(otp, userEmail);

    return fullHash;
  } catch (error) {
    throw new Error(`Failed to Create OTP: ${error}`);
  }
};

export const verifyOTP = async (params) => {
  // Separate hash value and expires from the fullhash that was input
  const [hashValue, expires] = params.hash.split('.');

  // Check if expiry time has passed
  const now = Date.now();

  if (now > parseInt(expires, 10)) {
    throw new Error('Your OTP has expired');
  }

  // Calculate new hash with the same key and the same algorithm
  const data = `${params.userEmail}.${params.otp}.${expires}`;

  const newCalculatedHash = crypto
    .createHmac('sha256', key)
    .update(data)
    .digest('hex');

  // Match the hashes
  if (newCalculatedHash === hashValue) {
    const email = params.userEmail;
    const user = await User.findOne({ email });
    return tokenForUser(user);
  }
  throw new Error('Invalid OTP');
};
