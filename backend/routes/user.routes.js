import express from "express"
import { getCurrentUser, updateUserLocation, updateProfile, addSavedAddress, removeSavedAddress, deleteAccount, toggleFavorite } from "../controllers/user.controllers.js"
import isAuth from "../middlewares/isAuth.js"
import { upload } from "../middlewares/multer.js"


const userRouter=express.Router()

userRouter.get("/current",isAuth,getCurrentUser)
userRouter.post('/update-location',isAuth,updateUserLocation)
userRouter.patch('/update-profile',isAuth,upload.single("profilePicture"),updateProfile)
userRouter.post('/add-address',isAuth,addSavedAddress)
userRouter.delete('/remove-address/:addressId',isAuth,removeSavedAddress)
userRouter.delete('/delete-account',isAuth,deleteAccount)
userRouter.patch('/toggle-favorite/:shopId',isAuth,toggleFavorite)

export default userRouter