import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { serverUrl } from '../App'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { MdAdminPanelSettings, MdPeople, MdStorefront, MdReceipt, MdBarChart } from 'react-icons/md'
import { FaBan, FaCheck, FaTimes } from 'react-icons/fa'
import { ClipLoader } from 'react-spinners'
import Nav from '../components/Nav'

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: <MdBarChart size={18} /> },
  { id: 'users', label: 'Users', icon: <MdPeople size={18} /> },
  { id: 'shops', label: 'Shops', icon: <MdStorefront size={18} /> },
  { id: 'orders', label: 'Orders', icon: <MdReceipt size={18} /> },
]

function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [stats, setStats] = useState(null)
  const [users, setUsers] = useState([])
  const [shops, setShops] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")

  const fetchStats = async () => {
    const { data } = await axios.get(`${serverUrl}/api/admin/stats`, { withCredentials: true })
    setStats(data)
  }

  const fetchUsers = async () => {
    const { data } = await axios.get(`${serverUrl}/api/admin/users`, { withCredentials: true })
    setUsers(data)
  }

  const fetchShops = async () => {
    const { data } = await axios.get(`${serverUrl}/api/admin/shops`, { withCredentials: true })
    setShops(data)
  }

  const fetchOrders = async () => {
    const { data } = await axios.get(`${serverUrl}/api/admin/orders`, { withCredentials: true })
    setOrders(data)
  }

  useEffect(() => {
    fetchStats()
    if (activeTab === 'users') fetchUsers()
    if (activeTab === 'shops') fetchShops()
    if (activeTab === 'orders') fetchOrders()
  }, [activeTab])

  const showMsg = (text) => { setMsg(text); setTimeout(() => setMsg(""), 3000) }

  const handleBan = async (userId, ban) => {
    const endpoint = ban ? 'ban' : 'unban'
    await axios.patch(`${serverUrl}/api/admin/user/${userId}/${endpoint}`, {}, { withCredentials: true })
    showMsg(ban ? "User banned" : "User unbanned")
    fetchUsers()
  }

  const handleApprove = async (shopId) => {
    await axios.patch(`${serverUrl}/api/admin/shop/${shopId}/approve`, {}, { withCredentials: true })
    showMsg("Shop approved ✅")
    fetchShops()
  }

  const handleReject = async (shopId) => {
    await axios.patch(`${serverUrl}/api/admin/shop/${shopId}/reject`, {}, { withCredentials: true })
    showMsg("Shop rejected ❌")
    fetchShops()
  }

  const roleColor = { user: 'badge-blue', owner: 'badge-green', deliveryBoy: 'badge-yellow', admin: 'badge-red', supportAgent: 'badge-green' }

  return (
    <div className='min-h-screen' style={{ backgroundColor: 'var(--bg)' }}>
      <Nav />
      <main className='section-container pt-[88px] pb-10'>

        {/* Header */}
        <div className='flex items-center gap-3 my-6 fade-in'>
          <div className='w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center'>
            <MdAdminPanelSettings size={24} className='text-white' />
          </div>
          <div>
            <h1 className='text-2xl font-black text-gray-800'>Admin Panel</h1>
            <p className='text-sm text-gray-500'>Manage your GrabIT platform</p>
          </div>
        </div>

        {msg && (
          <div className='fixed top-24 right-6 bg-green-600 text-white px-5 py-3 rounded-xl shadow-xl z-50 fade-in font-medium'>
            {msg}
          </div>
        )}

        {/* Tabs */}
        <div className='flex gap-2 mb-6 overflow-x-auto pb-1'>
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm whitespace-nowrap transition cursor-pointer ${activeTab === tab.id
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-green-100 hover:bg-green-50'
                }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── Dashboard Tab ── */}
        {activeTab === 'dashboard' && stats && (
          <div className='fade-in'>
            {/* Stat Cards */}
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-8'>
              {[
                { label: 'Total Users', value: stats.totalUsers, color: 'bg-blue-100 text-blue-600', icon: '👤' },
                { label: 'Total Shops', value: stats.totalShops, color: 'bg-green-100 text-green-600', icon: '🏪' },
                { label: 'Total Orders', value: stats.totalOrders, color: 'bg-purple-100 text-purple-600', icon: '📦' },
                { label: 'Total Revenue', value: `₹${stats.totalRevenue?.toLocaleString()}`, color: 'bg-emerald-100 text-emerald-600', icon: '💰' },
              ].map((s, i) => (
                <div key={i} className='stat-card slide-up' style={{ animationDelay: `${i * 0.1}s` }}>
                  <div className={`w-10 h-10 rounded-xl ${s.color} flex items-center justify-center text-xl mb-3`}>{s.icon}</div>
                  <div className='text-2xl font-black text-gray-800'>{s.value}</div>
                  <div className='text-sm text-gray-500 font-medium'>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Sub stats */}
            <div className='grid grid-cols-2 md:grid-cols-3 gap-4 mb-8'>
              <div className='grabit-card p-4'><div className='text-lg font-bold text-yellow-600'>{stats.pendingShops}</div><div className='text-sm text-gray-500'>Pending Approvals</div></div>
              <div className='grabit-card p-4'><div className='text-lg font-bold text-green-600'>{stats.approvedShops}</div><div className='text-sm text-gray-500'>Approved Shops</div></div>
              <div className='grabit-card p-4'><div className='text-lg font-bold text-blue-600'>{stats.totalDeliveryBoys}</div><div className='text-sm text-gray-500'>Delivery Partners</div></div>
            </div>

            {/* Revenue Chart */}
            {stats.revenueByDay?.length > 0 && (
              <div className='grabit-card p-6'>
                <h3 className='font-bold text-gray-700 mb-4'>Revenue — Last 7 Days</h3>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={stats.revenueByDay} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                    <XAxis dataKey="_id" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} />
                    <Bar dataKey="revenue" fill="#16a34a" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* ── Users Tab ── */}
        {activeTab === 'users' && (
          <div className='fade-in'>
            <div className='grabit-card overflow-hidden'>
              <table className='w-full text-sm'>
                <thead>
                  <tr className='bg-green-50 border-b border-green-100'>
                    <th className='text-left px-4 py-3 text-gray-600 font-semibold'>Name</th>
                    <th className='text-left px-4 py-3 text-gray-600 font-semibold hidden md:table-cell'>Email</th>
                    <th className='text-left px-4 py-3 text-gray-600 font-semibold'>Role</th>
                    <th className='text-left px-4 py-3 text-gray-600 font-semibold'>Status</th>
                    <th className='text-left px-4 py-3 text-gray-600 font-semibold'>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(user => (
                    <tr key={user._id} className='border-b border-gray-50 hover:bg-green-50/40 transition'>
                      <td className='px-4 py-3 font-medium text-gray-800'>{user.fullName}</td>
                      <td className='px-4 py-3 text-gray-500 hidden md:table-cell'>{user.email}</td>
                      <td className='px-4 py-3'>
                        <span className={roleColor[user.role] || 'badge-blue'}>{user.role}</span>
                      </td>
                      <td className='px-4 py-3'>
                        {user.isBanned
                          ? <span className='badge-red'>Banned</span>
                          : <span className='badge-green'>Active</span>
                        }
                      </td>
                      <td className='px-4 py-3'>
                        {user.role !== 'admin' && (
                          user.isBanned
                            ? <button className='text-xs font-semibold text-green-700 bg-green-100 px-3 py-1 rounded-lg hover:bg-green-200 transition cursor-pointer' onClick={() => handleBan(user._id, false)}>Unban</button>
                            : <button className='text-xs font-semibold text-red-700 bg-red-100 px-3 py-1 rounded-lg hover:bg-red-200 transition cursor-pointer' onClick={() => handleBan(user._id, true)}>Ban</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && <div className='text-center py-10 text-gray-400'>No users found</div>}
            </div>
          </div>
        )}

        {/* ── Shops Tab ── */}
        {activeTab === 'shops' && (
          <div className='fade-in grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {shops.map(shop => (
              <div key={shop._id} className='grabit-card p-4'>
                <img src={shop.image} alt={shop.name} className='w-full h-36 object-cover rounded-xl mb-3' />
                <h3 className='font-bold text-gray-800'>{shop.name}</h3>
                <p className='text-sm text-gray-500 mb-1'>{shop.address}, {shop.city}</p>
                <p className='text-sm text-gray-500 mb-3'>Owner: <span className='font-medium'>{shop.owner?.fullName}</span></p>
                <div className='flex items-center justify-between'>
                  <span className={shop.isApproved ? 'badge-green' : 'badge-yellow'}>
                    {shop.isApproved ? 'Approved' : 'Pending'}
                  </span>
                  <div className='flex gap-2'>
                    {!shop.isApproved && (
                      <button className='flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-3 py-1.5 rounded-lg hover:bg-green-200 transition cursor-pointer' onClick={() => handleApprove(shop._id)}>
                        <FaCheck size={11} /> Approve
                      </button>
                    )}
                    {shop.isApproved && (
                      <button className='flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 px-3 py-1.5 rounded-lg hover:bg-red-200 transition cursor-pointer' onClick={() => handleReject(shop._id)}>
                        <FaTimes size={11} /> Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {shops.length === 0 && <div className='text-center py-10 text-gray-400 col-span-3'>No shops found</div>}
          </div>
        )}

        {/* ── Orders Tab ── */}
        {activeTab === 'orders' && (
          <div className='fade-in grabit-card overflow-hidden'>
            <table className='w-full text-sm'>
              <thead>
                <tr className='bg-green-50 border-b border-green-100'>
                  <th className='text-left px-4 py-3 text-gray-600 font-semibold'>Customer</th>
                  <th className='text-left px-4 py-3 text-gray-600 font-semibold hidden md:table-cell'>Amount</th>
                  <th className='text-left px-4 py-3 text-gray-600 font-semibold'>Payment</th>
                  <th className='text-left px-4 py-3 text-gray-600 font-semibold hidden md:table-cell'>Date</th>
                  <th className='text-left px-4 py-3 text-gray-600 font-semibold'>Shops</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} className='border-b border-gray-50 hover:bg-green-50/40 transition'>
                    <td className='px-4 py-3 font-medium text-gray-800'>{order.user?.fullName || 'N/A'}</td>
                    <td className='px-4 py-3 text-green-700 font-semibold hidden md:table-cell'>₹{order.totalAmount}</td>
                    <td className='px-4 py-3'>
                      <span className={order.payment ? 'badge-green' : 'badge-yellow'}>{order.payment ? 'Paid' : 'Pending'}</span>
                    </td>
                    <td className='px-4 py-3 text-gray-400 hidden md:table-cell'>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className='px-4 py-3 text-gray-500 text-xs'>{order.shopOrders?.map(so => so.shop?.name).join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {orders.length === 0 && <div className='text-center py-10 text-gray-400'>No orders found</div>}
          </div>
        )}
      </main>
    </div>
  )
}

export default AdminPanel
