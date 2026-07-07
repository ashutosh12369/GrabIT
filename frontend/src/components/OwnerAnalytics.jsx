import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { serverUrl } from '../App';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { FaMoneyBillWave, FaChartLine } from 'react-icons/fa';

function OwnerAnalytics() {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await axios.get(`${serverUrl}/api/order/analytics`, { withCredentials: true });
                setAnalytics(res.data);
            } catch (error) {
                console.log("Error fetching analytics", error);
            }
            setLoading(false);
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading Analytics...</div>;
    if (!analytics) return <div className="p-8 text-center text-gray-500">No data available</div>;

    return (
        <div className='w-full max-w-4xl bg-white shadow-lg rounded-2xl p-6 border border-gray-100 mt-6 slide-up'>
            <h2 className='text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2'>
                <FaChartLine className='text-[#16a34a]' /> Business Analytics
            </h2>

            <div className='flex gap-4 mb-8'>
                <div className='flex-1 bg-green-50 p-6 rounded-xl border border-green-100 shadow-sm'>
                    <p className='text-green-600 font-semibold mb-1'>Total Revenue</p>
                    <p className='text-3xl font-black text-green-800'>₹{analytics.totalRevenue}</p>
                </div>
                <div className='flex-1 bg-blue-50 p-6 rounded-xl border border-blue-100 shadow-sm'>
                    <p className='text-blue-600 font-semibold mb-1'>Total Orders</p>
                    <p className='text-3xl font-black text-blue-800'>{analytics.totalOrders}</p>
                </div>
            </div>

            {analytics.peakHours && analytics.peakHours.length > 0 && (
                <div className='mt-8'>
                    <h3 className='text-lg font-bold text-gray-700 mb-4'>Orders by Hour (Peak Times)</h3>
                    <div className='w-full h-72'>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.peakHours}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="hour" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" allowDecimals={false} />
                                <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="orders" fill="#16a34a" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}

export default OwnerAnalytics;
