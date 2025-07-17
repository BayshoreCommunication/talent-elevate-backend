const express = require("express");
const authRouter = express.Router();

const {
  userCredentialLogin,
  userSocialLogin,
  userLoginAdmin,
  userLogout,
  activateUserAccount,
  userSignin,
  userSignup,
  userCredentialSignin,
  userSocialSignin,
  userSigninAdmin,
  userSignout
} = require("../controllers/authController");

// User login with credentials
authRouter.post("/user/signin", userCredentialSignin);

// User login with social provider
authRouter.post("/user/social-signin", userSocialSignin);

// Admin login
authRouter.post("/admin/signin", userSigninAdmin);

// Logout
authRouter.get("/user/signout", userSignout);

// User signup
authRouter.post("/user/signup", userSignup);

// Active user account
authRouter.post("/user/new-user-activate", activateUserAccount);

module.exports = { authRouter };
