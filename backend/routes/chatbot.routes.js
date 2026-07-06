import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { chatWithBot } from "../controllers/chatbot.controllers.js"

const chatbotRouter = express.Router()

chatbotRouter.post("/message", isAuth, chatWithBot)

export default chatbotRouter
