import axios from 'axios'
import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { serverUrl } from '../App'
import { useEffect } from 'react'
import { useState } from 'react'
import { IoIosArrowRoundBack } from "react-icons/io";
import DeliveryBoyTracking from '../components/DeliveryBoyTracking'
import { useSelector } from 'react-redux'
function TrackOrderPage() {
    const { orderId } = useParams()
    const [currentOrder, setCurrentOrder] = useState() 
    const navigate = useNavigate()
    const {socket}=useSelector(state=>state.user)
    const [liveLocations,setLiveLocations]=useState({})
    const handleGetOrder = async () => {
        try {
            const result = await axios.get(`${serverUrl}/api/order/get-order-by-id/${orderId}`, { withCredentials: true })
            setCurrentOrder(result.data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(()=>{
socket.on('updateDeliveryLocation',({deliveryBoyId,latitude,longitude})=>{
setLiveLocations(prev=>({
  ...prev,
  [deliveryBoyId]:{lat:latitude,lon:longitude}
}))
})
    },[socket])

    useEffect(() => {
        handleGetOrder()
    }, [orderId])
    return (
        <div className='max-w-4xl mx-auto p-4 flex flex-col gap-6'>
            <div className='relative flex items-center gap-4 top-[20px] left-[20px] z-[10] mb-[10px]' onClick={() => navigate("/")}>
                <IoIosArrowRoundBack size={35} className='text-[#16a34a]' />
                <h1 className='text-2xl font-bold md:text-center'>Track Order</h1>
            </div>
      {currentOrder?.shopOrders?.map((shopOrder,index)=>(
        <div className='bg-white p-4 rounded-2xl shadow-md border border-orange-100 space-y-4' key={index}>
         <div>
            <p className='text-lg font-bold mb-2 text-[#16a34a]'>{shopOrder.shop.name}</p>
            <p className='font-semibold'><span>Items:</span> {shopOrder.shopOrderItems?.map(i=>i.name).join(",")}</p>
            <p><span className='font-semibold'>Subtotal:</span> {shopOrder.subtotal}</p>
            <p className='mt-6'><span className='font-semibold'>Delivery address:</span> {currentOrder.deliveryAddress?.text}</p>
            {currentOrder.scheduledFor && (
                <p className='mt-2 bg-blue-50 text-blue-800 p-3 rounded-lg font-bold flex items-center gap-2'>
                    📅 Scheduled For: {new Date(currentOrder.scheduledFor).toLocaleString()}
                </p>
            )}
         </div>
         <div className='my-4'>
            {/* Progress Bar */}
            <div className='flex items-center justify-between relative mb-2'>
                <div className='absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded-full'></div>
                <div className='absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-green-500 -z-10 rounded-full transition-all duration-500' 
                     style={{width: shopOrder.status === 'pending' ? '0%' : shopOrder.status === 'preparing' ? '33%' : shopOrder.status === 'out of delivery' ? '66%' : shopOrder.status === 'delivered' ? '100%' : '0%'}}>
                </div>
                
                {['pending', 'preparing', 'out of delivery', 'delivered'].map((s, i) => (
                    <div key={s} className='flex flex-col items-center'>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            ['pending', 'preparing', 'out of delivery', 'delivered'].indexOf(shopOrder.status) >= i 
                            ? 'bg-green-500 text-white shadow-lg' 
                            : 'bg-gray-300 text-gray-500'
                        }`}>
                            {i + 1}
                        </div>
                        <span className={`text-[10px] mt-1 capitalize font-medium ${
                            ['pending', 'preparing', 'out of delivery', 'delivered'].indexOf(shopOrder.status) >= i 
                            ? 'text-green-600' 
                            : 'text-gray-400'
                        }`}>
                            {s === 'out of delivery' ? 'On The Way' : s}
                        </span>
                    </div>
                ))}
            </div>
         </div>

         {shopOrder.status!="delivered"?<>
{shopOrder.assignedDeliveryBoy?
<div className='text-sm text-gray-700 bg-blue-50 p-3 rounded-xl border border-blue-100 mt-2'>
<p className='font-semibold'><span>Delivery Partner:</span> {shopOrder.assignedDeliveryBoy.fullName}</p>
<p className='font-semibold'><span>Contact:</span> {shopOrder.assignedDeliveryBoy.mobile}</p>
</div>:<p className='font-semibold text-green-500 bg-green-50 p-2 rounded-lg inline-block'>Looking for delivery partner...</p>}
         </>:<p className='text-green-600 font-bold text-lg bg-green-50 p-3 rounded-xl border border-green-100 text-center mt-2'>🎉 Order Delivered Successfully!</p>}

{(shopOrder.assignedDeliveryBoy && shopOrder.status !== "delivered") && (
  <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-md">
    <DeliveryBoyTracking data={{
      deliveryBoyLocation:liveLocations[shopOrder.assignedDeliveryBoy._id] || {
        lat: shopOrder.assignedDeliveryBoy.location.coordinates[1],
        lon: shopOrder.assignedDeliveryBoy.location.coordinates[0]
      },
      customerLocation: {
        lat: currentOrder.deliveryAddress.latitude,
        lon: currentOrder.deliveryAddress.longitude
      }
    }} />
  </div>
)}



        </div>
      ))}



        </div>
    )
}

export default TrackOrderPage
