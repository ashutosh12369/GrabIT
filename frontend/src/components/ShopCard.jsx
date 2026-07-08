import React from 'react'
import { FaHeart, FaRegHeart, FaStar } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { serverUrl } from '../App'
import { setUserData } from '../redux/userSlice'

function ShopCard({ data, onClick }) {
  const dispatch = useDispatch()
  const { userData } = useSelector(state => state.user)

  const isFavorite = userData?.favorites?.includes(data._id)

  const handleToggleFavorite = async (e) => {
    e.stopPropagation() // prevent clicking the shop card
    try {
      const res = await axios.patch(`${serverUrl}/api/user/toggle-favorite/${data._id}`, {}, { withCredentials: true })
      dispatch(setUserData(res.data))
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div 
      className='grabit-card w-[240px] flex flex-col overflow-hidden group cursor-pointer relative shrink-0'
      onClick={onClick}
    >
      {/* Image */}
      <div className='relative w-full h-[140px] overflow-hidden bg-gray-100'>
        <img src={data.image} alt={data.name} className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500' />
        <div className='absolute inset-0 bg-black/20'></div>
        
        {/* Favorite Button */}
        <button 
          onClick={handleToggleFavorite}
          className='absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition'
        >
          {isFavorite ? <FaHeart className='text-red-500' /> : <FaRegHeart className='text-gray-600' />}
        </button>

        {/* Rating Badge */}
        {data.avgRating > 0 && (
          <div className='absolute bottom-3 left-3 bg-white/90 px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold text-gray-800 border border-gray-200'>
            <FaStar className='text-yellow-400' /> {data.avgRating.toFixed(1)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className='flex flex-col p-4 flex-1 gap-1'>
        <h3 className='font-bold text-gray-800 text-base truncate'>{data.name}</h3>
        <p className='text-xs text-gray-500 truncate'>
          {data.cuisines?.length > 0 ? data.cuisines.join(', ') : data.city}
        </p>
        <div className='flex items-center justify-between mt-2 pt-2 border-t border-gray-100'>
          <span className='text-xs font-semibold text-gray-600'>{data.address}</span>
          {data.avgPrice > 0 && (
            <span className='text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded-lg'>~₹{Math.round(data.avgPrice)} for one</span>
          )}
        </div>
      </div>
    </div>
  )
}

export default ShopCard
