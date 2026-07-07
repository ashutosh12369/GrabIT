import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setCurrentCity, setCurrentState, setCurrentAddress } from '../redux/userSlice';
import { setLocation, setAddress } from '../redux/mapSlice';
import { serverUrl } from '../App';
import { RxCross2 } from "react-icons/rx";
import { FaLocationDot } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { ClipLoader } from "react-spinners";

function LocationModal({ onClose }) {
    const [searchQuery, setSearchQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();
    const apiKey = import.meta.env.VITE_GEOAPIKEY;

    const handleSearch = async () => {
        if (!searchQuery) return;
        setLoading(true);
        try {
            const res = await axios.get(`https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(searchQuery)}&format=json&apiKey=${apiKey}`);
            setResults(res.data.results || []);
        } catch (error) {
            console.log("Error searching location", error);
        }
        setLoading(false);
    };

    const handleSelectLocation = (result) => {
        const latitude = result.lat;
        const longitude = result.lon;
        
        dispatch(setLocation({ lat: latitude, lon: longitude }));
        dispatch(setCurrentCity(result.city || result.county || result.state));
        dispatch(setCurrentState(result.state));
        dispatch(setCurrentAddress(result.address_line2 || result.address_line1));
        dispatch(setAddress(result.address_line2 || result.address_line1));

        onClose();
    };

    return (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-[99999] p-4 fade-in'>
            <div className='bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl slide-up flex flex-col max-h-[80vh]'>
                <div className='p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50'>
                    <h2 className='text-lg font-bold text-gray-800 flex items-center gap-2'>
                        <FaLocationDot className='text-[#ff4d2d]' /> Change Location
                    </h2>
                    <button className='text-gray-400 hover:text-gray-600 cursor-pointer' onClick={onClose}>
                        <RxCross2 size={24} />
                    </button>
                </div>
                
                <div className='p-4'>
                    <div className='flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2 focus-within:border-[#ff4d2d] focus-within:ring-1 focus-within:ring-[#ff4d2d]'>
                        <IoIosSearch size={20} className='text-gray-400' />
                        <input 
                            type="text" 
                            className='w-full outline-none text-gray-700' 
                            placeholder='Search for area, street name...' 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button 
                            className='bg-[#ff4d2d] text-white px-3 py-1 rounded-lg text-sm font-semibold hover:bg-orange-600 transition'
                            onClick={handleSearch}
                            disabled={loading}
                        >
                            {loading ? <ClipLoader size={14} color="white" /> : "Search"}
                        </button>
                    </div>
                </div>

                <div className='flex-1 overflow-y-auto bg-gray-50 p-2'>
                    {results.length > 0 ? (
                        <div className='flex flex-col gap-2'>
                            {results.map((result, idx) => (
                                <div 
                                    key={idx} 
                                    className='bg-white p-3 rounded-xl border border-gray-100 cursor-pointer hover:border-[#ff4d2d] hover:shadow-md transition group flex gap-3 items-center'
                                    onClick={() => handleSelectLocation(result)}
                                >
                                    <div className='w-10 h-10 bg-orange-50 rounded-full flex items-center justify-center group-hover:bg-[#ff4d2d] transition'>
                                        <FaLocationDot className='text-[#ff4d2d] group-hover:text-white transition' />
                                    </div>
                                    <div>
                                        <p className='font-semibold text-gray-800'>{result.address_line1}</p>
                                        <p className='text-sm text-gray-500'>{result.address_line2}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className='text-center py-10 text-gray-400'>
                            <FaLocationDot size={32} className='mx-auto mb-3 opacity-20' />
                            <p>Search for a location to explore restaurants</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default LocationModal;
