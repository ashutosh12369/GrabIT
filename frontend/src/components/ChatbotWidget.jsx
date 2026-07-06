import React, { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'
import { IoChatbubbleEllipses, IoClose, IoSend } from 'react-icons/io5'
import { ClipLoader } from 'react-spinners'

const QUICK_FAQS = [
  "How do I track my order?",
  "What payment methods are available?",
  "How do I cancel an order?",
  "What is the refund policy?",
  "How do I contact a delivery partner?",
]

function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'model', text: "👋 Hi! I'm GrabIT's AI assistant. How can I help you today?" }
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages, isOpen])

  const sendMessage = async (text) => {
    const msgText = text || input.trim()
    if (!msgText) return

    const newMessages = [...messages, { role: 'user', text: msgText }]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    const history = newMessages.slice(1).map(m => ({ role: m.role, text: m.text }))

    try {
      const { data } = await axios.post(`${serverUrl}/api/chatbot/message`, {
        message: msgText,
        history: history.slice(0, -1)
      }, { withCredentials: true })
      setMessages(prev => [...prev, { role: 'model', text: data.reply }])
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I'm having trouble connecting right now. Please try again." }])
    }
    setLoading(false)
  }

  return (
    <div className='fixed bottom-6 right-6 z-[10000] flex flex-col items-end gap-3'>

      {/* Chat Panel */}
      {isOpen && (
        <div className='w-[340px] sm:w-[380px] h-[520px] bg-white rounded-3xl shadow-2xl border border-green-100 flex flex-col overflow-hidden chat-slide'>
          {/* Header */}
          <div className='bg-gradient-to-r from-green-700 to-green-500 px-5 py-4 flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center'>
                <span className='text-xl'>🤖</span>
              </div>
              <div>
                <div className='text-white font-bold text-sm'>GrabIT Assistant</div>
                <div className='text-green-200 text-xs flex items-center gap-1'>
                  <span className='w-1.5 h-1.5 bg-green-300 rounded-full animate-pulse inline-block'></span>
                  Powered by Gemini AI
                </div>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className='text-white/80 hover:text-white cursor-pointer'>
              <IoClose size={22} />
            </button>
          </div>

          {/* Messages */}
          <div className='flex-1 overflow-y-auto p-4 flex flex-col gap-3'>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                  ? 'bg-green-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                  }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className='flex justify-start'>
                <div className='bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-2'>
                  <ClipLoader size={14} color='#16a34a' />
                  <span className='text-xs text-gray-400'>Thinking...</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick FAQs */}
          {messages.length <= 1 && (
            <div className='px-4 pb-2 flex flex-wrap gap-1.5'>
              {QUICK_FAQS.map((faq, i) => (
                <button
                  key={i}
                  className='text-xs bg-green-50 text-green-700 border border-green-200 px-2.5 py-1 rounded-full hover:bg-green-100 transition cursor-pointer'
                  onClick={() => sendMessage(faq)}
                >
                  {faq}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className='px-4 py-3 border-t border-green-50 flex items-center gap-2'>
            <input
              className='flex-1 grabit-input text-sm py-2'
              placeholder='Ask me anything...'
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
            />
            <button
              className='w-9 h-9 bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center justify-center transition cursor-pointer disabled:opacity-50'
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
            >
              <IoSend size={15} />
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        className='w-14 h-14 bg-gradient-to-br from-green-700 to-green-500 rounded-2xl flex items-center justify-center shadow-xl cursor-pointer chatbot-bubble hover:scale-105 transition-transform'
        onClick={() => setIsOpen(prev => !prev)}
      >
        {isOpen
          ? <IoClose size={26} className='text-white' />
          : <IoChatbubbleEllipses size={26} className='text-white' />
        }
      </button>
    </div>
  )
}

export default ChatbotWidget
