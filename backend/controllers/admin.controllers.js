import User from "../models/user.model.js"
import Shop from "../models/shop.model.js"
import Order from "../models/order.model.js"

export const getAllUsers = async (req, res) => {
    try {
        const { role, banned } = req.query
        let filter = {}
        if (role) filter.role = role
        if (banned !== undefined) filter.isBanned = banned === "true"
        const users = await User.find(filter).select("-password -resetOtp").sort({ createdAt: -1 })
        return res.status(200).json(users)
    } catch (error) {
        return res.status(500).json({ message: `get all users error ${error}` })
    }
}

export const getAllShops = async (req, res) => {
    try {
        const { approved } = req.query
        let filter = {}
        if (approved !== undefined) filter.isApproved = approved === "true"
        const shops = await Shop.find(filter).populate("owner", "fullName email mobile").sort({ createdAt: -1 })
        return res.status(200).json(shops)
    } catch (error) {
        return res.status(500).json({ message: `get all shops error ${error}` })
    }
}

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("user", "fullName email mobile")
            .populate("shopOrders.shop", "name")
            .sort({ createdAt: -1 })
            .limit(100)
        return res.status(200).json(orders)
    } catch (error) {
        return res.status(500).json({ message: `get all orders error ${error}` })
    }
}

export const approveShop = async (req, res) => {
    try {
        const { shopId } = req.params
        const shop = await Shop.findByIdAndUpdate(shopId, { isApproved: true }, { new: true }).populate("owner", "fullName email")
        if (!shop) return res.status(404).json({ message: "shop not found" })
        return res.status(200).json({ message: "Shop approved successfully", shop })
    } catch (error) {
        return res.status(500).json({ message: `approve shop error ${error}` })
    }
}

export const rejectShop = async (req, res) => {
    try {
        const { shopId } = req.params
        const shop = await Shop.findByIdAndUpdate(shopId, { isApproved: false, isActive: false }, { new: true })
        if (!shop) return res.status(404).json({ message: "shop not found" })
        return res.status(200).json({ message: "Shop rejected", shop })
    } catch (error) {
        return res.status(500).json({ message: `reject shop error ${error}` })
    }
}

export const banUser = async (req, res) => {
    try {
        const { userId } = req.params
        const user = await User.findByIdAndUpdate(userId, { isBanned: true }, { new: true }).select("-password")
        if (!user) return res.status(404).json({ message: "user not found" })
        return res.status(200).json({ message: `${user.fullName} has been banned`, user })
    } catch (error) {
        return res.status(500).json({ message: `ban user error ${error}` })
    }
}

export const unbanUser = async (req, res) => {
    try {
        const { userId } = req.params
        const user = await User.findByIdAndUpdate(userId, { isBanned: false }, { new: true }).select("-password")
        if (!user) return res.status(404).json({ message: "user not found" })
        return res.status(200).json({ message: `${user.fullName} has been unbanned`, user })
    } catch (error) {
        return res.status(500).json({ message: `unban user error ${error}` })
    }
}

export const getPlatformStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: "user" })
        const totalOwners = await User.countDocuments({ role: "owner" })
        const totalDeliveryBoys = await User.countDocuments({ role: "deliveryBoy" })
        const totalShops = await Shop.countDocuments()
        const pendingShops = await Shop.countDocuments({ isApproved: false })
        const approvedShops = await Shop.countDocuments({ isApproved: true })
        const totalOrders = await Order.countDocuments()
        const revenueAgg = await Order.aggregate([
            { $match: { payment: true } },
            { $group: { _id: null, totalRevenue: { $sum: "$totalAmount" } } }
        ])
        const totalRevenue = revenueAgg[0]?.totalRevenue || 0

        // Revenue per day (last 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const revenueByDay = await Order.aggregate([
            { $match: { payment: true, createdAt: { $gte: sevenDaysAgo } } },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    revenue: { $sum: "$totalAmount" },
                    orders: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ])

        return res.status(200).json({
            totalUsers,
            totalOwners,
            totalDeliveryBoys,
            totalShops,
            pendingShops,
            approvedShops,
            totalOrders,
            totalRevenue,
            revenueByDay
        })
    } catch (error) {
        return res.status(500).json({ message: `platform stats error ${error}` })
    }
}
