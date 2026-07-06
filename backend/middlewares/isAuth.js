import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

const isAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token
        if (!token) {
            return res.status(401).json({ message: "token not found" })
        }
        const decodeToken = jwt.verify(token, process.env.JWT_SECRET)
        if (!decodeToken) {
            return res.status(401).json({ message: "token not verified" })
        }
        const user = await User.findById(decodeToken.userId).select("role isBanned")
        if (!user) {
            return res.status(401).json({ message: "user not found" })
        }
        if (user.isBanned) {
            return res.status(403).json({ message: "Your account has been suspended. Please contact support." })
        }
        req.userId = decodeToken.userId
        req.userRole = user.role
        next()
    } catch (error) {
        return res.status(500).json({ message: "isAuth error" })
    }
}

export default isAuth