import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { IoIosArrowRoundBack } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import UserOrderCard from '../components/UserOrderCard';
import OwnerOrderCard from '../components/OwnerOrderCard';
import { setMyOrders, updateOrderStatus, updateRealtimeOrderStatus } from '../redux/userSlice';


function MyOrders() {
  const { userData, myOrders,socket} = useSelector(state => state.user)
  const navigate = useNavigate()
const dispatch=useDispatch()
  useEffect(()=>{
socket?.on('newOrder',(data)=>{
if(data.shopOrders?.owner._id==userData._id){
dispatch(setMyOrders([data,...myOrders]))
}
})

socket?.on('update-status',({orderId,shopId,status,userId})=>{
if(userId==userData._id){
  dispatch(updateRealtimeOrderStatus({orderId,shopId,status}))
}
})

return ()=>{
  socket?.off('newOrder')
  socket?.off('update-status')
}
  },[socket])



  
  return (
    <div className='"w-full min-h-screen bg-[#fff9f6] flex justify-center px-4'>
      <div className='w-full max-w-[800px] p-4'>

        <div className='flex items-center gap-[20px] mb-6 '>
          <div className=' z-[10] ' onClick={() => navigate("/")}>
            <IoIosArrowRoundBack size={35} className='text-[#16a34a]' />
          </div>
          <h1 className='text-2xl font-bold  text-start'>My Orders</h1>
        </div>
        <div className='space-y-6'>
          {myOrders?.length > 0 ? (
            myOrders.map((order, index) => (
              userData.role === "user" ? (
                <UserOrderCard data={order} key={index} />
              ) : userData.role === "owner" ? (
                <OwnerOrderCard data={order} key={index} />
              ) : null
            ))
          ) : (
            <div className='flex flex-col items-center justify-center py-20 text-center opacity-70'>
              <img src="/placeholder-empty.png" alt="" className='w-48 h-48 mb-6 opacity-50 grayscale' onError={(e) => e.target.style.display = 'none'} />
              <h2 className='text-2xl font-bold text-gray-700 mb-2'>No orders yet</h2>
              <p className='text-gray-500 mb-6'>Looks like you haven't placed any orders yet.</p>
              {userData.role === "user" && (
                <button 
                  className='bg-[#16a34a] text-white px-6 py-2 rounded-xl font-semibold hover:bg-green-600 transition'
                  onClick={() => navigate('/')}
                >
                  Start Ordering
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyOrders
