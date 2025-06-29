import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Like} from "../models/like.model.js"


const toggleVideoLike  = asyncHandler(async (req,res)=>{       // verifyJWT middleware

    const {id} = req.params;

    if(!id || !mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(400,"Invalid ID")
    }

    const isLiked = await Like.findOne({
        video:id,
        likedBy:req.user._id
    })

    console.log("isLiked = ",isLiked)
    console.log("video = ",id)
    console.log("likedBy = ",req.user._id)

    let toggledLike,message;

    if(!isLiked){        // means user doesnt like this video so create like document

         toggledLike = await Like.create({
            video:id,
            likedBy:req.user._id
        })

        if(!toggledLike){
            throw new ApiError(500,"Server Error")
        }

        message = "Liked to this Video Successfully"


    }
    else{       // means user already liked this video so now remove like

      toggledLike = await Like.findByIdAndDelete(isLiked._id)

        if(!toggledLike){
            throw new ApiError(500,"Server Error")
        }

        message = "Removed Like from this Video Successfully"

    }

    return res
        .status(200)
        .json(
            new ApiResponse(200,toggledLike,message)
        )

})

const toggleCommentLike = asyncHandler(async (req,res)=>{      // verifyJWT middleware

    const {id} = req.params

    if(!id || !mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(400,"Invalid ID")
    }

    let toggledLike,message

    const isLiked = await Like.findOne({
        comment:id,
        likedBy:req.user._id
    })

    if(!isLiked){       // means user not liked this comment
        
        toggledLike = await Like.create({
            comment:id,
            likedBy:req.user._id
        })

        if(!toggledLike){
            throw new ApiError(500,"Server Error")
        }

        message = "Liked to this Comment Successfully"

    }
    else{       // means user already liked this comment

        toggledLike = await Like.findByIdAndDelete(isLiked._id)

        if(!toggledLike){
            throw new ApiError(500,"Server Error")
        }

        message = "Remove Like from this Comment Successfully"

    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,toggledLike,message)
            )

})

const toggleTweetLikes = asyncHandler(async (req,res)=>{        // verifyJWT middleware

    const {id} = req.params

    if(!id || !mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(400,"Invalid ID")
    }

    let toggledLike,message

    const isLiked = await Like.findOne({
        tweet:id,
        likedBy:req.user._id
    })

    if(!isLiked){       // means user not liked this tweet
        
        toggledLike = await Like.create({
            tweet:id,
            likedBy:req.user._id
        })

        if(!toggledLike){
            throw new ApiError(500,"Server Error")
        }

        message = "Liked to this Tweet Successfully"

    }
    else{       // means user already liked this tweet

        toggledLike = await Like.findByIdAndDelete(isLiked._id)

        if(!toggledLike){
            throw new ApiError(500,"Server Error")
        }

        message = "Remove Like from this Tweet Successfully"

    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,toggledLike,message)
            )


})

const getVideoLikesCount = asyncHandler(async (req,res)=>{           // verifyJWT middleware

    
    const likesOnly = Boolean(req.query.likesOnly) 
    const likesWithInfo = Boolean(req.query.likesWithInfo) 
    const id = req.query.id

    if(!id || !mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(400,"Invalid ID")
    }

    console.log(!!likesOnly,!!likesWithInfo,id)

    if(!(likesOnly || likesWithInfo)){
        throw new ApiError(400,"One field is Required")
    }

    if(likesOnly){
        
         const likesCount = await Like.countDocuments({
            video:id
         })

        let message = "Likes Count of this Video Fetched Successfully"

         if(likesCount===0){
            message = "There is no Likes on Video yet"
         }


         return res
            .status(200)
            .json(
                new ApiResponse(200,likesCount,message)
            )


    }

       const likedUsers = await Like.aggregate([
            {
                $match:{
                    video:new mongoose.Types.ObjectId(id),
                }
            },
            {
                $lookup:{
                    from:"users",
                    localField:"likedBy",
                    foreignField:"_id",
                    as:"likedBy",
                    pipeline:[
                        {
                            $project:{
                                username:1,
                                fullName:1,
                                avatar:1
                            }
                        }
                    ]
                }
            },
            {
                $unwind:"$likedBy"
            },
            {
                $replaceRoot:{
                    newRoot:"$likedBy"
                }
            }
            
        ])

        if(!likedUsers.length){
            throw new ApiError(500,"Server Error")
        }

    return res
            .status(200)
            .json(
                new ApiResponse(200,{
                    likedUsers,
                    likesCount:likedUsers.length

                },"Likes count with Users Info")
            )

    
})

