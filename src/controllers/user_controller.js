import jwt from 'jwt-simple';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/user_model';

dotenv.config({ silent: true });

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
    return tokenForUser(savedUser);
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
