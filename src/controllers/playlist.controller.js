import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {Playlist} from "../models/playlist.model.js"


const createPlaylist = asyncHandler(async (req,res)=>{      // verifyJWT middleware
    
        const {name,description} = req.body

        if(!(name && description)){
            throw new ApiError(400,"Name and Description are required Fields")
        }

        if(!name.trim() || !description.trim()){
            throw new ApiError(400,"Name and Description cannot be empty")
        }

        const playlist = await Playlist.create({
            name:name.trim(),
            description:description.trim(),
            owner:req.user._id
        })

        if(!playlist){
            throw new ApiError(500,"Server Error")
        }

        return res
                .status(201)
                .json(
                    new ApiResponse(201,playlist,"Playlist Created Successfully")
                )

})

const updatePlaylist = asyncHandler(async (req,res)=>{      // verifyJWT , validateOwnership middleware

    const {name,description,pid} = req.body

    if(!(name || description)){
        throw new ApiError(400,"Atleast One Field is Required for Update Playlist")
    }

    if((name && !name.trim()) || (description && !description.trim())){
        throw new ApiError(400,"Field Cannot be Empty")
    }

    const isExists = await Playlist.findById(pid)

    if(!isExists){
        throw new ApiError(400,"Playlist with given ID doesnt Exists")
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        pid,
        {
            $set:{
                name:name.trim() || isExists.name,
                description:description.trim() || isExists.description
            }
        },
        {
            new:true
        }
    )

    if(!updatedPlaylist){
        throw new ApiError(500,"Server Error")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,updatedPlaylist,"Playlist Updated Successfully")
            )

})

const addVideoToPlaylist = asyncHandler(async (req,res)=>{     // verifyJWT , validateOwnership middlewre

    const video = req.body.video

    if(!video || !mongoose.Types.ObjectId.isValid(video)){
        throw new ApiError(400,"Invalid ID")
    }

    const isExists = await Playlist.findById(req.info.pid)

    if(!isExists){
        throw new ApiError(400,"This Playlist Doesn't Exists")
    }

    if(isExists.videos.some(v => v.toString() === video)){
        throw new ApiError(400,"Video is Already Present in this Playlist")
     }

    const addedVideo = await Playlist.findByIdAndUpdate(
        req.info.pid,
        {
            $addToSet:{
                videos:video
            }
        },
        {
            new:true
        }
    )

    if(!addedVideo){
        throw new ApiError(500,"Server Error")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,addedVideo,"Video Added to Playlist Successfully")
            )

})

const removeVideoFromPlaylist = asyncHandler(async (req,res)=>{     // verifyJWT , validateOwnership middlewre

    const {pid,vid} = req.info

    if(!vid || !mongoose.Types.ObjectId.isValid(vid)){
        throw new ApiError(400,"Invalid ID")
    }

    const isExistsPlaylist = await Playlist.findById(pid)

    if(!isExistsPlaylist){
        throw new ApiError(400,"Playlist with given ID doesnt Exists")
    }

    if(!isExistsPlaylist.videos.some(v => v.toString() === vid)){
        throw new ApiError(400,"Video with This ID doesnt Exists in This Playlist")
    }

    const removedVideo = await Playlist.findByIdAndUpdate(
        pid,
        {
            $pull:{
                videos:vid
            }
        },
        {
            new:true
        }
    )

    if(!removedVideo){
        throw new ApiError(500,"Server Error")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,removedVideo,"Video removed from Playlist Successfully")
            )

})

const deletePlaylist = asyncHandler(async (req,res)=>{      // verifyJWT , validateOwnership middlewre

    const isExists = await Playlist.findById(req.info.pid)

    if(!isExists){
        throw new ApiError(400,"Playlist Doesnt Exists")
    }

    const deletedPlaylist = await Playlist.findByIdAndDelete(req.info.pid)

    if(!deletedPlaylist){
        throw new ApiError(500,"Server Error")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,deletedPlaylist,"Playlist Deleted Successfully")
            )

})

const getUserPlaylists = asyncHandler(async (req,res)=>{        // verifyJWT middleware

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 5
    const skip = (page - 1) * limit

    const totalUserPlaylists = await Playlist.countDocuments({
        owner:req.user._id
    })

    if(totalUserPlaylists===0){
        return res
                .status(200)
                .json(
                    new ApiResponse(200,null,"You Havent Created Playlists")
                ) 
    }

    const userPlaylists = await Playlist.aggregate([
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
                name:1,
                description:1,
                totalVideos:{
                    $size:"$videos"
                },
                createdAt:1,
                updatedAt:1
            }
        }    
       
    ])

    if(!userPlaylists.length){
        throw new ApiError(500,"Server Error")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,{
                    
                    userPlaylists,
                    page,
                    limit,
                    totalUserPlaylists,
                    totalPages:Math.ceil(totalUserPlaylists / limit),
                    hasMore: page * limit < totalUserPlaylists
                },
                "Successfully Fetched User Playlists")
            )

})

const getVideosInPlaylist = asyncHandler(async (req,res)=>{     // verifyJWT , validateOwnerShip middleware

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    const totalVideos = await Playlist.findById(req.info.pid)

    if(!totalVideos){
        throw new ApiError(400,"Playlist Doesnt Exists")
    }

    if(totalVideos.videos.length===0){
        return res
                .status(200)
                .json(
                    new ApiResponse(200,null,"No Videos in this Playlist")
                )
    }

    const videos = await Playlist.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(req.info.pid)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videos",
                pipeline:[
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
                        $unwind:"$owner"
                    },
                    {
                        $project:{
                            videoUrl:1,
                            thumbnail:1,
                            title:1,
                            description:1,
                            duration:1,
                            views:1,
                            owner:{
                                _id:1,
                                username:1,
                                fullName:1,
                                avatar:1
                            }
                        }
                    }
                ]
            }
        },
        {
            $project:{
                videos:"$videos"
            }
        },
  
    ])

    if(!videos.length){
        throw new ApiError(500,"Server Error")
    }

     return res
                .status(200)
                .json(
                    new ApiResponse(200,{

                        videos:videos[0].videos,
                        page,
                        limit,
                        totalVideos:totalVideos.videos.length,
                        totalPages:Math.ceil(totalVideos.videos.length / limit),
                        hasMore: page * limit < totalVideos.videos.length

                    },
                    "Videos in Playlist Fetched Successfully")
                )

})

export {
    createPlaylist,
    updatePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    getUserPlaylists,
    getVideosInPlaylist
}