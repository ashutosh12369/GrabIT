import React, { useEffect, useState } from 'react'
import { FaLocationDot } from "react-icons/fa6"
import { IoIosSearch } from "react-icons/io"
import { FiShoppingCart } from "react-icons/fi"
import { useDispatch, useSelector } from 'react-redux'
import { RxCross2 } from "react-icons/rx"
import axios from 'axios'
import { serverUrl } from '../App'
import { setSearchItems, setUserData } from '../redux/userSlice'
import { FaPlus } from "react-icons/fa6"
import { TbReceipt2 } from "react-icons/tb"
import { MdAdminPanelSettings, MdSupportAgent } from "react-icons/md"
import { useNavigate } from 'react-router-dom'

function Nav() {
  const { userData, currentCity, cartItems } = useSelector(state => state.user)
  const { myShopData } = useSelector(state => state.owner)
  const [showInfo, setShowInfo] = useState(false)
  const [showSearch, setShowSearch] = useState(false)
  const [query, setQuery] = useState("")
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/signout`, { withCredentials: true })
      dispatch(setUserData(null))
    } catch (error) {
      console.log(error)
    }
  }

  const handleSearchItems = async () => {
    try {
      const result = await axios.get(
        `${serverUrl}/api/item/search-items?query=${query}&city=${currentCity}`,
        { withCredentials: true }
      )
      dispatch(setSearchItems(result.data))
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    if (query) {
      handleSearchItems()
    } else {
      dispatch(setSearchItems(null))
    }
  }, [query])

  const avatarLetter = userData?.fullName?.slice(0, 1)?.toUpperCase()

  return (
    <div className='w-full h-[72px] flex items-center justify-between md:justify-center gap-[30px] px-[20px] fixed top-0 z-[9999] glass border-b border-green-100 shadow-sm overflow-visible'>

      {/* Mobile Search Dropdown */}
      {showSearch && userData?.role === "user" && (
        <div className='w-[90%] h-[64px] bg-white shadow-xl rounded-2xl items-center gap-4 flex fixed top-[78px] left-[5%] md:hidden border border-green-100 fade-in'>
          <div className='flex items-center w-[30%] overflow-hidden gap-2 px-3 border-r border-green-200'>
            <FaLocationDot size={20} className="text-green-600" />
            <div className='w-[80%] truncate text-gray-600 text-sm'>{currentCity}</div>
          </div>
          <div className='flex-1 flex items-center gap-2 px-2'>
            <IoIosSearch size={20} className='text-green-600' />
            <input
              type="text"
              placeholder='Search delicious food...'
              className='outline-none w-full text-gray-700 text-sm'
              onChange={(e) => setQuery(e.target.value)}
              value={query}
            />
          </div>
        </div>
      )}

      {/* Logo */}
      <div className='flex items-center gap-2 cursor-pointer' onClick={() => navigate('/')}>
        <div className='w-8 h-8 bg-gradient-to-br from-green-600 to-green-400 rounded-lg flex items-center justify-center shadow-md'>
          <span className='text-white font-black text-sm'>G</span>
        </div>
        <h1 className='text-2xl font-black bg-gradient-to-r from-green-700 to-green-500 bg-clip-text text-transparent'>
          GrabIT
        </h1>
      </div>

      {/* Desktop Search Bar (users only) */}
      {userData?.role === "user" && (
        <div className='md:w-[50%] lg:w-[38%] h-[48px] bg-white shadow-md rounded-2xl items-center gap-3 hidden md:flex border border-green-100 px-3'>
          <div className='flex items-center gap-2 pr-3 border-r border-green-200'>
            <FaLocationDot size={16} className="text-green-600" />
            <div className='max-w-[90px] truncate text-gray-600 text-sm'>{currentCity}</div>
          </div>
          <IoIosSearch size={18} className='text-green-500' />
          <input
            type="text"
            placeholder='Search for food, restaurants...'
            className='outline-none flex-1 text-gray-700 text-sm'
            onChange={(e) => setQuery(e.target.value)}
            value={query}
          />
        </div>
      )}

      {/* Right actions */}
      <div className='flex items-center gap-3'>

        {/* Mobile search toggle */}
        {userData?.role === "user" && (
          showSearch
            ? <RxCross2 size={22} className='text-green-600 md:hidden cursor-pointer' onClick={() => setShowSearch(false)} />
            : <IoIosSearch size={22} className='text-green-600 md:hidden cursor-pointer' onClick={() => setShowSearch(true)} />
        )}

        {/* Admin badge */}
        {userData?.role === "admin" && (
          <button
            className='flex items-center gap-1 px-3 py-1.5 rounded-xl bg-green-600 text-white text-sm font-semibold cursor-pointer'
            onClick={() => navigate('/admin')}
          >
            <MdAdminPanelSettings size={18} />
            <span className='hidden md:inline'>Admin Panel</span>
          </button>
        )}

        {/* Support Agent badge */}
        {userData?.role === "supportAgent" && (
          <div className='flex items-center gap-1 px-3 py-1.5 rounded-xl bg-green-100 text-green-700 text-sm font-semibold'>
            <MdSupportAgent size={18} />
            <span className='hidden md:inline'>Support Agent</span>
          </div>
        )}

        {/* Owner actions */}
        {userData?.role === "owner" && (
          <>
            {myShopData && (
              <button
                className='flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-sm font-semibold cursor-pointer hover:bg-green-100 transition'
                onClick={() => navigate('/add-item')}
              >
                <FaPlus size={14} />
                <span className='hidden md:inline'>Add Item</span>
              </button>
            )}
            <button
              className='flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-sm font-semibold cursor-pointer hover:bg-green-100 transition'
              onClick={() => navigate('/my-orders')}
            >
              <TbReceipt2 size={16} />
              <span className='hidden md:inline'>My Orders</span>
            </button>
          </>
        )}

        {/* User cart + orders */}
        {userData?.role === "user" && (
          <>
            <div className='relative cursor-pointer' onClick={() => navigate('/cart')}>
              <FiShoppingCart size={22} className='text-green-700' />
              {cartItems.length > 0 && (
                <span className='absolute -right-2 -top-2 w-5 h-5 bg-green-500 text-white text-[11px] font-bold rounded-full flex items-center justify-center'>
                  {cartItems.length}
                </span>
              )}
            </div>
            <button
              className='hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-50 text-green-700 text-sm font-semibold cursor-pointer hover:bg-green-100 transition'
              onClick={() => navigate('/my-orders')}
            >
              My Orders
            </button>
          </>
        )}

        {/* Avatar + dropdown */}
        <div className='relative'>
          <div
            className='w-9 h-9 rounded-full flex items-center justify-center bg-gradient-to-br from-green-600 to-green-400 text-white text-base font-bold shadow-md cursor-pointer select-none'
            onClick={() => setShowInfo(prev => !prev)}
          >
            {avatarLetter}
          </div>

          {showInfo && (
            <div className='absolute right-0 top-[48px] w-[200px] bg-white shadow-2xl rounded-2xl p-4 flex flex-col gap-2 z-[9999] border border-green-100 scale-in'>
              <div className='text-[15px] font-semibold text-gray-800'>{userData?.fullName}</div>
              <div className='text-xs text-green-600 font-medium capitalize bg-green-50 px-2 py-0.5 rounded-full w-fit'>{userData?.role}</div>
              <hr className='border-green-100' />
              {userData?.role === "user" && (
                <button className='text-left text-sm text-gray-600 hover:text-green-700 font-medium' onClick={() => { navigate('/my-orders'); setShowInfo(false) }}>
                  My Orders
                </button>
              )}
              {userData?.role === "user" && (
                <button className='text-left text-sm text-gray-600 hover:text-green-700 font-medium' onClick={() => { navigate('/support'); setShowInfo(false) }}>
                  Contact Support
                </button>
              )}
              <button className='text-left text-sm text-red-500 font-semibold hover:text-red-700' onClick={handleLogOut}>
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Nav
