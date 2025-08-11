import express from 'express';
import cookieParser from 'cookie-parser';
import { isAuthenticated, login, logout, register, resetPassword, sendOtpVerify, sendResetOtp, verifyEmail } from "../controllers/authController.js";
import userAuth from '../middleware/userAuth.js';
const app = express();
app.use(express.json()); // Parse JSON body
app.use(cookieParser());
const authRouter = express.Router();

authRouter.post('/register',register);
authRouter.post('/login',login);
authRouter.post('/logout',logout);
authRouter.post('/send-verify-otp',userAuth,sendOtpVerify);
authRouter.post('/verify-account',userAuth,verifyEmail);
authRouter.get('/is-auth',userAuth,isAuthenticated);
authRouter.post('/send-reset-otp',sendResetOtp);
authRouter.post('/reset-password',resetPassword);

export default authRouter
