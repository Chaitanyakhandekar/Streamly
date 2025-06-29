import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.model.js";
import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";

export const validateOwnership = asyncHandler(async (req,res,next)=>{

    const pid = req.body?.pid || req.query?.pid || req.params?.pid
    const vid = req.query?.vid || null

    if(!pid || !mongoose.Types.ObjectId.isValid(pid)){
        throw new ApiError(400,"Invalid ID")
    }

    const isOwner = await Playlist.findOne({
        _id:pid,
        owner:req.user._id
    })

    if(!isOwner){
        throw new ApiError(400,"Current User is not Authorized for this Request")
    }

    req.info = {
        pid,
        vid
    }

    next()

    
})