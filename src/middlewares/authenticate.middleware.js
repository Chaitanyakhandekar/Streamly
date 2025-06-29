import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async (req,res,next)=>{

    const accessToken = req.cookies?.accessToken || req.header("Authorization").replace("Bearer ","")

    if(!accessToken){
        throw new ApiError(401,"Unauthorized Request")
    } 

    let decodedToken;

    try {
         decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
    } catch (error) {
        throw new ApiError(401,"invalid or expired Access token")
    }

    const user = await User.findById(decodedToken._id).select("-password -refreshToken")

    if(!user){
        throw new ApiError(401,"Invalid Access Token")
    }

    req.user = user
    next()
})