import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {Subscription} from "../models/subscription.model.js"

const subscribeToUser = asyncHandler(async (req,res)=>{     // verifyJWT middleware

    const {channel} = req.params

    if(!channel || !mongoose.Types.ObjectId.isValid(channel)){
        throw new ApiError(400,"Channel is required")
    }

    if(req.user._id.toString() === channel){
        throw new ApiError(400,"You cannot subscribe to yuorself")
    }

    const alreadySubscribed = await Subscription.findOne({
        subscriber:req.user._id,
        channel
    })

    if(alreadySubscribed){
        throw new ApiError(400,"Already subscribed to this channel")
    }

    const subscription = await Subscription.create({
        subscriber:req.user._id,
        channel
    })


    if(!subscription){
        throw new ApiError(404,"Server error")
    }

    return res
            .status(201)
            .json(
                new ApiResponse(201,subscription,"subscribed to user successfully ")
            )

})

const unsubscribeFromUser = asyncHandler(async (req,res)=>{  // verifyJWT middleware
    
    const {channel} = req.params

    if(!channel || !mongoose.Types.ObjectId.isValid(channel) || channel === req.user._id.toString()){
        throw new ApiError(400,"Invalid Channel ID")
    }

    const requestedChannel = await Subscription.findOne({
        subscriber:req.user._id,
        channel
    })

    if(!requestedChannel){
        throw new ApiError(400,"You are not subscribed to this channel")
    }

    const isUnsubscribed = await Subscription.findByIdAndDelete(requestedChannel._id).select("-createdAt -updatedAt -__v")

    if(!isUnsubscribed){
        throw new ApiError(404,"Server Error")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,isUnsubscribed,"Channel Unsubscribed Successfully")
            )

})

const getUserSubscribers = asyncHandler(async (req,res)=>{      // verifyJWT middleware

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    const totalSubscribers = await Subscription.countDocuments({
        channel:req.user._id
    })

    const subscribers = await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(req.user._id)
            }
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
                localField:"subscriber",
                foreignField:"_id",
                as:"subscriber",
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
            $unwind:"$subscriber"
       },
       {
        $replaceRoot:{
            newRoot:"$subscriber"
        }
       }
        
    ])

    if(!subscribers){
        throw new ApiError(404,"Server Error")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,{
                    subscribers,
                    page,
                    limit,
                    totalSubscribers,
                    totalPages:Math.ceil(totalSubscribers / limit),
                    hasMore: page * limit < totalSubscribers
                },
                "Subscribers Fetched Successfully.")
            )

})

const getUserSubscriptions = asyncHandler(async (req,res)=>{    // verifyJWT middleware

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    const totalUserSubscriptions = await Subscription.countDocuments({
        subscriber:req.user._id
    })

    const userSubscriptions = await Subscription.aggregate([
        {
            $match:{
                subscriber:new mongoose.Types.ObjectId(req.user._id)
            }
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
                localField:"channel",
                foreignField:"_id",
                as:"channel",
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
            $unwind:"$channel"
        },
        {
            $replaceRoot:{
                newRoot:"$channel"
            }
        }
    ])

    if(!userSubscriptions){
        throw new ApiError(404,"Server Error")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,{
                    userSubscriptions,
                    page,
                    limit,
                    totalUserSubscriptions,
                    totalPages:Math.ceil(totalUserSubscriptions / limit),
                    hasMore: (page * limit) < totalUserSubscriptions
                },
                "Users Subscriptions Fetched Successfully")
            )

})

const isSubscribedToUser = asyncHandler(async (req,res)=>{      // verifyJWT middleware

    const {channel} = req.params

    if(!channel || !new mongoose.Types.ObjectId(channel) || req.user._id.toString() === channel){
        throw new ApiError(404,"Invalid User ID's")
    }

    const isSubscribed = await Subscription.findOne({
        subscriber:req.user._id,
        channel
    })

    return res
            .status(200)
            .json(
                new ApiResponse(200,{
                    isSubscribed:!!isSubscribed  // returns true Bollean instead of string
                },
                "Succefully fetched"
                )
            )

})

export{
    subscribeToUser,
    unsubscribeFromUser,
    getUserSubscribers,
    getUserSubscriptions,
    isSubscribedToUser,
}