import React, { useEffect, useRef, useState } from 'react'
import Nav from './Nav'
import { categories } from '../category'
import CategoryCard from './CategoryCard'
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6"
import { useSelector } from 'react-redux'
import FoodCard from './FoodCard'
import { useNavigate } from 'react-router-dom'

function UserDashboard() {
  const { currentCity, shopInMyCity, itemsInMyCity, searchItems } = useSelector(state => state.user)
  const cateScrollRef = useRef()
  const shopScrollRef = useRef()
  const navigate = useNavigate()
  const [showLeftCateButton, setShowLeftCateButton] = useState(false)
  const [showRightCateButton, setShowRightCateButton] = useState(false)
  const [showLeftShopButton, setShowLeftShopButton] = useState(false)
  const [showRightShopButton, setShowRightShopButton] = useState(false)
  const [updatedItemsList, setUpdatedItemsList] = useState([])
  const [activeCategory, setActiveCategory] = useState("All")

  const handleFilterByCategory = (category) => {
    setActiveCategory(category)
    if (category === "All") {
      setUpdatedItemsList(itemsInMyCity)
    } else {
      setUpdatedItemsList(itemsInMyCity?.filter(i => i.category === category))
    }
  }

  useEffect(() => {
    setUpdatedItemsList(itemsInMyCity)
  }, [itemsInMyCity])

  const updateButton = (ref, setLeftButton, setRightButton) => {
    const element = ref.current
    if (element) {
      setLeftButton(element.scrollLeft > 0)
      setRightButton(element.scrollLeft + element.clientWidth < element.scrollWidth)
    }
  }

  const scrollHandler = (ref, direction) => {
    if (ref.current) {
      ref.current.scrollBy({ left: direction === "left" ? -220 : 220, behavior: "smooth" })
    }
  }

  useEffect(() => {
    if (cateScrollRef.current) {
      updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
      updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
      cateScrollRef.current.addEventListener('scroll', () => updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton))
      shopScrollRef.current.addEventListener('scroll', () => updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton))
    }
  }, [categories])

  return (
    <div className='w-full min-h-screen flex flex-col gap-8 items-center pb-16' style={{ backgroundColor: 'var(--bg)' }}>
      <Nav />

      {/* Hero Banner */}
      <div className='w-full hero-gradient px-6 pt-28 pb-10 flex flex-col items-center text-center gap-3'>
        <h1 className='text-3xl md:text-4xl font-black text-white'>
          Hungry? <span className='text-green-300'>GrabIT!</span>
        </h1>
        <p className='text-green-200 text-base max-w-md'>Order from the best restaurants in <span className='font-bold text-white'>{currentCity || "your city"}</span></p>
      </div>

      {/* Search Results */}
      {searchItems && searchItems.length > 0 && (
        <div className='w-full max-w-6xl flex flex-col gap-4 items-start px-4 fade-in'>
          <h2 className='text-xl font-bold text-gray-700'>🔍 Search Results</h2>
          <div className='w-full flex flex-wrap gap-5 justify-center'>
            {searchItems.map(item => <FoodCard data={item} key={item._id} />)}
          </div>
        </div>
      )}

      {/* Categories */}
      <div className='w-full max-w-6xl flex flex-col gap-3 items-start px-4'>
        <h2 className='text-xl font-bold text-gray-700'>🍽️ What are you craving?</h2>
        <div className='w-full relative'>
          {showLeftCateButton && (
            <button className='absolute left-0 top-1/2 -translate-y-1/2 bg-green-600 text-white p-2 rounded-full shadow-lg hover:bg-green-700 z-10 cursor-pointer' onClick={() => scrollHandler(cateScrollRef, "left")}>
              <FaCircleChevronLeft size={18} />
            </button>
          )}
          <div className='w-full flex overflow-x-auto gap-3 pb-2' ref={cateScrollRef}>
            {[{ category: "All", image: "https://cdn-icons-png.flaticon.com/512/1046/1046749.png" }, ...categories].map((cate, index) => (
              <CategoryCard
                name={cate.category}
                image={cate.image}
                key={index}
                active={activeCategory === cate.category}
                onClick={() => handleFilterByCategory(cate.category)}
              />
            ))}
          </div>
          {showRightCateButton && (
            <button className='absolute right-0 top-1/2 -translate-y-1/2 bg-green-600 text-white p-2 rounded-full shadow-lg hover:bg-green-700 z-10 cursor-pointer' onClick={() => scrollHandler(cateScrollRef, "right")}>
              <FaCircleChevronRight size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Shops */}
      <div className='w-full max-w-6xl flex flex-col gap-3 items-start px-4'>
        <h2 className='text-xl font-bold text-gray-700'>🏪 Top Restaurants in {currentCity}</h2>
        <div className='w-full relative'>
          {showLeftShopButton && (
            <button className='absolute left-0 top-1/2 -translate-y-1/2 bg-green-600 text-white p-2 rounded-full shadow-lg hover:bg-green-700 z-10 cursor-pointer' onClick={() => scrollHandler(shopScrollRef, "left")}>
              <FaCircleChevronLeft size={18} />
            </button>
          )}
          <div className='w-full flex overflow-x-auto gap-4 pb-2' ref={shopScrollRef}>
            {shopInMyCity?.map((shop, index) => (
              <CategoryCard name={shop.name} image={shop.image} key={index} onClick={() => navigate(`/shop/${shop._id}`)} />
            ))}
          </div>
          {showRightShopButton && (
            <button className='absolute right-0 top-1/2 -translate-y-1/2 bg-green-600 text-white p-2 rounded-full shadow-lg hover:bg-green-700 z-10 cursor-pointer' onClick={() => scrollHandler(shopScrollRef, "right")}>
              <FaCircleChevronRight size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Food Items */}
      <div className='w-full max-w-6xl flex flex-col gap-4 items-start px-4'>
        <h2 className='text-xl font-bold text-gray-700'>
          🔥 {activeCategory === "All" ? "Suggested Food Items" : activeCategory}
          <span className='ml-2 text-sm font-normal text-gray-400'>({updatedItemsList?.length || 0} items)</span>
        </h2>
        <div className='w-full flex flex-wrap gap-5 justify-center'>
          {updatedItemsList?.map((item, index) => <FoodCard key={index} data={item} />)}
          {updatedItemsList?.length === 0 && (
            <div className='text-center py-10 text-gray-400 w-full'>
              <div className='text-4xl mb-2'>🍽️</div>
              No items found in this category
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserDashboard
