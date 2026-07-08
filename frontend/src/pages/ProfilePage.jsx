import React, { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { IoIosArrowRoundBack } from "react-icons/io"
import { FaCamera, FaUser, FaPhone, FaEnvelope, FaLock, FaMapMarkerAlt, FaTrash, FaPlus } from "react-icons/fa"
import { MdEdit } from "react-icons/md"
import axios from 'axios'
import { serverUrl } from '../App'
import { setUserData } from '../redux/userSlice'
import { ClipLoader } from 'react-spinners'
import Nav from '../components/Nav'

function ProfilePage() {
  const { userData } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const fileRef = useRef(null)

  // Profile edit state
  const [editMode, setEditMode] = useState(false)
  const [fullName, setFullName] = useState(userData?.fullName || "")
  const [mobile, setMobile] = useState(userData?.mobile || "")
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileMsg, setProfileMsg] = useState("")

  // Password change state
  const [showPassword, setShowPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passLoading, setPassLoading] = useState(false)
  const [passMsg, setPassMsg] = useState({ text: "", type: "" })

  // Address state
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [addrLabel, setAddrLabel] = useState("")
  const [addrAddress, setAddrAddress] = useState("")
  const [addrLoading, setAddrLoading] = useState(false)

  // Delete account state
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Profile picture upload
  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setProfileLoading(true)
    try {
      const formData = new FormData()
      formData.append("profilePicture", file)
      const res = await axios.patch(`${serverUrl}/api/user/update-profile`, formData, { withCredentials: true })
      dispatch(setUserData(res.data))
      setProfileMsg("Profile picture updated!")
      setTimeout(() => setProfileMsg(""), 3000)
    } catch (error) {
      setProfileMsg("Failed to upload image")
    }
    setProfileLoading(false)
  }

  // Save profile details
  const handleSaveProfile = async () => {
    setProfileLoading(true)
    try {
      const res = await axios.patch(`${serverUrl}/api/user/update-profile`, { fullName, mobile }, { withCredentials: true })
      dispatch(setUserData(res.data))
      setEditMode(false)
      setProfileMsg("Profile updated!")
      setTimeout(() => setProfileMsg(""), 3000)
    } catch (error) {
      setProfileMsg(error.response?.data?.message || "Update failed")
    }
    setProfileLoading(false)
  }

  // Change password
  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      return setPassMsg({ text: "Passwords do not match", type: "error" })
    }
    setPassLoading(true)
    try {
      const res = await axios.patch(`${serverUrl}/api/auth/change-password`, { currentPassword, newPassword }, { withCredentials: true })
      setPassMsg({ text: res.data.message, type: "success" })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setShowPassword(false)
      setTimeout(() => setPassMsg({ text: "", type: "" }), 3000)
    } catch (error) {
      setPassMsg({ text: error.response?.data?.message || "Failed to change password", type: "error" })
    }
    setPassLoading(false)
  }

  // Add address
  const handleAddAddress = async () => {
    if (!addrLabel || !addrAddress) return
    setAddrLoading(true)
    try {
      const res = await axios.post(`${serverUrl}/api/user/add-address`, { label: addrLabel, address: addrAddress }, { withCredentials: true })
      dispatch(setUserData(res.data))
      setAddrLabel("")
      setAddrAddress("")
      setShowAddAddress(false)
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add address")
    }
    setAddrLoading(false)
  }

  // Remove address
  const handleRemoveAddress = async (addressId) => {
    try {
      const res = await axios.delete(`${serverUrl}/api/user/remove-address/${addressId}`, { withCredentials: true })
      dispatch(setUserData(res.data))
    } catch (error) {
      alert("Failed to remove address")
    }
  }

  // Delete account
  const handleDeleteAccount = async () => {
    setDeleteLoading(true)
    try {
      await axios.delete(`${serverUrl}/api/user/delete-account`, { withCredentials: true })
      dispatch(setUserData(null))
      navigate("/signin")
    } catch (error) {
      alert("Failed to delete account")
    }
    setDeleteLoading(false)
  }

  const avatarLetter = userData?.fullName?.slice(0, 1)?.toUpperCase()

  return (
    <div className='min-h-screen' style={{ backgroundColor: 'var(--bg)' }}>
      <Nav />
      <div className='flex justify-center items-start pt-[100px] p-4 md:p-6'>
        <div className='max-w-2xl w-full space-y-6'>

          {/* Back button */}
          <button className='flex items-center gap-2 text-green-700 font-semibold hover:text-green-900 transition' onClick={() => navigate("/")}>
            <IoIosArrowRoundBack size={24} /> Back to Dashboard
          </button>

          {/* ===== PROFILE CARD ===== */}
          <div className='grabit-card p-6 md:p-8 fade-in'>
            <h2 className='text-xl font-black text-gray-800 mb-6 flex items-center gap-2'>
              <FaUser className='text-green-600' /> My Profile
            </h2>

            {/* Avatar Section */}
            <div className='flex flex-col items-center mb-6'>
              <div className='relative group'>
                {userData?.profilePicture ? (
                  <img src={userData.profilePicture} alt="Profile" className='w-24 h-24 rounded-full object-cover border-4 border-green-200' />
                ) : (
                  <div className='w-24 h-24 rounded-full bg-green-600 flex items-center justify-center text-white text-3xl font-bold border-4 border-green-200'>
                    {avatarLetter}
                  </div>
                )}
                <button
                  className='absolute bottom-0 right-0 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-green-700 transition'
                  onClick={() => fileRef.current?.click()}
                  disabled={profileLoading}
                >
                  {profileLoading ? <ClipLoader size={12} color="white" /> : <FaCamera size={12} />}
                </button>
                <input type="file" accept="image/*" ref={fileRef} className='hidden' onChange={handleProfilePicUpload} />
              </div>
              <h3 className='text-lg font-bold text-gray-800 mt-3'>{userData?.fullName}</h3>
              <span className='text-xs text-green-600 font-medium capitalize bg-green-50 px-3 py-1 rounded-full mt-1'>{userData?.role}</span>
            </div>

            {profileMsg && (
              <div className='text-center text-sm text-green-600 font-medium mb-4 bg-green-50 py-2 rounded-xl'>{profileMsg}</div>
            )}

            {/* Profile Details */}
            {!editMode ? (
              <div className='space-y-3'>
                <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-xl'>
                  <FaUser className='text-green-500' />
                  <div>
                    <div className='text-xs text-gray-400'>Full Name</div>
                    <div className='text-sm font-semibold text-gray-800'>{userData?.fullName}</div>
                  </div>
                </div>
                <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-xl'>
                  <FaEnvelope className='text-green-500' />
                  <div>
                    <div className='text-xs text-gray-400'>Email</div>
                    <div className='text-sm font-semibold text-gray-800'>{userData?.email}</div>
                  </div>
                </div>
                <div className='flex items-center gap-3 p-3 bg-gray-50 rounded-xl'>
                  <FaPhone className='text-green-500' />
                  <div>
                    <div className='text-xs text-gray-400'>Mobile</div>
                    <div className='text-sm font-semibold text-gray-800'>{userData?.mobile}</div>
                  </div>
                </div>
                <button className='btn-primary w-full py-3 flex items-center justify-center gap-2 mt-4' onClick={() => setEditMode(true)}>
                  <MdEdit size={16} /> Edit Profile
                </button>
              </div>
            ) : (
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-1'>Full Name</label>
                  <input className='grabit-input' type="text" value={fullName} onChange={e => setFullName(e.target.value)} />
                </div>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-1'>Mobile</label>
                  <input className='grabit-input' type="text" value={mobile} onChange={e => setMobile(e.target.value)} />
                </div>
                <div className='flex gap-3'>
                  <button className='btn-primary flex-1 py-3' onClick={handleSaveProfile} disabled={profileLoading}>
                    {profileLoading ? <ClipLoader size={16} color="white" /> : "Save Changes"}
                  </button>
                  <button className='flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition' onClick={() => { setEditMode(false); setFullName(userData?.fullName); setMobile(userData?.mobile) }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          {/* ===== WALLET & REFERRAL CARD ===== */}
          <div className='grabit-card p-6 md:p-8 fade-in'>
            <h2 className='text-xl font-black text-gray-800 mb-4 flex items-center gap-2'>
              💰 Wallet & Referrals
            </h2>
            <div className='flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200 mb-4'>
              <div className='flex-1'>
                <p className='text-sm text-gray-600 font-medium'>Wallet Balance</p>
                <p className='text-3xl font-black text-green-700'>₹{userData?.walletBalance || 0}</p>
              </div>
            </div>
            {userData?.referralCode && (
              <div className='bg-gray-50 p-4 rounded-xl border border-gray-200'>
                <p className='text-sm text-gray-600 font-medium mb-1'>Your Referral Code</p>
                <div className='flex items-center justify-between'>
                  <p className='text-lg font-bold text-gray-800 tracking-wider'>{userData.referralCode}</p>
                  <button className='text-sm text-green-600 font-bold hover:underline' onClick={() => navigator.clipboard.writeText(userData.referralCode)}>Copy</button>
                </div>
                <p className='text-xs text-gray-500 mt-2'>Share this code with friends. You both get ₹50 in your wallet when they sign up!</p>
              </div>
            )}
          </div>

          {/* ===== CHANGE PASSWORD CARD ===== */}
          {userData?.password && (
            <div className='grabit-card p-6 md:p-8 fade-in'>
              <div className='flex items-center justify-between mb-4'>
                <h2 className='text-xl font-black text-gray-800 flex items-center gap-2'>
                  <FaLock className='text-green-600' /> Security
                </h2>
                <button className='text-sm text-green-600 font-semibold cursor-pointer hover:text-green-800' onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? "Cancel" : "Change Password"}
                </button>
              </div>

              {showPassword && (
                <div className='space-y-4 slide-up'>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-1'>Current Password</label>
                    <input className='grabit-input' type="password" placeholder='Enter current password' value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                  </div>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-1'>New Password</label>
                    <input className='grabit-input' type="password" placeholder='Enter new password' value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  </div>
                  <div>
                    <label className='block text-sm font-semibold text-gray-700 mb-1'>Confirm New Password</label>
                    <input className='grabit-input' type="password" placeholder='Confirm new password' value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  </div>
                  {passMsg.text && (
                    <p className={`text-sm font-medium ${passMsg.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                      {passMsg.type === 'success' ? '✅' : '⚠️'} {passMsg.text}
                    </p>
                  )}
                  <button className='btn-primary w-full py-3' onClick={handleChangePassword} disabled={passLoading}>
                    {passLoading ? <ClipLoader size={16} color="white" /> : "Update Password"}
                  </button>
                </div>
              )}

              {!showPassword && (
                <p className='text-sm text-gray-400'>Your password was last updated when you created your account or reset it.</p>
              )}
            </div>
          )}

          {/* ===== SAVED ADDRESSES CARD ===== */}
          <div className='grabit-card p-6 md:p-8 fade-in'>
            <div className='flex items-center justify-between mb-4'>
              <h2 className='text-xl font-black text-gray-800 flex items-center gap-2'>
                <FaMapMarkerAlt className='text-green-600' /> Saved Addresses
              </h2>
              {(!userData?.savedAddresses || userData.savedAddresses.length < 5) && (
                <button className='flex items-center gap-1 text-sm text-green-600 font-semibold cursor-pointer hover:text-green-800' onClick={() => setShowAddAddress(!showAddAddress)}>
                  <FaPlus size={12} /> Add
                </button>
              )}
            </div>

            {/* Add Address Form */}
            {showAddAddress && (
              <div className='space-y-3 mb-5 p-4 bg-green-50 rounded-xl slide-up'>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-1'>Label</label>
                  <input className='grabit-input' type="text" placeholder='e.g., Home, Office, College' value={addrLabel} onChange={e => setAddrLabel(e.target.value)} />
                </div>
                <div>
                  <label className='block text-sm font-semibold text-gray-700 mb-1'>Full Address</label>
                  <input className='grabit-input' type="text" placeholder='Enter complete address' value={addrAddress} onChange={e => setAddrAddress(e.target.value)} />
                </div>
                <div className='flex gap-3'>
                  <button className='btn-primary flex-1 py-2.5' onClick={handleAddAddress} disabled={addrLoading}>
                    {addrLoading ? <ClipLoader size={14} color="white" /> : "Save Address"}
                  </button>
                  <button className='flex-1 py-2.5 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition' onClick={() => setShowAddAddress(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Address List */}
            {userData?.savedAddresses?.length > 0 ? (
              <div className='space-y-3'>
                {userData.savedAddresses.map((addr) => (
                  <div key={addr._id} className='flex items-center justify-between p-3 bg-gray-50 rounded-xl'>
                    <div className='flex items-center gap-3'>
                      <div className='w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center'>
                        <FaMapMarkerAlt className='text-green-600' size={14} />
                      </div>
                      <div>
                        <div className='text-sm font-bold text-gray-800'>{addr.label}</div>
                        <div className='text-xs text-gray-500 max-w-[200px] md:max-w-none truncate'>{addr.address}</div>
                      </div>
                    </div>
                    <button className='p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer' onClick={() => handleRemoveAddress(addr._id)}>
                      <FaTrash size={14} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className='text-sm text-gray-400 text-center py-4'>No saved addresses yet. Add your Home, Office, or College address!</p>
            )}
          </div>

          {/* ===== DELETE ACCOUNT CARD ===== */}
          <div className='grabit-card p-6 md:p-8 fade-in border-red-100'>
            <h2 className='text-xl font-black text-red-600 mb-2 flex items-center gap-2'>
              <FaTrash /> Danger Zone
            </h2>
            <p className='text-sm text-gray-500 mb-4'>Once you delete your account, there is no going back. All your data, orders, and addresses will be permanently removed.</p>
            <button className='w-full py-3 rounded-xl bg-red-50 text-red-600 font-bold border-2 border-red-200 hover:bg-red-100 transition cursor-pointer' onClick={() => setShowDeleteModal(true)}>
              Delete My Account
            </button>
          </div>

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4 backdrop-blur-sm'>
              <div className='grabit-card p-8 max-w-sm w-full space-y-4 scale-in'>
                <h3 className='text-xl font-black text-red-600'>⚠️ Are you sure?</h3>
                <p className='text-sm text-gray-600'>This will permanently delete your account, all your orders, saved addresses, and profile data. This action cannot be undone.</p>
                <div className='flex gap-3'>
                  <button className='flex-1 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 transition cursor-pointer' onClick={handleDeleteAccount} disabled={deleteLoading}>
                    {deleteLoading ? <ClipLoader size={16} color="white" /> : "Yes, Delete"}
                  </button>
                  <button className='flex-1 py-3 rounded-xl border-2 border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition cursor-pointer' onClick={() => setShowDeleteModal(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default ProfilePage
