import { ApiError } from "../utils/apiError.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import mongoose from "mongoose"

export const fieldNameType = asyncHandler(async (req,res,next)=>{
     let {id,to} = req.query
     const validTypes = ['video','comment','tweet']

        if(!id || !mongoose.Types.ObjectId.isValid(id)){
                throw new ApiError(400,"Invalid ID")
            }
        
            if(!to || !validTypes.includes(to)){
                throw new ApiError(400,"Invalid Type")
            }
        
        let search = {
            [to]:id,
            
        }

        req.search = search
        req.info = {id,to}

        next()
})
