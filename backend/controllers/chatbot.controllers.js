import { askGemini } from "../utils/gemini.js"

export const chatWithBot = async (req, res) => {
    try {
        const { message, history } = req.body
        if (!message) {
            return res.status(400).json({ message: "message is required" })
        }
        const reply = await askGemini(message, history || [])
        return res.status(200).json({ reply })
    } catch (error) {
        return res.status(500).json({ message: `chatbot error ${error}` })
    }
}
