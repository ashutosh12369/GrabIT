import React, { useEffect, useRef, useState } from 'react'
import Nav from './Nav'
import { categories } from '../category'
import CategoryCard from './CategoryCard'
import ShopCard from './ShopCard'
import { FaCircleChevronLeft, FaCircleChevronRight, FaFilter } from "react-icons/fa6"
import { useSelector, useDispatch } from 'react-redux'
import FoodCard from './FoodCard'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { serverUrl } from '../App'
import { setShopsInMyCity } from '../redux/userSlice'

function UserDashboard() {
  const { currentCity, shopInMyCity, itemsInMyCity, searchItems, userData } = useSelector(state => state.user)
  const dispatch = useDispatch()
  const cateScrollRef = useRef()
  const shopScrollRef = useRef()
  const navigate = useNavigate()
  
  const [showLeftCateButton, setShowLeftCateButton] = useState(false)
  const [showRightCateButton, setShowRightCateButton] = useState(false)
  const [showLeftShopButton, setShowLeftShopButton] = useState(false)
  const [showRightShopButton, setShowRightShopButton] = useState(false)
  
  const [updatedItemsList, setUpdatedItemsList] = useState([])
  const [activeCategory, setActiveCategory] = useState("All")
  const [shopSort, setShopSort] = useState("")

  const handleFilterByCategory = (category) => {
    setActiveCategory(category)
    if (category === "All") {
      setUpdatedItemsList(itemsInMyCity)
    } else {
      setUpdatedItemsList(itemsInMyCity?.filter(i => i.category === category))
    }
  }

  // Fetch shops dynamically with sort and filter
  useEffect(() => {
    const fetchShops = async () => {
      try {
        let url = `${serverUrl}/api/shop/get-by-city/${currentCity}?sort=${shopSort}`
        if(activeCategory !== "All") url += `&cuisine=${activeCategory}`
        const res = await axios.get(url, { withCredentials: true })
        dispatch(setShopsInMyCity(res.data))
      } catch (error) {
        console.log("Error fetching shops", error)
      }
    }
    if(currentCity) fetchShops()
  }, [currentCity, shopSort, activeCategory])

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
      ref.current.scrollBy({ left: direction === "left" ? -250 : 250, behavior: "smooth" })
    }
  }

  useEffect(() => {
    if (cateScrollRef.current) {
      updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
      updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
      const cRef = cateScrollRef.current
      const sRef = shopScrollRef.current
      const cHandler = () => updateButton(cateScrollRef, setShowLeftCateButton, setShowRightCateButton)
      const sHandler = () => updateButton(shopScrollRef, setShowLeftShopButton, setShowRightShopButton)
      
      cRef.addEventListener('scroll', cHandler)
      sRef.addEventListener('scroll', sHandler)
      return () => {
        cRef.removeEventListener('scroll', cHandler)
        sRef.removeEventListener('scroll', sHandler)
      }
    }
  }, [categories, shopInMyCity])

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
        <div className='w-full relative group'>
          {showLeftCateButton && (
            <button className='absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 text-green-700 p-2 rounded-full shadow-lg hover:bg-white z-10 cursor-pointer hidden md:block' onClick={() => scrollHandler(cateScrollRef, "left")}>
              <FaCircleChevronLeft size={22} />
            </button>
          )}
          <div className='w-full flex overflow-x-auto gap-3 pb-4 hide-scrollbar' ref={cateScrollRef}>
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
            <button className='absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 text-green-700 p-2 rounded-full shadow-lg hover:bg-white z-10 cursor-pointer hidden md:block' onClick={() => scrollHandler(cateScrollRef, "right")}>
              <FaCircleChevronRight size={22} />
            </button>
          )}
        </div>
      </div>

      {/* Shops */}
      <div className='w-full max-w-6xl flex flex-col gap-4 items-start px-4'>
        <div className='w-full flex items-center justify-between'>
          <h2 className='text-xl font-bold text-gray-700'>🏪 Top Restaurants in {currentCity}</h2>
          <div className='flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-green-100 shadow-sm'>
            <FaFilter className='text-green-600 text-sm' />
            <select 
              className='bg-transparent text-sm font-semibold outline-none text-gray-700 cursor-pointer'
              value={shopSort}
              onChange={(e) => setShopSort(e.target.value)}
            >
              <option value="">Recommended</option>
              <option value="rating">Highest Rated</option>
              <option value="priceLow">Cost: Low to High</option>
              <option value="priceHigh">Cost: High to Low</option>
            </select>
          </div>
        </div>

        <div className='w-full relative group'>
          {showLeftShopButton && (
            <button className='absolute left-0 top-1/2 -translate-y-1/2 bg-white/90 text-green-700 p-2 rounded-full shadow-lg hover:bg-white z-10 cursor-pointer hidden md:block' onClick={() => scrollHandler(shopScrollRef, "left")}>
              <FaCircleChevronLeft size={22} />
            </button>
          )}
          <div className='w-full flex overflow-x-auto gap-5 pb-4 hide-scrollbar' ref={shopScrollRef}>
            {shopInMyCity?.length > 0 ? (
              shopInMyCity.map((shop, index) => (
                <ShopCard data={shop} key={shop._id} onClick={() => navigate(`/shop/${shop._id}`)} />
              ))
            ) : (
              <div className='w-full text-center py-10 text-gray-400'>
                No restaurants found matching this filter.
              </div>
            )}
          </div>
          {showRightShopButton && (
            <button className='absolute right-0 top-1/2 -translate-y-1/2 bg-white/90 text-green-700 p-2 rounded-full shadow-lg hover:bg-white z-10 cursor-pointer hidden md:block' onClick={() => scrollHandler(shopScrollRef, "right")}>
              <FaCircleChevronRight size={22} />
            </button>
          )}
        </div>
      </div>

      {/* Favorites Section */}
      {userData?.favorites?.length > 0 && shopInMyCity?.some(s => userData.favorites.includes(s._id)) && (
        <div className='w-full max-w-6xl flex flex-col gap-4 items-start px-4'>
          <h2 className='text-xl font-bold text-gray-700 flex items-center gap-2'>❤️ Your Favorites</h2>
          <div className='w-full flex overflow-x-auto gap-5 pb-4 hide-scrollbar'>
            {shopInMyCity.filter(s => userData.favorites.includes(s._id)).map((shop) => (
              <ShopCard data={shop} key={`fav-${shop._id}`} onClick={() => navigate(`/shop/${shop._id}`)} />
            ))}
          </div>
        </div>
      )}

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
