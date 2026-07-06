import React, { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from "react-icons/fa"
import { FcGoogle } from "react-icons/fc"
import { useNavigate } from 'react-router-dom'
import axios from "axios"
import { serverUrl } from '../App'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '../../firebase'
import { ClipLoader } from 'react-spinners'
import { useDispatch } from 'react-redux'
import { setUserData } from '../redux/userSlice'

function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [err, setErr] = useState("")
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()

  const handleSignIn = async () => {
    setLoading(true)
    try {
      const result = await axios.post(`${serverUrl}/api/auth/signin`, { email, password }, { withCredentials: true })
      dispatch(setUserData(result.data))
      setErr("")
      setLoading(false)
    } catch (error) {
      setErr(error?.response?.data?.message)
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    const provider = new GoogleAuthProvider()
    const result = await signInWithPopup(auth, provider)
    try {
      const { data } = await axios.post(`${serverUrl}/api/auth/google-auth`, {
        email: result.user.email,
      }, { withCredentials: true })
      dispatch(setUserData(data))
    } catch (error) {
      setErr(error?.response?.data?.message || "Google sign in failed")
    }
  }

  return (
    <div className='min-h-screen w-full flex items-center justify-center p-4' style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
      <div className='grabit-card w-full max-w-md p-8 fade-in'>
        {/* Brand */}
        <div className='flex items-center gap-2 mb-2'>
          <div className='w-9 h-9 bg-gradient-to-br from-green-600 to-green-400 rounded-xl flex items-center justify-center shadow'>
            <span className='text-white font-black text-base'>G</span>
          </div>
          <h1 className='text-2xl font-black bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent'>GrabIT</h1>
        </div>
        <p className='text-gray-500 mb-6 text-sm'>Welcome back! Sign in to continue 👋</p>

        {/* Email */}
        <div className='mb-4'>
          <label className='block text-gray-700 font-medium mb-1 text-sm'>Email</label>
          <input className='grabit-input' type="email" placeholder='Enter your email' onChange={e => setEmail(e.target.value)} value={email} />
        </div>

        {/* Password */}
        <div className='mb-2'>
          <label className='block text-gray-700 font-medium mb-1 text-sm'>Password</label>
          <div className='relative'>
            <input
              className='grabit-input pr-10'
              type={showPassword ? "text" : "password"}
              placeholder='Enter your password'
              onChange={e => setPassword(e.target.value)}
              value={password}
            />
            <button className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600' onClick={() => setShowPassword(p => !p)}>
              {showPassword ? <FaRegEyeSlash /> : <FaRegEye />}
            </button>
          </div>
        </div>

        <div className='text-right mb-5'>
          <span className='text-sm text-green-600 font-medium cursor-pointer hover:underline' onClick={() => navigate("/forgot-password")}>
            Forgot Password?
          </span>
        </div>

        {err && <p className='text-red-500 text-sm text-center mb-3'>⚠️ {err}</p>}

        <button className='btn-primary w-full py-3 text-base mb-3' onClick={handleSignIn} disabled={loading}>
          {loading ? <ClipLoader size={18} color='white' /> : "Sign In"}
        </button>

        <button
          className='w-full flex items-center justify-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer'
          onClick={handleGoogleAuth}
        >
          <FcGoogle size={20} />
          Sign in with Google
        </button>

        <p className='text-center mt-5 text-sm text-gray-500'>
          Don't have an account?{" "}
          <span className='text-green-600 font-semibold cursor-pointer hover:underline' onClick={() => navigate("/signup")}>Sign Up</span>
        </p>
      </div>
    </div>
  )
}

export default SignIn
