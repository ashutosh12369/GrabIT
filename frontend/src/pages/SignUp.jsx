import React, { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
import { useNavigate } from 'react-router-dom'
import axios from "axios"
import { serverUrl } from '../App'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../../firebase'
import { ClipLoader } from "react-spinners"
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

const ROLES = [
  { value: "user", label: "Customer", icon: "🛍️", desc: "Order food" },
  { value: "owner", label: "Shop Owner", icon: "🏪", desc: "Manage your restaurant" },
  { value: "deliveryBoy", label: "Delivery Partner", icon: "🏍️", desc: "Deliver orders" },
  { value: "supportAgent", label: "Support Agent", icon: "🎧", desc: "Help customers" },
  { value: "admin", label: "Admin", icon: "🔐", desc: "Manage platform" },
]

function SignUp() {
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState("user")
  const navigate = useNavigate()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [mobile, setMobile] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()

  const handleSignUp = async () => {
    setLoading(true)
    try {
      const result = await axios.post(`${serverUrl}/api/auth/signup`, {
        fullName, email, password, mobile, role, referralCode
      }, { withCredentials: true })
      dispatch(setUserData(result.data))
      setErr("")
      setLoading(false)
    } catch (error) {
      setErr(error?.response?.data?.message)
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    if (!mobile) return setErr("Mobile number is required")
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      const { data } = await axios.post(`${serverUrl}/api/auth/google-auth`, {
        fullName: result.user.displayName,
        email: result.user.email,
        role,
        mobile,
        referralCode
      }, { withCredentials: true })
      dispatch(setUserData(data))
    } catch (error) {
      setErr(error?.response?.data?.message || "Google sign up failed")
    }
  }

  return (
    <div className='min-h-screen w-full flex items-center justify-center p-4' style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
      <div className='grabit-card w-full max-w-md p-8 fade-in bg-white rounded-2xl shadow-xl'>
        {/* Brand */}
        <div className='flex items-center gap-2 mb-2'>
          <div className='w-9 h-9 bg-gradient-to-br from-green-600 to-green-400 rounded-xl flex items-center justify-center shadow'>
            <span className='text-white font-black text-base'>G</span>
          </div>
          <h1 className='text-2xl font-black bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent'>GrabIT</h1>
        </div>
        <p className='text-gray-500 mb-6 text-sm'>Create your account to get started 🎉</p>

        {/* Full Name */}
        <div className='mb-4'>
          <label className='block text-gray-700 font-medium mb-1 text-sm'>Full Name</label>
          <input className='w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500' type="text" placeholder='Enter your full name' onChange={e => setFullName(e.target.value)} value={fullName} />
        </div>

        {/* Email */}
        <div className='mb-4'>
          <label className='block text-gray-700 font-medium mb-1 text-sm'>Email</label>
          <input className='w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500' type="email" placeholder='Enter your email' onChange={e => setEmail(e.target.value)} value={email} />
        </div>

        {/* Mobile */}
        <div className='mb-4'>
          <label className='block text-gray-700 font-medium mb-1 text-sm'>Mobile Number</label>
          <input className='w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500' type="text" placeholder='Enter your mobile number' onChange={e => setMobile(e.target.value)} value={mobile} />
        </div>
        
        {/* Referral Code */}
        <div className='mb-4'>
          <label className='block text-gray-700 font-medium mb-1 text-sm'>Referral Code (Optional)</label>
          <input className='w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 uppercase' type="text" placeholder='e.g. ASH123' onChange={e => setReferralCode(e.target.value)} value={referralCode} />
        </div>

        {/* Password */}
        <div className='mb-4'>
          <label className='block text-gray-700 font-medium mb-1 text-sm'>Password</label>
          <div className='relative'>
            <input
              className='w-full border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 pr-10'
              type={showPassword ? "text" : "password"}
              placeholder='Min 6 characters'
              onChange={e => setPassword(e.target.value)}
              value={password}
            />
            <button className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600' onClick={() => setShowPassword(p => !p)}>
              {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
            </button>
          </div>
        </div>

        {/* Role */}
        <div className='mb-5'>
          <label className='block text-gray-700 font-medium mb-2 text-sm'>Select Role</label>
          <div className='grid grid-cols-2 gap-2'>
            {ROLES.map(r => (
              <button
                key={r.value}
                onClick={() => setRole(r.value)}
                className={`flex flex-col items-start p-3 rounded-xl border-2 transition-all text-left cursor-pointer ${role === r.value
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-green-300'
                  }`}
              >
                <span className='text-lg'>{r.icon}</span>
                <span className={`text-sm font-semibold mt-1 ${role === r.value ? 'text-green-700' : 'text-gray-700'}`}>{r.label}</span>
                <span className='text-[11px] text-gray-400'>{r.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {err && <p className='text-red-500 text-sm text-center mb-3'>⚠️ {err}</p>}

        <button className='bg-green-600 hover:bg-green-700 text-white font-bold w-full py-3 rounded-xl text-base mb-3' onClick={handleSignUp} disabled={loading}>
          {loading ? <ClipLoader size={18} color='white' /> : "Create Account"}
        </button>

        <button
          className='w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer'
          onClick={handleGoogleAuth}
        >
          <FcGoogle size={20} />
          Sign up with Google
        </button>

        <p className='text-center mt-5 text-sm text-gray-500'>
          Already have an account?{" "}
          <span className='text-green-600 font-semibold cursor-pointer hover:underline' onClick={() => navigate("/signin")}>Sign In</span>
        </p>
      </div>
    </div>
  )
}

export default SignUp
