import express from "express"
import { changePassword, googleAuth, resetPassword, sendOtp, signIn, signOut, signUp, verifyOtp } from "../controllers/auth.controllers.js"
import isAuth from "../middlewares/isAuth.js"

const authRouter=express.Router()

authRouter.post("/signup",signUp)
authRouter.post("/signin",signIn)
authRouter.get("/signout",signOut)
authRouter.post("/send-otp",sendOtp)
authRouter.post("/verify-otp",verifyOtp)
authRouter.post("/reset-password",resetPassword)
authRouter.post("/google-auth",googleAuth)
authRouter.patch("/change-password",isAuth,changePassword)

export default authRouter