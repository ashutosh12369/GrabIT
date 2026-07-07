import React, { useState } from 'react'
import { FaLeaf, FaDrumstickBite, FaStar, FaMinus, FaPlus, FaShoppingCart } from "react-icons/fa"
import { FaRegStar } from "react-icons/fa6"
import { useDispatch, useSelector } from 'react-redux'
import { addToCart } from '../redux/userSlice'

function FoodCard({ data }) {
  const [quantity, setQuantity] = useState(1)
  const dispatch = useDispatch()
  const { cartItems } = useSelector(state => state.user)
  const isInCart = cartItems.some(i => i.id == data._id)

  const renderStars = (rating) => Array.from({ length: 5 }, (_, i) =>
    i < Math.round(rating)
      ? <FaStar key={i} className='text-yellow-400 text-sm' />
      : <FaRegStar key={i} className='text-yellow-300 text-sm' />
  )

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: data._id,
      name: data.name,
      price: data.price,
      image: data.image,
      shop: data.shop,
      quantity,
      foodType: data.foodType
    }))
  }

  return (
    <div className='w-[240px] rounded-2xl bg-white border border-green-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group'>
      {/* Image */}
      <div className='relative w-full h-[160px] overflow-hidden bg-green-50'>
        <img src={data.image} alt={data.name} className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-400' />
        {/* Food type badge */}
        <div className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center shadow-md ${data.foodType === 'veg' ? 'bg-green-100' : 'bg-red-100'}`}>
          {data.foodType === 'veg'
            ? <FaLeaf className='text-green-600 text-sm' />
            : <FaDrumstickBite className='text-red-500 text-sm' />
          }
        </div>
        {/* Category badge */}
        <div className='absolute bottom-2 left-2 bg-white/90 text-xs text-gray-600 px-2 py-0.5 rounded-full font-medium'>
          {data.category}
        </div>
      </div>

      {/* Info */}
      <div className='flex flex-col p-3 flex-1 gap-1'>
        <h3 className='font-bold text-gray-800 text-sm truncate'>{data.name}</h3>
        <div className='flex items-center gap-1'>
          {renderStars(data.rating?.average || 0)}
          <span className='text-xs text-gray-400 ml-0.5'>({data.rating?.count || 0})</span>
        </div>
      </div>

      {/* Actions */}
      <div className='flex items-center justify-between px-3 pb-3 gap-2'>
        <span className='font-black text-green-700 text-base'>₹{data.price}</span>

        <div className='flex items-center gap-1'>
          {/* Qty */}
          <div className='flex items-center border border-green-200 rounded-xl overflow-hidden text-sm'>
            <button className='px-2 py-1 hover:bg-green-50 transition text-green-700 cursor-pointer' onClick={() => setQuantity(q => Math.max(1, q - 1))}>
              <FaMinus size={10} />
            </button>
            <span className='px-2 font-semibold text-gray-700 min-w-[20px] text-center'>{quantity}</span>
            <button className='px-2 py-1 hover:bg-green-50 transition text-green-700 cursor-pointer' onClick={() => setQuantity(q => q + 1)}>
              <FaPlus size={10} />
            </button>
          </div>

          {/* Add to cart */}
          {data.isAvailable !== false ? (
            <button
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition cursor-pointer ${isInCart ? 'bg-gray-800 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
              onClick={handleAddToCart}
            >
              <FaShoppingCart size={13} />
            </button>
          ) : (
            <div className='text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg border border-red-100'>
              Out of Stock
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default FoodCard
