import React, { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'
import { useSelector } from 'react-redux'
import { IoSend } from 'react-icons/io5'
import { MdSupportAgent } from 'react-icons/md'
import { FiCheck } from 'react-icons/fi'
import { ClipLoader } from 'react-spinners'
import Nav from './Nav'

function SupportAgentDashboard() {
  const { userData, socket } = useSelector(state => state.user)
  const [chats, setChats] = useState([])
  const [activeChat, setActiveChat] = useState(null)
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    fetchChats()
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on('support:newMessage', ({ chatId, message }) => {
        setChats(prev => prev.map(c =>
          c._id === chatId ? { ...c, messages: [...(c.messages || []), message] } : c
        ))
        if (activeChat?._id === chatId) {
          setActiveChat(prev => prev ? { ...prev, messages: [...(prev.messages || []), message] } : prev)
        }
      })
    }
    return () => socket?.off('support:newMessage')
  }, [socket, activeChat?._id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeChat?.messages])

  const fetchChats = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get(`${serverUrl}/api/support/open-chats`, { withCredentials: true })
      setChats(data)
    } catch (e) { console.log(e) }
    setLoading(false)
  }

  const handlePickChat = async (chat) => {
    if (chat.status === 'open') {
      await axios.patch(`${serverUrl}/api/support/${chat._id}/assign`, {}, { withCredentials: true })
      socket?.emit('support:agentJoined', { chatId: chat._id, agentName: userData.fullName })
    }
    socket?.emit('support:join', { chatId: chat._id })
    const fresh = (await axios.get(`${serverUrl}/api/support/open-chats`, { withCredentials: true })).data
    setChats(fresh)
    setActiveChat(fresh.find(c => c._id === chat._id) || chat)
  }

  const sendMessage = () => {
    if (!input.trim() || !activeChat) return
    const text = input.trim()
    setInput("")
    socket?.emit('support:sendMessage', {
      chatId: activeChat._id,
      text,
      senderId: userData._id,
      senderRole: 'supportAgent'
    })
  }

  const closeChat = async (chatId) => {
    await axios.patch(`${serverUrl}/api/support/${chatId}/close`, {}, { withCredentials: true })
    setActiveChat(null)
    fetchChats()
  }

  return (
    <div className='w-full px-4 md:px-8 max-w-6xl mx-auto'>
      {/* Header */}
      <div className='flex items-center gap-3 mb-6 fade-in'>
        <div className='w-12 h-12 bg-gradient-to-br from-green-600 to-green-400 rounded-2xl flex items-center justify-center shadow-lg'>
          <MdSupportAgent size={24} className='text-white' />
        </div>
        <div>
          <h1 className='text-2xl font-black text-gray-800'>Support Dashboard</h1>
          <p className='text-sm text-gray-500'>Welcome, {userData?.fullName}</p>
        </div>
        <button className='ml-auto btn-outline text-sm py-2' onClick={fetchChats}>Refresh</button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        {/* Chat list */}
        <div className='md:col-span-1 flex flex-col gap-3'>
          <h2 className='font-bold text-gray-700 text-sm uppercase tracking-wide'>Open Tickets ({chats.length})</h2>
          {loading && <ClipLoader size={20} color='#16a34a' />}
          {chats.length === 0 && !loading && (
            <div className='grabit-card p-6 text-center text-gray-400 text-sm'>
              <div className='text-3xl mb-2'>✅</div>
              No open tickets!
            </div>
          )}
          {chats.map(chat => (
            <div
              key={chat._id}
              onClick={() => handlePickChat(chat)}
              className={`grabit-card p-4 cursor-pointer transition ${activeChat?._id === chat._id ? 'border-2 border-green-500 bg-green-50' : ''}`}
            >
              <div className='flex items-center justify-between mb-1'>
                <span className='font-semibold text-gray-800 text-sm'>{chat.user?.fullName}</span>
                <span className={chat.status === 'open' ? 'badge-yellow' : 'badge-green'}>{chat.status}</span>
              </div>
              <div className='text-xs text-gray-400'>{chat.user?.email}</div>
              {chat.messages?.length > 0 && (
                <div className='text-xs text-gray-500 mt-2 truncate'>
                  💬 {chat.messages[chat.messages.length - 1]?.text}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Active chat panel */}
        <div className='md:col-span-2'>
          {!activeChat ? (
            <div className='grabit-card p-10 flex flex-col items-center gap-3 text-center h-full justify-center'>
              <div className='text-4xl'>👈</div>
              <p className='text-gray-400'>Select a ticket to start chatting</p>
            </div>
          ) : (
            <div className='grabit-card flex flex-col h-[520px] overflow-hidden'>
              {/* Header */}
              <div className='bg-gradient-to-r from-green-700 to-green-500 px-5 py-4 flex items-center justify-between'>
                <div>
                  <div className='text-white font-bold'>{activeChat.user?.fullName}</div>
                  <div className='text-green-200 text-xs'>{activeChat.user?.email} · {activeChat.user?.mobile}</div>
                </div>
                <button
                  className='flex items-center gap-1.5 text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl font-semibold transition cursor-pointer'
                  onClick={() => closeChat(activeChat._id)}
                >
                  <FiCheck size={13} /> Close Chat
                </button>
              </div>

              {/* Messages */}
              <div className='flex-1 overflow-y-auto p-4 flex flex-col gap-3'>
                {activeChat.messages?.length === 0 && (
                  <div className='text-center text-gray-400 text-sm mt-10'>No messages yet. Say hello! 👋</div>
                )}
                {activeChat.messages?.map((msg, i) => (
                  <div key={i} className={`flex ${msg.senderRole === 'supportAgent' ? 'justify-end' : 'justify-start'}`}>
                    <div>
                      <div className={`text-xs mb-1 ${msg.senderRole === 'supportAgent' ? 'text-right text-gray-400' : 'text-gray-400'}`}>
                        {msg.senderRole === 'supportAgent' ? 'You' : activeChat.user?.fullName}
                      </div>
                      <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.senderRole === 'supportAgent'
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
              <div className='px-4 py-3 border-t border-green-50 flex items-center gap-2'>
                <input
                  className='flex-1 grabit-input text-sm py-2'
                  placeholder='Reply to customer...'
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
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SupportAgentDashboard
