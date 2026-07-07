import React from 'react'
import Nav from './Nav'
import { useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { useEffect } from 'react'
import { useState } from 'react'
import DeliveryBoyTracking from './DeliveryBoyTracking'
import { ClipLoader } from 'react-spinners'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function DeliveryBoy() {
  const {userData,socket}=useSelector(state=>state.user)
  const [currentOrder,setCurrentOrder]=useState()
  const [showOtpBox,setShowOtpBox]=useState(false)
  const [availableAssignments,setAvailableAssignments]=useState(null)
  const [otp,setOtp]=useState("")
  const [todayDeliveries,setTodayDeliveries]=useState([])
const [deliveryBoyLocation,setDeliveryBoyLocation]=useState(null)
const [loading,setLoading]=useState(false)
const [message,setMessage]=useState("")
  useEffect(()=>{
if(!socket || userData.role!=="deliveryBoy") return
let watchId
if(navigator.geolocation){
watchId=navigator.geolocation.watchPosition((position)=>{
    const latitude=position.coords.latitude
    const longitude=position.coords.longitude
    setDeliveryBoyLocation({lat:latitude,lon:longitude})
    socket.emit('updateLocation',{
      latitude,
      longitude,
      userId:userData._id
    })
  }),
  (error)=>{
    console.log(error)
  },
  {
    enableHighAccuracy:true
  }
}

return ()=>{
  if(watchId)navigator.geolocation.clearWatch(watchId)
}

  },[socket,userData])


const ratePerDelivery=50
const totalEarning=todayDeliveries.reduce((sum,d)=>sum + d.count*ratePerDelivery,0)



  const getAssignments=async () => {
    try {
      const result=await axios.get(`${serverUrl}/api/order/get-assignments`,{withCredentials:true})
      
      setAvailableAssignments(result.data)
    } catch (error) {
      console.log(error)
    }
  }

  const getCurrentOrder=async () => {
     try {
      const result=await axios.get(`${serverUrl}/api/order/get-current-order`,{withCredentials:true})
    setCurrentOrder(result.data)
    } catch (error) {
      console.log(error)
    }
  }


  const acceptOrder=async (assignmentId) => {
    try {
      const result=await axios.get(`${serverUrl}/api/order/accept-order/${assignmentId}`,{withCredentials:true})
    console.log(result.data)
    await getCurrentOrder()
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(()=>{
    socket.on('newAssignment',(data)=>{
      setAvailableAssignments(prev=>([...prev,data]))
    })
    return ()=>{
      socket.off('newAssignment')
    }
  },[socket])
  
  const sendOtp=async () => {
    setLoading(true)
    try {
      const result=await axios.post(`${serverUrl}/api/order/send-delivery-otp`,{
        orderId:currentOrder._id,shopOrderId:currentOrder.shopOrder._id
      },{withCredentials:true})
      setLoading(false)
       setShowOtpBox(true)
    console.log(result.data)
    } catch (error) {
      console.log(error)
      setLoading(false)
    }
  }
   const verifyOtp=async () => {
    setMessage("")
    try {
      const result=await axios.post(`${serverUrl}/api/order/verify-delivery-otp`,{
        orderId:currentOrder._id,shopOrderId:currentOrder.shopOrder._id,otp
      },{withCredentials:true})
    console.log(result.data)
    setMessage(result.data.message)
    setTimeout(() => {
        setCurrentOrder(null)
        setShowOtpBox(false)
        handleTodayDeliveries()
        setMessage("")
        setOtp("")
    }, 2500)
    } catch (error) {
      console.log(error)
      setMessage(error.response?.data?.message || "Invalid OTP")
    }
  }


   const handleTodayDeliveries=async () => {
    
    try {
      const result=await axios.get(`${serverUrl}/api/order/get-today-deliveries`,{withCredentials:true})
    console.log(result.data)
   setTodayDeliveries(result.data)
    } catch (error) {
      console.log(error)
    }
  }
 

  useEffect(()=>{
getAssignments()
getCurrentOrder()
handleTodayDeliveries()
  },[userData])
  return (
    <div className='w-full min-h-screen flex flex-col gap-5 items-center pb-16 overflow-y-auto' style={{ backgroundColor: 'var(--bg)' }}>
      <Nav/>
      <div className='w-full max-w-[800px] flex flex-col gap-5 items-center mt-6'>
    <div className='rounded-2xl shadow-sm p-5 flex flex-col justify-start items-center w-[90%] border border-green-100 dark:border-gray-700 text-center gap-2' style={{ backgroundColor: 'var(--card)' }}>
<h1 className='text-xl font-bold text-green-600 dark:text-green-500'>Welcome, {userData.fullName}</h1>
<p className='text-gray-600 dark:text-gray-400 text-sm'><span className='font-semibold'>Latitude:</span> {deliveryBoyLocation?.lat || '...'}, <span className='font-semibold'>Longitude:</span> {deliveryBoyLocation?.lon || '...'}</p>
    </div>

<div className='rounded-2xl shadow-sm p-5 w-[90%] mb-2 border border-green-100 dark:border-gray-700' style={{ backgroundColor: 'var(--card)' }}>
  <h1 className='text-lg font-bold mb-3 text-green-600 dark:text-green-500'>Today's Deliveries</h1>

  <ResponsiveContainer width="100%" height={200}>
   <BarChart data={todayDeliveries}>
  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.2}/>
  <XAxis dataKey="hour" tickFormatter={(h)=>`${h}:00`} stroke="var(--text-muted)"/>
    <YAxis allowDecimals={false} stroke="var(--text-muted)"/>
    <Tooltip formatter={(value)=>[value,"orders"]} labelFormatter={label=>`${label}:00`} contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}/>
      <Bar dataKey="count" fill='#16a34a' radius={[4, 4, 0, 0]}/>
   </BarChart>
  </ResponsiveContainer>

  <div className='max-w-sm mx-auto mt-6 p-6 rounded-2xl shadow-sm text-center border border-green-100 dark:border-gray-700' style={{ backgroundColor: 'var(--bg)' }}>
<h1 className='text-xl font-semibold mb-2' style={{ color: 'var(--text)' }}>Today's Earning</h1>
<span className='text-3xl font-bold text-green-600 dark:text-green-500'>₹{totalEarning}</span>
  </div>
</div>


{!currentOrder && <div className='rounded-2xl p-5 shadow-sm w-[90%] border border-green-100 dark:border-gray-700' style={{ backgroundColor: 'var(--card)' }}>
<h1 className='text-lg font-bold mb-4 flex items-center gap-2' style={{ color: 'var(--text)' }}>Available Orders</h1>

<div className='space-y-4'>
{availableAssignments?.length>0
?
(
availableAssignments.map((a,index)=>(
  <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex justify-between items-center bg-gray-50 dark:bg-gray-800' key={index}>
   <div>
    <p className='text-sm font-bold' style={{ color: 'var(--text)' }}>{a?.shopName}</p>
    <p className='text-sm mt-1' style={{ color: 'var(--text-muted)' }}><span className='font-semibold'>Delivery Address:</span> {a?.deliveryAddress.text}</p>
<p className='text-xs mt-1' style={{ color: 'var(--text-muted)' }}>{a.items.length} items | ₹{a.subtotal}</p>
   </div>
   <button className='bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition cursor-pointer' onClick={()=>acceptOrder(a.assignmentId)}>Accept</button>

  </div>
))
):<p className='text-sm' style={{ color: 'var(--text-muted)' }}>No Available Orders</p>}
</div>
</div>}

{currentOrder && <div className='rounded-2xl p-5 shadow-sm w-[90%] border border-green-100 dark:border-gray-700' style={{ backgroundColor: 'var(--card)' }}>
<h2 className='text-lg font-bold mb-3' style={{ color: 'var(--text)' }}>📦 Current Order</h2>
<div className='border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 bg-gray-50 dark:bg-gray-800'>
  <p className='font-bold text-sm' style={{ color: 'var(--text)' }}>{currentOrder?.shopOrder.shop.name}</p>
  <p className='text-sm mt-1' style={{ color: 'var(--text-muted)' }}>{currentOrder.deliveryAddress.text}</p>
 <p className='text-xs mt-1' style={{ color: 'var(--text-muted)' }}>{currentOrder.shopOrder.shopOrderItems.length} items | ₹{currentOrder.shopOrder.subtotal}</p>
</div>

 <DeliveryBoyTracking data={{ 
  deliveryBoyLocation:deliveryBoyLocation || {
        lat: userData.location.coordinates[1],
        lon: userData.location.coordinates[0]
      },
      customerLocation: {
        lat: currentOrder.deliveryAddress.latitude,
        lon: currentOrder.deliveryAddress.longitude
      }}} />
{!showOtpBox ? <button className='mt-5 w-full bg-green-600 text-white font-semibold py-3 px-4 rounded-xl shadow-md hover:bg-green-700 active:scale-95 transition-all duration-200 cursor-pointer flex justify-center items-center' onClick={sendOtp} disabled={loading}>
{loading?<ClipLoader size={20} color='white'/> :"Mark As Delivered"}
 </button>:<div className='mt-5 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800'>
<p className='text-sm font-semibold mb-3' style={{ color: 'var(--text)' }}>Enter OTP sent to <span className='text-green-600 dark:text-green-500 font-bold'>{currentOrder.user.fullName}</span></p>
<input type="text" className='w-full border border-gray-300 dark:border-gray-600 px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-white' placeholder='Enter 4-digit OTP' onChange={(e)=>setOtp(e.target.value)} value={otp}/>
{message && <p className='text-center text-green-500 text-lg font-semibold mb-4'>{message}</p>}

<button className="w-full bg-green-600 text-white py-2.5 rounded-lg font-semibold hover:bg-green-700 transition-all cursor-pointer" onClick={verifyOtp}>Submit OTP</button>
  </div>}

  </div>}


      </div>
    </div>
  )
}

export default DeliveryBoy
