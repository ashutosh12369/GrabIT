import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'
import { useSelector } from 'react-redux'
import { IoSend } from 'react-icons/io5'
import { MdSupportAgent } from 'react-icons/md'
import { ClipLoader } from 'react-spinners'
import Nav from '../components/Nav'

function SupportChat() {
  const { userData, socket } = useSelector(state => state.user)
  const [chat, setChat] = useState(null)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [creating, setCreating] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    fetchMyChat()
  }, [])

  useEffect(() => {
    if (chat && socket) {
      socket.emit('support:join', { chatId: chat._id })
      socket.on('support:newMessage', ({ chatId, message }) => {
        if (chatId === chat._id) {
          setChat(prev => prev ? { ...prev, messages: [...prev.messages, message] } : prev)
        }
      })
      socket.on('support:agentJoined', ({ agentName }) => {
        setChat(prev => prev ? { ...prev, agentName } : prev)
      })
    }
    return () => {
      socket?.off('support:newMessage')
      socket?.off('support:agentJoined')
    }
  }, [chat?._id, socket])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chat?.messages])

  const fetchMyChat = async () => {
    try {
      const { data } = await axios.get(`${serverUrl}/api/support/my-chat`, { withCredentials: true })
      setChat(data)
    } catch {
      setChat(null)
    }
  }

  const startChat = async () => {
    setCreating(true)
    try {
      const { data } = await axios.post(`${serverUrl}/api/support/create`, {}, { withCredentials: true })
      setChat(data)
    } catch (e) {
      console.log(e)
    }
    setCreating(false)
  }

  const sendMessage = async () => {
    if (!input.trim() || !chat) return
    const text = input.trim()
    setInput("")
    if (socket) {
      socket.emit('support:sendMessage', {
        chatId: chat._id,
        text,
        senderId: userData._id,
        senderRole: userData.role
      })
    }
  }

  return (
    <div className='min-h-screen' style={{ backgroundColor: 'var(--bg)' }}>
      <Nav />
      <div className='pt-[88px] px-4 max-w-2xl mx-auto pb-10'>
        <div className='flex items-center gap-3 my-6 fade-in'>
          <div className='w-12 h-12 bg-gradient-to-br from-green-600 to-green-400 rounded-2xl flex items-center justify-center shadow-lg'>
            <MdSupportAgent size={24} className='text-white' />
          </div>
          <div>
            <h1 className='text-2xl font-black text-gray-800'>Customer Support</h1>
            <p className='text-sm text-gray-500'>We're here to help you 💬</p>
          </div>
        </div>

        {!chat ? (
          <div className='grabit-card p-10 flex flex-col items-center gap-5 text-center fade-in'>
            <div className='text-5xl'>🎧</div>
            <h2 className='text-xl font-bold text-gray-700'>Need Help?</h2>
            <p className='text-gray-500 max-w-sm'>Start a live chat with our support team. We typically respond within a few minutes.</p>
            <button className='btn-primary px-8 py-3' onClick={startChat} disabled={creating}>
              {creating ? <ClipLoader size={16} color='white' /> : "Start Support Chat"}
            </button>
          </div>
        ) : (
          <div className='grabit-card flex flex-col h-[520px] overflow-hidden fade-in'>
            {/* Chat header */}
            <div className='bg-gradient-to-r from-green-700 to-green-500 px-5 py-4 flex items-center gap-3'>
              <div className='w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center'>
                <MdSupportAgent size={20} className='text-white' />
              </div>
              <div>
                <div className='text-white font-bold text-sm'>
                  {chat.agent ? (chat.agentName || chat.agent?.fullName || 'Support Agent') : 'Waiting for agent...'}
                </div>
                <div className='text-green-200 text-xs capitalize'>{chat.status}</div>
              </div>
              <div className='ml-auto'>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${chat.status === 'open' ? 'bg-yellow-400/20 text-yellow-200' : chat.status === 'assigned' ? 'bg-green-300/20 text-green-100' : 'bg-red-300/20 text-red-200'}`}>
                  {chat.status}
                </span>
              </div>
            </div>

            {/* Messages */}
            <div className='flex-1 overflow-y-auto p-4 flex flex-col gap-3'>
              {chat.status === 'open' && chat.messages?.length === 0 && (
                <div className='text-center text-gray-400 text-sm mt-10'>
                  <div className='text-3xl mb-2'>⏳</div>
                  Waiting for a support agent to join...
                </div>
              )}
              {chat.messages?.map((msg, i) => (
                <div key={i} className={`flex ${msg.senderRole === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div>
                    <div className={`text-xs mb-1 ${msg.senderRole === 'user' ? 'text-right text-gray-400' : 'text-gray-400'}`}>
                      {msg.senderRole === 'user' ? 'You' : 'Support Agent'}
                    </div>
                    <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.senderRole === 'user'
                      ? 'bg-green-600 text-white rounded-br-sm'
                      : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            {chat.status !== 'closed' ? (
              <div className='px-4 py-3 border-t border-green-50 flex items-center gap-2'>
                <input
                  className='flex-1 grabit-input text-sm py-2'
                  placeholder='Type your message...'
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()}
                />
                <button
                  className='w-9 h-9 bg-green-600 hover:bg-green-700 text-white rounded-xl flex items-center justify-center transition cursor-pointer disabled:opacity-50'
                  onClick={sendMessage}
                  disabled={!input.trim()}
                >
                  <IoSend size={15} />
                </button>
              </div>
            ) : (
              <div className='px-4 py-3 text-center text-sm text-gray-400 border-t border-green-50'>
                This chat has been closed. <span className='text-green-600 cursor-pointer font-medium' onClick={() => setChat(null)}>Start new chat</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SupportChat
