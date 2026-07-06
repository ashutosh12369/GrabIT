import axios from 'axios'
import React, { useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io"
import { useNavigate } from 'react-router-dom'
import { serverUrl } from '../App'
import { ClipLoader } from 'react-spinners'

const steps = [
  { label: 'Enter Email', num: 1 },
  { label: 'Verify OTP', num: 2 },
  { label: 'New Password', num: 3 },
]

function ForgotPassword() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [err, setErr] = useState("")
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleSendOtp = async () => {
    setLoading(true)
    try {
      await axios.post(`${serverUrl}/api/auth/send-otp`, { email }, { withCredentials: true })
      setErr("")
      setStep(2)
    } catch (error) {
      setErr(error.response?.data?.message || "Failed to send OTP")
    }
    setLoading(false)
  }

  const handleVerifyOtp = async () => {
    setLoading(true)
    try {
      await axios.post(`${serverUrl}/api/auth/verify-otp`, { email, otp }, { withCredentials: true })
      setErr("")
      setStep(3)
    } catch (error) {
      setErr(error?.response?.data?.message || "Invalid OTP")
    }
    setLoading(false)
  }

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) return setErr("Passwords do not match")
    setLoading(true)
    try {
      await axios.post(`${serverUrl}/api/auth/reset-password`, { email, newPassword }, { withCredentials: true })
      setErr("")
      navigate("/signin")
    } catch (error) {
      setErr(error?.response?.data?.message || "Reset failed")
    }
    setLoading(false)
  }

  return (
    <div className='flex w-full items-center justify-center min-h-screen p-4' style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' }}>
      <div className='grabit-card w-full max-w-md p-8 fade-in'>

        {/* Back + Brand */}
        <div className='flex items-center gap-3 mb-6'>
          <button className='p-2 rounded-xl bg-green-50 text-green-700 hover:bg-green-100 transition cursor-pointer' onClick={() => navigate("/signin")}>
            <IoIosArrowRoundBack size={22} />
          </button>
          <div className='flex items-center gap-2'>
            <div className='w-8 h-8 bg-gradient-to-br from-green-600 to-green-400 rounded-lg flex items-center justify-center'>
              <span className='text-white font-black text-sm'>G</span>
            </div>
            <span className='font-black text-lg bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent'>GrabIT</span>
          </div>
        </div>

        <h2 className='text-2xl font-bold text-gray-800 mb-1'>Reset Password</h2>
        <p className='text-gray-500 text-sm mb-6'>Follow the steps to reset your account password</p>

        {/* Step indicators */}
        <div className='flex items-center gap-2 mb-6'>
          {steps.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-lg transition ${step >= s.num ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                <span className='w-4 h-4 flex items-center justify-center'>{s.num}</span>
                <span className='hidden sm:inline'>{s.label}</span>
              </div>
              {i < steps.length - 1 && <div className={`flex-1 h-0.5 rounded ${step > s.num ? 'bg-green-400' : 'bg-gray-200'}`} />}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1 */}
        {step === 1 && (
          <div className='slide-up'>
            <div className='mb-5'>
              <label className='block text-gray-700 font-medium mb-1 text-sm'>Email Address</label>
              <input className='grabit-input' type="email" placeholder='Enter your registered email' onChange={e => setEmail(e.target.value)} value={email} />
            </div>
            {err && <p className='text-red-500 text-sm mb-3'>⚠️ {err}</p>}
            <button className='btn-primary w-full py-3' onClick={handleSendOtp} disabled={loading}>
              {loading ? <ClipLoader size={18} color='white' /> : "Send OTP"}
            </button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className='slide-up'>
            <p className='text-sm text-gray-500 mb-4'>A 4-digit OTP was sent to <span className='font-semibold text-green-700'>{email}</span></p>
            <div className='mb-5'>
              <label className='block text-gray-700 font-medium mb-1 text-sm'>Enter OTP</label>
              <input className='grabit-input text-center tracking-widest text-lg font-bold' type="text" placeholder='----' maxLength={4} onChange={e => setOtp(e.target.value)} value={otp} />
            </div>
            {err && <p className='text-red-500 text-sm mb-3'>⚠️ {err}</p>}
            <button className='btn-primary w-full py-3' onClick={handleVerifyOtp} disabled={loading}>
              {loading ? <ClipLoader size={18} color='white' /> : "Verify OTP"}
            </button>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className='slide-up'>
            <div className='mb-4'>
              <label className='block text-gray-700 font-medium mb-1 text-sm'>New Password</label>
              <input className='grabit-input' type="password" placeholder='Enter new password' onChange={e => setNewPassword(e.target.value)} value={newPassword} />
            </div>
            <div className='mb-5'>
              <label className='block text-gray-700 font-medium mb-1 text-sm'>Confirm Password</label>
              <input className='grabit-input' type="password" placeholder='Confirm new password' onChange={e => setConfirmPassword(e.target.value)} value={confirmPassword} />
            </div>
            {err && <p className='text-red-500 text-sm mb-3'>⚠️ {err}</p>}
            <button className='btn-primary w-full py-3' onClick={handleResetPassword} disabled={loading}>
              {loading ? <ClipLoader size={18} color='white' /> : "Reset Password"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ForgotPassword
