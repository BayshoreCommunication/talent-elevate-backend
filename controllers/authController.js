const bcrypt = require("bcryptjs");
const createJsonWebToken = require("../helper/jsonWebToken");
const { successResponse } = require("./responseController");
const { errorResponse } = require("./responseController");
const User = require("../models/userModel");
const sendEmailWithNodeMailer = require("../helper/email");
const { jwtSecretKey, clientUrl, stripeSecretKey } = require("../secret");
const jwt = require("jsonwebtoken");

// Admin Login
const userSigninAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, role: "admin" });
    if (!user) throw errorResponse(404, "Admin not found");
    if (!await bcrypt.compare(password, user.password)) throw errorResponse(401, "Invalid credentials");
    if (user.isBanned) throw errorResponse(403, "Admin is banned");
    if (!user.isActive) throw errorResponse(403, "Admin is not active");

    const { password: _, ...userData } = user.toObject();
    const accessToken = await createJsonWebToken({ userId: user._id, role: user.role }, jwtSecretKey, { expiresIn: "30d" });

    res.cookie("accessToken", accessToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: "strict" });
    return successResponse(res, { statusCode: 200, message: "Admin login successful", payload: { user: userData, accessToken } });
  } catch (error) {
    next(error);
  }
};

// User Credential Login
const userCredentialSignin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw errorResponse(404, "User not found");

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw errorResponse(401, "Invalid credentials");

    if (user.isBanned) throw errorResponse(403, "User is banned");
    if (!user.isActive) throw errorResponse(403, "User is not active");

    const { password: _, ...userData } = user.toObject();

    const accessToken = await createJsonWebToken(
      { user: userData },
      process.env.JWT_SECRET_KEY,  // 🔐 Ensure this is set in your .env file
      { expiresIn: "30d" }
    );

    res.cookie("accessToken", accessToken, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      sameSite: "strict",
    });

    return successResponse(res, {
      statusCode: 200,
      message: "User login successful",
      payload: {
        user: userData,
        accessToken,
      },
    });
  } catch (error) {
    next(error);
  }
};


// Social Login
const userSocialSignin = async (req, res, next) => {
  try {
    const { email, name, provider } = req.body;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, name, provider, isActive: true, role: "user" });
    }
    if (user.isBanned) throw errorResponse(403, "User is banned");
    if (!user.isActive) throw errorResponse(403, "User is not active");

    const { password: _, ...userData } = user.toObject();
    const accessToken = await createJsonWebToken({ userId: user._id, role: user.role }, jwtSecretKey, { expiresIn: "30d" });

    res.cookie("accessToken", accessToken, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: "strict" });
    return successResponse(res, { statusCode: 200, message: "Social login successful", payload: { user: userData, accessToken } });
  } catch (error) {
    next(error);
  }
};

// Logout
const userSignout = (req, res, next) => {
  try {
    res.clearCookie("accessToken", { httpOnly: true, sameSite: "strict" });
    return successResponse(res, { statusCode: 200, message: "Logout successful" });
  } catch (error) {
    next(error);
  }
};


// User SIgnin

const  userSignup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;


    const userExists = await User.exists({ email: email });

    if (userExists) {
      throw createError(
        409,
        "User with this email already exists, Please signin"
      );
    }

    const jwtToken = await createJsonWebToken(
      { name, email, password , isActive: true },
      jwtSecretKey,
      { expiresIn: "10m" }
    );


    const emailData = {
      email,
      subject: "Activate Your Account",
      html: `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Activate Your Account</title>
      <style>
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          background: #f7f7f7;
          margin: 0;
          padding: 0;
          color: #222;
        }
        .container {
          max-width: 420px;
          margin: 40px auto;
          background: #fff;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
          padding: 32px 24px 24px 24px;
        }
        .header {
          text-align: center;
          margin-bottom: 18px;
        }
        .header h1 {
          color: #FE641A;
          margin: 0 0 8px 0;
          font-size: 1.7em;
        }
        .content {
          text-align: center;
        }
        .cta-button {
          display: inline-block;
          margin: 24px 0 12px 0;
          padding: 12px 32px;
          background: #FE641A;
          color:rgb(252, 252, 252);
          text-decoration: none;
          border-radius: 5px;
          font-size: 1.1em;
          font-weight: 500;
          letter-spacing: 0.5px;
          transition: background 0.2s;
        }
        .cta-button:hover {
          background: #d95a1a;
        }
        .expire-note {
          color: #FE641A;
          font-size: 1em;
          margin-top: 8px;
          margin-bottom: 0;
        }
        .footer {
          text-align: center;
          font-size: 12px;
          color: #aaa;
          margin-top: 24px;
          border-top: 1px solid #eee;
          padding-top: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome, ${name}!</h1>
        </div>
        <div class="content">
          <p>Thank you for signing up. Please activate your account by clicking the button below:</p>
          <a href="${clientUrl}/activate/${jwtToken}" class="cta-button" target="_blank">Activate Your Account</a>
          <p class="expire-note">This link will expire in <b>10 minutes</b>.</p>
          <p style="color:#888; font-size:0.97em; margin-top:18px;">If you did not sign up, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          &copy; Your Company Name. All rights reserved.
        </div>
      </div>
    </body>
  </html>
`
    };
    
    

    try {
      await sendEmailWithNodeMailer(emailData);
    } catch (emailError) {
      next(createError(500, "Failed to send verification email"));
      return;
    }

    return successResponse(res, {
      statusCode: 200,
      message: `Please go to your ${email} for completing your registration process`,
      payload: { token: jwtToken },
    });
  } catch (error) {
    next(error);
  }
};

// Active user account

const activateUserAccount = async (req, res, next) => {
  try {
    const { token } = req.body;


    

    if (!token) {
      throw createError(404, "Token not found");
    }

    try {
      const decoded = jwt.verify(token, jwtSecretKey);

      if (!decoded) {
        throw createError(401, "User could not be verified");
      }

      console.log("dfsd", decoded);
      

      const userExists = await User.exists({ email: decoded.email });

      if (userExists) {
        throw createError(
          409,
          "User with this email already exists, Please signin"
        );
      }

      await User.create(decoded);

      return successResponse(res, {
        statusCode: 201,
        message: "User was registered successfully",
      });
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        throw createError(401, "Token has expired");
      } else if (error.name === "JsonWebTokenError") {
        throw createError(401, "Invalid token");
      } else {
        throw error;
      }
    }
  } catch (error) {
    next(error);
  }
};


module.exports = {
  userSigninAdmin,
  userCredentialSignin,
  userSocialSignin,
  userSignout,
  userSignup,
  activateUserAccount
};