const getCommentLikesCount = asyncHandler(async (req,res)=>{           // verifyJWT middleware

    
    const likesOnly = Boolean(req.query.likesOnly) 
    const likesWithInfo = Boolean(req.query.likesWithInfo) 
    const id = req.query.id

    if(!id || !mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(400,"Invalid ID")
    }

    console.log(!!likesOnly,!!likesWithInfo,id)

    if(!(likesOnly || likesWithInfo)){
        throw new ApiError(400,"One field is Required")
    }

    if(likesOnly){
        
         const likesCount = await Like.countDocuments({
            comment:id
         })

        let message = "Likes Count of this Comment Fetched Successfully"

         if(likesCount===0){
            message = "There is no Likes on Comment yet"
         }


         return res
            .status(200)
            .json(
                new ApiResponse(200,likesCount,message)
            )


    }

       const likedUsers = await Like.aggregate([
            {
                $match:{
                    comment:new mongoose.Types.ObjectId(id),
                }
            },
            {
                $lookup:{
                    from:"users",
                    localField:"likedBy",
                    foreignField:"_id",
                    as:"likedBy",
                    pipeline:[
                        {
                            $project:{
                                username:1,
                                fullName:1,
                                avatar:1
                            }
                        }
                    ]
                }
            },
            {
                $unwind:"$likedBy"
            },
            {
                $replaceRoot:{
                    newRoot:"$likedBy"
                }
            }
            
        ])

        if(!likedUsers.length){
            throw new ApiError(500,"Server Error")
        }

    return res
            .status(200)
            .json(
                new ApiResponse(200,{
                    likedUsers,
                    likesCount:likedUsers.length

                },"Likes count with Users Info")
            )

    
})

const getTweetLikesCount = asyncHandler(async (req,res)=>{           // verifyJWT middleware

    
    const likesOnly = Boolean(req.query.likesOnly) 
    const likesWithInfo = Boolean(req.query.likesWithInfo) 
    const id = req.query.id

    if(!id || !mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(400,"Invalid ID")
    }

    console.log(!!likesOnly,!!likesWithInfo,id)

    if(!(likesOnly || likesWithInfo)){
        throw new ApiError(400,"One field is Required")
    }

    if(likesOnly){
        
         const likesCount = await Like.countDocuments({
            tweet:id
         })

        let message = "Likes Count of this Tweet Fetched Successfully"

         if(likesCount===0){
            message = "There is no Likes on Tweet yet"
         }


         return res
            .status(200)
            .json(
                new ApiResponse(200,likesCount,message)
            )


    }

       const likedUsers = await Like.aggregate([
            {
                $match:{
                    tweet:new mongoose.Types.ObjectId(id),
                }
            },
            {
                $lookup:{
                    from:"users",
                    localField:"likedBy",
                    foreignField:"_id",
                    as:"likedBy",
                    pipeline:[
                        {
                            $project:{
                                username:1,
                                fullName:1,
                                avatar:1
                            }
                        }
                    ]
                }
            },
            {
                $unwind:"$likedBy"
            },
            {
                $replaceRoot:{
                    newRoot:"$likedBy"
                }
            }
            
        ])

        if(!likedUsers){
            throw new ApiError(500,"Server Error")
        }

    return res
            .status(200)
            .json(
                new ApiResponse(200,{
                    likedUsers,
                    likesCount:likedUsers.length

                },"Likes count with Users Info")
            )

    
})

const isLikedTo = asyncHandler(async (req,res)=>{       // verifyJWT , fieldNameType middlewares

    const search = {...req.search , likedBy:req.user._id}
    const isLiked = await Like.findOne(search)

    return res
            .status(200)
            .json(
                new ApiResponse(200,{
                    likedTo:req.info.to,
                    isLiked:isLiked && true || false
                },
                isLiked ? `You are Liked to this ${req.info.to}` : `You are not Liked this ${req.info.to} yet`
            ))
})

const clearAllLikes = asyncHandler(async (req,res)=>{
    
    const isCleared = await Like.deleteMany(req.search)

    if(!isCleared){
        throw new ApiError(500,"Server Error")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,isCleared,`All Likes of ${req.info.to} Cleared`)
            )
})


export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLikes,
    getVideoLikesCount,
    getCommentLikesCount,
    getTweetLikesCount,
    isLikedTo,
    clearAllLikes
}