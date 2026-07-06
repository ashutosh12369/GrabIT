import React, { useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io"
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { FaStore } from "react-icons/fa"
import axios from 'axios'
import { serverUrl } from '../App'
import { setMyShopData } from '../redux/ownerSlice'
import { ClipLoader } from 'react-spinners'
import Nav from '../components/Nav'

function CreateEditShop() {
  const navigate = useNavigate()
  const { myShopData } = useSelector(state => state.owner)
  const { currentCity, currentState, currentAddress } = useSelector(state => state.user)
  const [name, setName] = useState(myShopData?.name || "")
  const [address, setAddress] = useState(myShopData?.address || currentAddress || "")
  const [city, setCity] = useState(myShopData?.city || currentCity || "")
  const [state, setState] = useState(myShopData?.state || currentState || "")
  const [frontendImage, setFrontendImage] = useState(myShopData?.image || null)
  const [backendImage, setBackendImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const dispatch = useDispatch()

  const handleImage = (e) => {
    const file = e.target.files[0]
    setBackendImage(file)
    setFrontendImage(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("city", city)
      formData.append("state", state)
      formData.append("address", address)
      if (backendImage) formData.append("image", backendImage)
      const result = await axios.post(`${serverUrl}/api/shop/create-edit`, formData, { withCredentials: true })
      dispatch(setMyShopData(result.data))
      setLoading(false)
      if (!myShopData) {
        setSuccess(true)
      } else {
        navigate("/")
      }
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className='min-h-screen flex flex-col items-center justify-center p-6' style={{ background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)' }}>
        <div className='grabit-card p-10 max-w-md w-full flex flex-col items-center gap-5 text-center scale-in'>
          <div className='w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center text-3xl'>⏳</div>
          <h2 className='text-2xl font-black text-gray-800'>Shop Submitted!</h2>
          <p className='text-gray-500'>Your shop <span className='font-bold text-green-700'>"{name}"</span> has been submitted for review. Our admin team will approve it shortly before it goes live.</p>
          <div className='badge-yellow text-sm px-4 py-2'>Pending Admin Approval</div>
          <button className='btn-primary px-8 py-3' onClick={() => navigate('/')}>Go to Dashboard</button>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen' style={{ backgroundColor: 'var(--bg)' }}>
      <Nav />
      <div className='flex justify-center items-start pt-[100px] p-6 min-h-screen'>
        <div className='max-w-lg w-full grabit-card p-8 fade-in'>

          {/* Header */}
          <div className='flex items-center gap-3 mb-6'>
            <button className='p-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition cursor-pointer' onClick={() => navigate("/")}>
              <IoIosArrowRoundBack size={22} />
            </button>
            <div className='w-10 h-10 bg-gradient-to-br from-green-600 to-green-400 rounded-xl flex items-center justify-center'>
              <FaStore size={18} className='text-white' />
            </div>
            <div>
              <h1 className='text-xl font-black text-gray-800'>{myShopData ? "Edit Shop" : "Create Your Shop"}</h1>
              <p className='text-xs text-gray-400'>{myShopData ? "Update shop details" : "New shops need admin approval before going live"}</p>
            </div>
          </div>

          {!myShopData && (
            <div className='bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-5 text-sm text-yellow-800'>
              📋 <strong>Note:</strong> After creating your shop, it will be reviewed by our admin team before it becomes visible to customers.
            </div>
          )}

          <form className='space-y-4' onSubmit={handleSubmit}>
            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-1'>Shop Name</label>
              <input className='grabit-input' type="text" placeholder='Enter shop name' onChange={e => setName(e.target.value)} value={name} required />
            </div>

            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-1'>Shop Image</label>
              <input type="file" accept='image/*' className='grabit-input text-sm cursor-pointer' onChange={handleImage} />
              {frontendImage && <img src={frontendImage} alt="" className='w-full h-44 object-cover rounded-xl mt-3 border border-green-100' />}
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-1'>City</label>
                <input className='grabit-input' type="text" placeholder='City' onChange={e => setCity(e.target.value)} value={city} />
              </div>
              <div>
                <label className='block text-sm font-semibold text-gray-700 mb-1'>State</label>
                <input className='grabit-input' type="text" placeholder='State' onChange={e => setState(e.target.value)} value={state} />
              </div>
            </div>

            <div>
              <label className='block text-sm font-semibold text-gray-700 mb-1'>Full Address</label>
              <input className='grabit-input' type="text" placeholder='Enter shop address' onChange={e => setAddress(e.target.value)} value={address} />
            </div>

            <button className='btn-primary w-full py-3 text-base mt-2' disabled={loading}>
              {loading ? <ClipLoader size={18} color='white' /> : (myShopData ? "Save Changes" : "Create Shop")}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CreateEditShop
