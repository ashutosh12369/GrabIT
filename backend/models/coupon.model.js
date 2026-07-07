import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage'
    },
    value: {
        type: Number,
        required: true // e.g. 10 for 10%, or 50 for ₹50 off
    },
    minOrderAmount: {
        type: Number,
        default: 0
    },
    validUntil: {
        type: Date,
        required: true
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop" // if null, it's a global platform coupon
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

const Coupon = mongoose.model("Coupon", couponSchema);
export default Coupon;
