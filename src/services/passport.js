import passport from 'passport';
import LocalStrategy from 'passport-local';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import dotenv from 'dotenv';

import User from '../models/user_model';

// loads in .env file if needed
dotenv.config({ silent: true });

// options for local strategy, we'll use email AS the username
// not have separate ones
const localOptions = { usernameField: 'email' };

// options for jwt strategy
// we'll pass in the jwt in an `authorization` header
// so passport can find it there
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: process.env.AUTH_SECRET,
};
// NOTE: we are not calling this a bearer token (although it technically is), if you see people use Bearer in front of token on the internet you could either ignore it, use it but then you have to parse it out here as well as prepend it on the frontend.

// username/email + password authentication strategy
const localLogin = new LocalStrategy(localOptions, async (email, password, done) => {
  // should find user by email and check password
  let user;
  let isMatch;

  try {
    user = await User.findOne({ email });
    if (!user) { // if cannot find user's email, return null
      return done(null, false);
    }
    isMatch = await user.comparePassword(password);
    if (!isMatch) { // if cannot match password with the user's email, return null
      return done(null, false);
    } else { // if password matches with the user's email, done with user
      return done(null, user);
    }
  } catch (error) { // if error above, return done with the error message
    return done(error);
  }
});

const jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
  // is called with confirmed jwt we just need to confirm that user exits
  let user;
  try {
    // try to find user by Id
    user = await User.findById(payload.sub);
  } catch (error) { // if unable to find user, return error
    done(error, false);
  }
  if (user) { // if user exists, return user
    done(null, user);
  } else { // if user does not exist, return false
    done(null, false);
  }
});

// Tell passport to use this strategy
passport.use(jwtLogin); // for 'jwt'
passport.use(localLogin); // for 'local'

// middleware functions to use in routes
export const requireAuth = passport.authenticate('jwt', { session: false });
export const requireSignin = passport.authenticate('local', { session: false });
