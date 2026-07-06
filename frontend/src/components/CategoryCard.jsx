import React from 'react'

function CategoryCard({ name, image, onClick, active }) {
  return (
    <div
      className={`w-[110px] h-[110px] md:w-[150px] md:h-[150px] rounded-2xl shrink-0 overflow-hidden shadow-md cursor-pointer transition-all duration-300 relative group ${active ? 'ring-2 ring-green-500 shadow-green-200 shadow-lg' : 'hover:shadow-lg border border-green-100'}`}
      onClick={onClick}
    >
      <img src={image} alt={name} className='w-full h-full object-cover group-hover:scale-110 transition-transform duration-300' />
      <div className={`absolute bottom-0 w-full px-2 py-1.5 text-center text-xs font-semibold backdrop-blur-sm ${active ? 'bg-green-600/90 text-white' : 'bg-white/90 text-gray-700'}`}>
        {name}
      </div>
    </div>
  )
}

export default CategoryCard
