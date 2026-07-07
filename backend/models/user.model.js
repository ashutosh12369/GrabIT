import mongoose from "mongoose";


const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique:true
    },
    password:{
        type: String,
    },
    mobile:{
        type: String,
        required: true, 
    },
    role:{
        type:String,
        enum:["user","owner","deliveryBoy","admin","supportAgent"],
        required:true
    },
    isBanned:{
        type:Boolean,
        default:false
    },
    resetOtp:{
        type:String
    },
    isOtpVerified:{
        type:Boolean,
        default:false
    },
    otpExpires:{
        type:Date
    },
    socketId:{
     type:String,
     
    },
    isOnline:{
        type:Boolean,
        default:false
    },
   location:{
type:{type:String,enum:['Point'],default:'Point'},
coordinates:{type:[Number],default:[0,0]}
   },
   profilePicture:{
       type:String,
       default:""
   },
   savedAddresses:[{
       label:{type:String, required:true},
       address:{type:String, required:true},
       city:{type:String},
       state:{type:String},
       coordinates:{type:[Number], default:[0,0]}
   }],
   favorites:[{
       type:mongoose.Schema.Types.ObjectId,
       ref:"Shop"
   }],
   referralCode: {
       type: String,
       unique: true,
       sparse: true
   },
   walletBalance: {
       type: Number,
       default: 0
   }
  
}, { timestamps: true })

userSchema.index({location:'2dsphere'})


const User=mongoose.model("User",userSchema)
export default User