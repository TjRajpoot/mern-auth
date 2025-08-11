import express from 'express';
import cookieParser from 'cookie-parser';
import { EMAIL_VERIFY } from '../config/emailVerify.js';
import { WELCOME_TEMPLATE } from '../config/emailTemplate.js';


//Create Login,Logout,Register,Verify
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/userModel.js';
import transporter from '../config/nodemailer.js';
const app = express();

// Middleware
app.use(express.json()); // Parse JSON body
app.use(cookieParser());


export const register = async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        return res.json({ success: false, message: "Missing Details!" })
    }
    try {
        const existingUser = await userModel.findOne({ email })
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: `User with email "${email}" already exists!`
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({ name, email, password: hashedPassword })
        await user.save();

        //Sending Welcome Email!
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: `Welcome To my Website!`,
            //text: `Hi ${name}, welcome to our website! Your account has been created successfully.  Your account has been created using email: ${email}`
            html:WELCOME_TEMPLATE.replace("{{name}}",user.name).replace("{{email}}",user.email).replace("{{Name}}",user.name)
        }


        await transporter.sendMail(mailOptions);
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.json({ success: true });

    } catch (e) {
        res.json({ success: false, message: e.message })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.json({ success: false, message: 'Email and Password are Required!' })
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'Invalid Email' })
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid Password' })
        }
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
        res.cookie('token', token, {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });


        return res.json({ success: true });

    } catch (e) {
        res.json({ success: false, message: e.message })
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
            secure: process.env.NODE_ENV === 'production',
        });

        return res.json({ success: true, message: "Logged Out!" })
    } catch (e) {
        res.json({ success: false, message: e.message })
    }
}

export const sendOtpVerify = async (req, res) => {
    try {
        const { userId } = req.body;
        const user = await userModel.findById(userId);
        if (user.isAccountVerified) {
            return res.json({ success: false, message: "Account Already Verified!" });
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 1 * 60 * 60 * 1000;

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: `Account Verification Otp`,
            //text: `Your otp is ${otp}. Please use this otp to verify your account.`,
            html: EMAIL_VERIFY.replace("{{otp}}", otp)
        }

        await transporter.sendMail(mailOptions);
        res.json({
            success: true,
            message: "OTP sent!"
        })

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const verifyEmail = async (req, res) => {
    const { userId, otp } = req.body;
    if (!userId || !otp) {
        return res.json({ success: false, message: "Missing Details!" })
    }
    try {
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found!" })
        }
        if (!user.verifyOtp || String(user.verifyOtp) !== String(otp)) {
            return res.json({ success: false, message: "Invalid OTP!" })
        }
        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: "OTP expired! Please try again." })
        }

        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();
        return res.json({ success: true, message: "Email Verified Succesfully!" })

    } catch (error) {
        return res.json({ success: false, message: "Missing Details!" })
    }
}

// Fixed isAuthenticated function in authController.js
export const isAuthenticated = async (req, res) => {
    try {
        const { userId } = req.body; // This comes from userAuth middleware

        if (!userId) {
            return res.json({ success: false, message: "Not authenticated" });
        }

        // Get user data to return
        const user = await userModel.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        return res.json({
            success: true,
            userData: {
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified,
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const sendResetOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.json({ success: false, message: "Email is Required!" })
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({
                success: false,
                message: "User not found!"
            })
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpiresAt = Date.now() + 15 * 60 * 1000;
        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: `Reset Password - OTP ${otp}`,
            //text: `Please use this otp to reset your account information.`,
           html: EMAIL_VERIFY.replace("{{otp}}", otp)
        }

        await transporter.sendMail(mailOptions);
        res.json({ success: true, message: "OTP sent successfully!" })



    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!otp || !email || !newPassword) {
        return res.json({ success: false, message: "Information Lacking! Check Again. " })
    }
    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User Not Found!" })
        }
        if (user.resetOtp === "" || user.resetOtp !== otp) {
            return res.json({ success: false, message: "Incorrect Credentials!" })
        }
        if (user.resetOtpExpiresAt < Date.now()) {
            return res.json({ success: false, message: "OTP Expired!" })
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = "";
        user.resetOtpExpiresAt = 0;

        await user.save();
        return res.json({ success: true, message: "Password Changed Succesfully!" })

    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}