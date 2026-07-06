import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { requireRole } from "../middlewares/requireRole.js"
import { getAllUsers, getAllShops, getAllOrders, approveShop, rejectShop, banUser, unbanUser, getPlatformStats } from "../controllers/admin.controllers.js"

const adminRouter = express.Router()

adminRouter.get("/stats", isAuth, requireRole("admin"), getPlatformStats)
adminRouter.get("/users", isAuth, requireRole("admin"), getAllUsers)
adminRouter.get("/shops", isAuth, requireRole("admin"), getAllShops)
adminRouter.get("/orders", isAuth, requireRole("admin"), getAllOrders)
adminRouter.patch("/shop/:shopId/approve", isAuth, requireRole("admin"), approveShop)
adminRouter.patch("/shop/:shopId/reject", isAuth, requireRole("admin"), rejectShop)
adminRouter.patch("/user/:userId/ban", isAuth, requireRole("admin"), banUser)
adminRouter.patch("/user/:userId/unban", isAuth, requireRole("admin"), unbanUser)

export default adminRouter
