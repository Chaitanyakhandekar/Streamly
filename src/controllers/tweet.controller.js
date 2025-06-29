import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Tweet } from "../models/tweet.model.js";


const createTweet = asyncHandler(async (req,res)=>{
    const {content} = req.body

    if(!content){
        throw new ApiError(400,"content is required field")   // bad request 
    }

    if(!content.trim().length){
        throw new ApiError(400,"Empty content is not allowed")
    }

    const newTweet = await Tweet.create({
        owner:req.user._id,
        content
    })

    if(!newTweet){
        throw new ApiError(500,"Internal Server Error")
    }

    return res
            .status(201)
            .json(
                new ApiResponse(201,newTweet,"Tweet created successfully")
            )
})

const updateTweet = asyncHandler(async (req,res)=>{
        const {id,content} = req.body;

        if(!id || !mongoose.Types.ObjectId.isValid(id)){  // incorrect id
            throw new ApiError(400,"Invalid Tweet ID")
        }

        if(!content || !content?.trim().length){            // missing field
            throw new ApiError(400,"Content field is required")
        }

        const updatedTweet = await Tweet.findByIdAndUpdate(
            id,
            {
                content:content.trim()
            },
            {
                new:true,
                runValidations:false
            }
        )

        if(!updatedTweet){
            throw new ApiError(500,"Internal Server Error")
        }

        return res
                .status(200)
                .json(
                    new ApiResponse(200,updatedTweet,"Tweet updated Successfully")
                )



})

const deleteTweet = asyncHandler(async (req,res)=>{
    const {id} = req.params;

    if(!id || !mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(400,"Invalid Tweet ID")
    }

    const tweet = await Tweet.findByIdAndDelete(id)

    if(!tweet){
        throw new ApiError(404,"Tweet not found!")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,null,"Tweet Deleted Successfully")
            )

})

const getTweetById = asyncHandler(async (req,res)=>{        
        const {id} = req.params;

        if(!id || !mongoose.Types.ObjectId.isValid(id) ){
            throw new ApiError(400,"Tweet Id is invalid")
        }

        const tweet = await Tweet.aggregate([
            {
                $match:{
                    _id:new mongoose.Types.ObjectId(id)
                }
            },
            {
                $lookup:{
                    from:"users",
                    localField:"owner",
                    foreignField:"_id",
                    as:"owner"
                }
            },
            {
                $addFields:{
                    owner:{
                        $first:"$owner"
                    }
                }
            },
            {
                $project:{
                    owner:{
                        username:1,
                        email:1,
                        fullName:1,
                        avatar:1
                    },
                    content:1
                }
            }
        
        ])

        if(!tweet){
            throw new ApiError(500,"Internal server Error")
        }

        return res
                .status(200)
                .json(
                    new ApiResponse(200,tweet[0],"Tweet fetched successfully")
                )
})

const getAllTweets = asyncHandler(async (req,res)=>{ 

        const page = Number(req.query.page) || 1 
        const limit = Number(req.query.limit) || 10
        const skip = (page - 1)*limit

        const totalTweets = await Tweet.countDocuments()

        const tweets = await Tweet.aggregate([
            {
                $sort:{createdAt:-1}
            },
            {
                $skip:skip
            },
            {
                $limit:limit
            },
            {
                $lookup:{
                    from:"users",
                    localField:"owner",
                    foreignField:"_id",
                    as:"owner"
                }
            },
            {
                $addFields:{
                    owner:{
                        $first:"$owner"
                    }
                }
            },
            {
                $project:{
                    owner:{
                        _id:1,
                        username:1,
                        email:1,
                        fullName:1,
                        avatar:1
                    },
                    content:1
                }
            }
           
        ])

        if(!tweets){
            throw new ApiError(404,"Twees not found")
        }

        return res
                .status(200)
                .json(
                    new ApiResponse(200,{
                        tweets,
                        page,
                        limit,
                        skip,
                        totalTweets,
                        totalPages:Math.ceil(totalTweets / limit),
                        hasMore:page * limit < totalTweets
                    }),
                    "Tweets fetched Successfully"
                )

})

const getUserTweets = asyncHandler(async (req,res)=>{

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    const totalUserTweets = await Tweet.countDocuments({
        owner:req.user._id
    })

    const userTweets = await Tweet.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $sort:{createdAt:-1}
        },
        {
            $skip:skip
        },
        {
            $limit:limit
        },
        {
            $project:{
                _id:1,
                content:1,
                createdAt:1,
                updatedAt:1
            }
        }
    ])

    if(!userTweets.length){
        throw new ApiError(404,"Tweets not found!")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,{
                    userTweets,
                    page:page,
                    limit:limit,
                    totalUserTweets,
                    totalPages:Math.ceil(totalUserTweets / limit),
                    hasMore: page * limit < totalUserTweets
                },
                "User Tweets fetched Successfully")
            )

})

export {
    createTweet,
    updateTweet,
    getTweetById,
    deleteTweet,
    getAllTweets,
    getUserTweets
}