import React from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import UserDashboard from '../components/UserDashboard'
import OwnerDashboard from '../components/OwnerDashboard'
import DeliveryBoy from '../components/DeliveryBoy'
import SupportAgentDashboard from '../components/SupportAgentDashboard'
import { MdAdminPanelSettings } from 'react-icons/md'

function Home() {
  const { userData } = useSelector(state => state.user)
  const navigate = useNavigate()

  if (userData?.role === "admin") {
    return (
      <div className='w-full min-h-screen pt-[100px] flex flex-col items-center justify-center' style={{ backgroundColor: 'var(--bg)' }}>
        <div className='grabit-card p-10 flex flex-col items-center gap-4 fade-in'>
          <div className='w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center'>
            <MdAdminPanelSettings size={32} className='text-white' />
          </div>
          <h2 className='text-2xl font-bold text-gray-800'>Welcome, Admin</h2>
          <p className='text-gray-500 text-center max-w-xs'>You have full control over the GrabIT platform. Head to the admin panel to manage everything.</p>
          <button className='btn-primary px-8 py-3' onClick={() => navigate('/admin')}>
            Go to Admin Panel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full min-h-screen pt-[88px] flex flex-col items-center' style={{ backgroundColor: 'var(--bg)' }}>
      {userData?.role === "user" && <UserDashboard />}
      {userData?.role === "owner" && <OwnerDashboard />}
      {userData?.role === "deliveryBoy" && <DeliveryBoy />}
      {userData?.role === "supportAgent" && <SupportAgentDashboard />}
    </div>
  )
}

export default Home
