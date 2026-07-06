import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { requireRole } from "../middlewares/requireRole.js"
import { createChat, getMyChat, getOpenChats, assignChat, closeChat, getAgentChats } from "../controllers/support.controllers.js"

const supportRouter = express.Router()

supportRouter.post("/create", isAuth, createChat)
supportRouter.get("/my-chat", isAuth, getMyChat)
supportRouter.get("/open-chats", isAuth, requireRole("supportAgent"), getOpenChats)
supportRouter.patch("/:chatId/assign", isAuth, requireRole("supportAgent"), assignChat)
supportRouter.patch("/:chatId/close", isAuth, requireRole("supportAgent"), closeChat)
supportRouter.get("/agent-chats", isAuth, requireRole("supportAgent"), getAgentChats)

export default supportRouter
