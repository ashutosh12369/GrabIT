import User from "../models/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import Shop from "../models/shop.model.js"
import Order from "../models/order.model.js"

export const getCurrentUser=async (req,res) => {
    try {
        const userId=req.userId
        if(!userId){
            return res.status(400).json({message:"userId is not found"})
        }
        const user=await User.findById(userId)
        if(!user){
               return res.status(400).json({message:"user is not found"})
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:`get current user error ${error}`})
    }
}

export const updateUserLocation=async (req,res) => {
    try {
        const {lat,lon}=req.body
        const user=await User.findByIdAndUpdate(req.userId,{
            location:{
                type:'Point',
                coordinates:[lon,lat]
            }
        },{new:true})
         if(!user){
               return res.status(400).json({message:"user is not found"})
        }
        
        return res.status(200).json({message:'location updated'})
    } catch (error) {
           return res.status(500).json({message:`update location user error ${error}`})
    }
}

export const updateProfile=async (req,res) => {
    try {
        const {fullName, mobile}=req.body
        const updateData = {}
        if(fullName) updateData.fullName = fullName
        if(mobile) updateData.mobile = mobile

        // Handle profile picture upload
        if(req.file){
            try {
                const imageUrl = await uploadOnCloudinary(req.file.path)
                updateData.profilePicture = imageUrl
            } catch(err) {
                console.log("Profile pic upload failed:", err.message)
            }
        }

        const user = await User.findByIdAndUpdate(req.userId, updateData, {new: true})
        if(!user){
            return res.status(400).json({message:"user not found"})
        }
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:`update profile error ${error}`})
    }
}

export const addSavedAddress=async (req,res) => {
    try {
        const {label, address, city, state, coordinates}=req.body
        if(!label || !address){
            return res.status(400).json({message:"Label and address are required"})
        }
        const user = await User.findById(req.userId)
        if(!user) return res.status(400).json({message:"user not found"})

        if(user.savedAddresses.length >= 5){
            return res.status(400).json({message:"Maximum 5 addresses allowed"})
        }

        user.savedAddresses.push({label, address, city, state, coordinates: coordinates || [0,0]})
        await user.save()
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:`add address error ${error}`})
    }
}

export const removeSavedAddress=async (req,res) => {
    try {
        const {addressId}=req.params
        const user = await User.findById(req.userId)
        if(!user) return res.status(400).json({message:"user not found"})

        user.savedAddresses = user.savedAddresses.filter(a => a._id.toString() !== addressId)
        await user.save()
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:`remove address error ${error}`})
    }
}

export const deleteAccount=async (req,res) => {
    try {
        const user = await User.findById(req.userId)
        if(!user) return res.status(400).json({message:"user not found"})

        // Delete user's shop and items if they are an owner
        await Shop.findOneAndDelete({owner: req.userId})

        // Delete the user
        await User.findByIdAndDelete(req.userId)

        // Clear the auth cookie
        const isProd = !!process.env.FRONTEND_URL
        res.clearCookie("token", {
            secure: isProd,
            sameSite: isProd ? "none" : "strict",
            httpOnly: true
        })

        return res.status(200).json({message:"Account deleted successfully"})
    } catch (error) {
        return res.status(500).json({message:`delete account error ${error}`})
    }
}

export const toggleFavorite=async (req,res) => {
    try {
        const {shopId}=req.params
        const user = await User.findById(req.userId)
        if(!user) return res.status(400).json({message:"user not found"})

        const isFavorite = user.favorites.includes(shopId)
        if (isFavorite) {
            user.favorites = user.favorites.filter(id => id.toString() !== shopId)
        } else {
            user.favorites.push(shopId)
        }
        await user.save()
        return res.status(200).json(user)
    } catch (error) {
        return res.status(500).json({message:`toggle favorite error ${error}`})
    }
}
