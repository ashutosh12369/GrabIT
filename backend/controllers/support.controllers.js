import SupportChat from "../models/supportChat.model.js"

export const createChat = async (req, res) => {
    try {
        // Check if user already has an open chat
        const existing = await SupportChat.findOne({ user: req.userId, status: { $in: ["open", "assigned"] } })
        if (existing) {
            return res.status(200).json(existing)
        }
        const chat = await SupportChat.create({ user: req.userId })
        return res.status(201).json(chat)
    } catch (error) {
        return res.status(500).json({ message: `create chat error ${error}` })
    }
}

export const getMyChat = async (req, res) => {
    try {
        const chat = await SupportChat.findOne({
            user: req.userId,
            status: { $in: ["open", "assigned"] }
        })
            .populate("agent", "fullName")
            .populate("messages.sender", "fullName role")
        if (!chat) {
            return res.status(404).json({ message: "No active chat found" })
        }
        return res.status(200).json(chat)
    } catch (error) {
        return res.status(500).json({ message: `get my chat error ${error}` })
    }
}

export const getOpenChats = async (req, res) => {
    try {
        const chats = await SupportChat.find({ status: { $in: ["open", "assigned"] } })
            .populate("user", "fullName email mobile")
            .populate("agent", "fullName")
            .sort({ createdAt: -1 })
        return res.status(200).json(chats)
    } catch (error) {
        return res.status(500).json({ message: `get open chats error ${error}` })
    }
}

export const assignChat = async (req, res) => {
    try {
        const { chatId } = req.params
        const chat = await SupportChat.findByIdAndUpdate(
            chatId,
            { agent: req.userId, status: "assigned" },
            { new: true }
        ).populate("user", "fullName email mobile")
        if (!chat) return res.status(404).json({ message: "chat not found" })
        return res.status(200).json(chat)
    } catch (error) {
        return res.status(500).json({ message: `assign chat error ${error}` })
    }
}

export const closeChat = async (req, res) => {
    try {
        const { chatId } = req.params
        const chat = await SupportChat.findByIdAndUpdate(chatId, { status: "closed" }, { new: true })
        if (!chat) return res.status(404).json({ message: "chat not found" })
        return res.status(200).json({ message: "Chat closed successfully" })
    } catch (error) {
        return res.status(500).json({ message: `close chat error ${error}` })
    }
}

export const getAgentChats = async (req, res) => {
    try {
        const chats = await SupportChat.find({ agent: req.userId, status: "assigned" })
            .populate("user", "fullName email mobile")
            .populate("messages.sender", "fullName role")
            .sort({ updatedAt: -1 })
        return res.status(200).json(chats)
    } catch (error) {
        return res.status(500).json({ message: `get agent chats error ${error}` })
    }
}
