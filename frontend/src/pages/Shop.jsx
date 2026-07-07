import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { serverUrl } from '../App'
import { useNavigate, useParams } from 'react-router-dom'
import { FaStore } from "react-icons/fa6";
import { FaLocationDot } from "react-icons/fa6";
import { FaUtensils } from "react-icons/fa";
import FoodCard from '../components/FoodCard';
import { FaArrowLeft } from "react-icons/fa";
function Shop() {
    const {shopId}=useParams()
    const [items,setItems]=useState([])
    const [shop,setShop]=useState([])
    const [newReview, setNewReview] = useState({ rating: 0, comment: "" })
    const navigate=useNavigate()
    const handleShop=async () => {
        try {
           const result=await axios.get(`${serverUrl}/api/item/get-by-shop/${shopId}`,{withCredentials:true}) 
           setShop(result.data.shop)
           setItems(result.data.items)
        } catch (error) {
            console.log(error)
        }
    }

    const handleSubmitReview = async () => {
        try {
            if (newReview.rating === 0 || !newReview.comment) {
                alert("Please provide a rating and a comment.")
                return;
            }
            const result = await axios.post(`${serverUrl}/api/shop/add-review/${shopId}`, newReview, {withCredentials:true})
            setShop(result.data.shop)
            setNewReview({ rating: 0, comment: "" })
        } catch (error) {
            alert(error.response?.data?.message || "Failed to submit review")
        }
    }

    useEffect(()=>{
handleShop()
    },[shopId])
  return (
    <div className='min-h-screen bg-gray-50'>
        <button className='absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-full shadow-md transition' onClick={()=>navigate("/")}>
        <FaArrowLeft />
<span>Back</span>
        </button>
      {shop && <div className='relative w-full h-64 md:h-80 lg:h-96'>
          <img src={shop.image} alt="" className='w-full h-full object-cover'/>
          <div className='absolute inset-0 bg-gradient-to-b from-black/70 to-black/30 flex flex-col justify-center items-center text-center px-4'>
          <FaStore className='text-white text-4xl mb-3 drop-shadow-md'/>
          <h1 className='text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg'>{shop.name}</h1>
          <div className='flex items-center  gap-[10px]'>
          <FaLocationDot size={22} color='red'/>
             <p className='text-lg font-medium text-gray-200 mt-[10px]'>{shop.address}</p>
             </div>
          </div>
       
        </div>}

<div className='max-w-7xl mx-auto px-6 py-10'>
<h2 className='flex items-center justify-center gap-3 text-3xl font-bold mb-10 text-gray-800'><FaUtensils color='red'/> Our Menu</h2>

{items.length>0?(
    <div className='flex flex-wrap justify-center gap-8'>
        {items.map((item)=>(
            <FoodCard key={item._id} data={item}/>
        ))}
    </div>
):<p className='text-center text-gray-500 text-lg'>No Items Available</p>}
</div>

{/* Reviews Section */}
<div className='max-w-7xl mx-auto px-6 py-10 border-t'>
    <h2 className='text-2xl font-bold mb-6 text-gray-800'>Reviews & Ratings</h2>
    
    <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        {/* Submit Review */}
        <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100'>
            <h3 className='font-bold text-lg mb-4'>Write a Review</h3>
            <div className='space-y-4'>
                <div className='flex gap-2'>
                    {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => setNewReview(prev => ({...prev, rating: star}))} className={`text-2xl ${newReview.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>
                    ))}
                </div>
                <textarea 
                    className='w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#16a34a] focus:outline-none'
                    placeholder='What did you like or dislike?'
                    rows='3'
                    value={newReview.comment}
                    onChange={e => setNewReview(prev => ({...prev, comment: e.target.value}))}
                ></textarea>
                <button onClick={handleSubmitReview} className='bg-[#16a34a] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#15803d] transition'>Submit Review</button>
            </div>
        </div>

        {/* Display Reviews */}
        <div className='space-y-4 max-h-[400px] overflow-y-auto pr-2'>
            {shop.reviews && shop.reviews.length > 0 ? shop.reviews.map((rev, idx) => (
                <div key={idx} className='bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4'>
                    <img src={rev.user?.profilePicture || "https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg"} className='w-10 h-10 rounded-full object-cover' />
                    <div>
                        <p className='font-bold text-sm text-gray-800'>{rev.user?.fullName}</p>
                        <div className='text-yellow-400 text-xs mb-1'>{"★".repeat(rev.rating)}{"☆".repeat(5-rev.rating)}</div>
                        <p className='text-gray-600 text-sm'>{rev.comment}</p>
                    </div>
                </div>
            )) : <p className='text-gray-500'>No reviews yet. Be the first to review!</p>}
        </div>
    </div>
</div>

    </div>
  )
}

export default Shop
