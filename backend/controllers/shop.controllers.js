import Shop from "../models/shop.model.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

export const createEditShop=async (req,res) => {
    try {
       const {name,city,state,address, minOrderAmount, lat, lng}=req.body
       let image;
       if(req.file){
        console.log(req.file)
        try {
            image=await uploadOnCloudinary(req.file.path)
        } catch(err) {
            console.log("Cloudinary upload failed, using fallback image:", err.message)
            image = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        }
       } else {
           image = "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
       }
       
       const locationData = {
           type: "Point",
           coordinates: [Number(lng) || 0, Number(lat) || 0]
       };

       let shop=await Shop.findOne({owner:req.userId})
       if(!shop){
        shop=await Shop.create({
        name,city,state,address,image,owner:req.userId, minOrderAmount: minOrderAmount || 0, location: locationData
       })
       }else{
         shop=await Shop.findByIdAndUpdate(shop._id,{
        name,city,state,address,image,owner:req.userId, minOrderAmount: minOrderAmount || 0, location: locationData
       },{new:true})
       }
      
       await shop.populate("owner items")
       return res.status(201).json(shop)
    } catch (error) {
        return res.status(500).json({message:`create shop error ${error}`})
    }
}

export const getMyShop=async (req,res) => {
    try {
        const shop=await Shop.findOne({owner:req.userId}).populate("owner").populate({
            path:"items",
            options:{sort:{updatedAt:-1}}
        })
        if(!shop){
            return null
        }
        return res.status(200).json(shop)
    } catch (error) {
        return res.status(500).json({message:`get my shop error ${error}`})
    }
}

export const getShopByCity=async (req,res) => {
    try {
        const {city}=req.params
        const { search, cuisine, sort } = req.query

        let shops=await Shop.find({
            city:{$regex:new RegExp(`^${city}$`, "i")},
            isApproved: true,
            isActive: true
        }).populate('items')
        
        if(!shops){
            return res.status(400).json({message:"shops not found"})
        }

        // Add calculated fields for each shop (average rating, average price, cuisines)
        let enrichedShops = shops.map(shop => {
            const items = shop.items || []
            
            // Calculate average rating across all items
            let totalRating = 0
            let ratingCount = 0
            items.forEach(item => {
                if(item.rating && item.rating.average > 0) {
                    totalRating += item.rating.average
                    ratingCount++
                }
            })
            const avgRating = ratingCount > 0 ? totalRating / ratingCount : 0

            // Calculate average price across all items
            const avgPrice = items.length > 0 ? items.reduce((sum, item) => sum + item.price, 0) / items.length : 0

            // Get unique cuisines
            const cuisines = [...new Set(items.map(item => item.category))]

            return {
                ...shop.toObject(),
                avgRating,
                avgPrice,
                cuisines
            }
        })

        // Apply Search
        if (search) {
            const searchRegex = new RegExp(search, "i")
            enrichedShops = enrichedShops.filter(shop => searchRegex.test(shop.name))
        }

        // Apply Cuisine Filter
        if (cuisine && cuisine !== "All") {
            enrichedShops = enrichedShops.filter(shop => shop.cuisines.includes(cuisine))
        }

        // Apply Sorting
        if (sort === "rating") {
            enrichedShops.sort((a, b) => b.avgRating - a.avgRating)
        } else if (sort === "priceLow") {
            enrichedShops.sort((a, b) => a.avgPrice - b.avgPrice)
        } else if (sort === "priceHigh") {
            enrichedShops.sort((a, b) => b.avgPrice - a.avgPrice)
        }

        return res.status(200).json(enrichedShops)
    } catch (error) {
        return res.status(500).json({message:`get shop by city error ${error}`})
    }
}