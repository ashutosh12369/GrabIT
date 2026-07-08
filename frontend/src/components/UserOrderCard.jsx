import axios from 'axios'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { serverUrl } from '../App'
import { useDispatch } from 'react-redux'
import { addToCart } from '../redux/userSlice'
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function UserOrderCard({ data }) {
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [selectedRating, setSelectedRating] = useState({})//itemId:rating

    const handleReorder = () => {
        data.shopOrders.forEach(shopOrder => {
            shopOrder.shopOrderItems.forEach(orderItem => {
                const cartItem = {
                    id: orderItem.item._id,
                    name: orderItem.name,
                    price: orderItem.price,
                    quantity: orderItem.quantity,
                    image: orderItem.item.image,
                    shop: shopOrder.shop._id
                };
                dispatch(addToCart(cartItem));
            });
        });
        navigate("/checkout");
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleString('en-GB', {
            day: "2-digit",
            month: "short",
            year: "numeric"
        })

    }

    const handleRating = async (itemId, rating) => {
        try {
            const result = await axios.post(`${serverUrl}/api/item/rating`, { itemId, rating }, { withCredentials: true })
            setSelectedRating(prev => ({
                ...prev, [itemId]: rating
            }))
        } catch (error) {
            console.log(error)
        }
    }

    const handleDownloadReceipt = () => {
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.setTextColor(255, 77, 45); // GrabIT Orange
        doc.text("GrabIT - Order Receipt", 14, 22);
        
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Order ID: ${data._id}`, 14, 32);
        doc.text(`Date: ${formatDate(data.createdAt)}`, 14, 38);
        doc.text(`Payment: ${data.paymentMethod.toUpperCase()}`, 14, 44);
        doc.text(`Delivery Address: ${data.deliveryAddress?.text?.substring(0, 50)}...`, 14, 50);

        let startY = 60;
        
        data.shopOrders.forEach(shopOrder => {
            doc.setFontSize(14);
            doc.setTextColor(0);
            doc.text(`Shop: ${shopOrder.shop.name}`, 14, startY);
            startY += 8;

            const tableData = shopOrder.shopOrderItems.map(item => [
                item.name,
                item.quantity.toString(),
                `Rs. ${item.price}`,
                `Rs. ${item.price * item.quantity}`
            ]);

            doc.autoTable({
                startY: startY,
                head: [['Item', 'Qty', 'Price', 'Total']],
                body: tableData,
                theme: 'striped',
                headStyles: { fillColor: [255, 77, 45] }
            });

            startY = doc.lastAutoTable.finalY + 15;
        });

        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text(`Grand Total: Rs. ${data.totalAmount}`, 14, startY);

        doc.save(`GrabIT_Receipt_${data._id.substring(0, 6)}.pdf`);
    };


    return (
        <div className='grabit-card p-4 space-y-4'>
            <div className='flex justify-between border-b pb-2'>
                <div>
                    <p className='font-semibold'>
                        order #{data._id.slice(-6)}
                    </p>
                    <p className='text-sm text-gray-500'>
                        Date: {formatDate(data.createdAt)}
                    </p>
                </div>
                <div className='text-right'>
                    {data.paymentMethod == "cod" ? <p className='text-sm text-gray-500'>{data.paymentMethod?.toUpperCase()}</p> : <p className='text-sm text-gray-500 font-semibold'>Payment: {data.payment ? "true" : "false"}</p>}

                    <p className='font-medium text-blue-600'>{data.shopOrders?.[0].status}</p>
                </div>
            </div>

            {data?.notes && (
                <div className='mt-1 p-2 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm'>
                    <span className='font-bold'>Notes:</span> {data.notes}
                </div>
            )}

            {data.shopOrders.map((shopOrder, index) => (
                <div className='border rounded-lg p-3 bg-gray-50 space-y-3' key={index}>
                    <p>{shopOrder.shop.name}</p>

                    <div className='flex space-x-4 overflow-x-auto pb-2'>
                        {shopOrder.shopOrderItems.map((item, index) => (
                            <div key={index} className='flex-shrink-0 w-40 border rounded-lg p-2 bg-white'>
                                <img src={item.item.image} alt="" className='w-full h-24 object-cover rounded' />
                                <p className='text-sm font-semibold mt-1'>{item.name}</p>
                                <p className='text-xs text-gray-500'>Qty: {item.quantity} x ₹{item.price}</p>

                                {shopOrder.status == "delivered" && <div className='flex space-x-1 mt-2'>
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button className={`text-lg ${selectedRating[item.item._id] >= star ? 'text-yellow-400' : 'text-gray-400'}`} onClick={() => handleRating(item.item._id,star)}>★</button>
                                    ))}
                                </div>}



                            </div>
                        ))}
                    </div>
                    <div className='flex justify-between items-center border-t pt-2'>
                        <p className='font-semibold'>Subtotal: {shopOrder.subtotal}</p>
                        <span className='text-sm font-medium text-blue-600'>{shopOrder.status}</span>
                    </div>
                </div>
            ))}

            <div className='flex justify-between items-center border-t pt-2 mt-4'>
                <p className='font-semibold'>Total: ₹{data.totalAmount}</p>
                <div className='flex gap-2 flex-wrap justify-end'>
                    <button className='border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg text-sm' onClick={handleDownloadReceipt}>Receipt (PDF)</button>
                    <button className='btn-outline px-4 py-2 text-sm' onClick={() => handleReorder()}>Reorder</button>
                    <button className='btn-primary px-4 py-2 text-sm' onClick={() => navigate(`/track-order/${data._id}`)}>Track Order</button>
                </div>
            </div>



        </div>
    )
}

export default UserOrderCard
