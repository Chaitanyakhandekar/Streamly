import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadFileOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js"
import { ApiError } from "../utils/apiError.js";
import { Video } from "../models/video.model.js";
import { deleteFileFromCloudinary } from "../utils/cloudinary.js";


const uploadVideo = asyncHandler(async (req, res) => {     // verifyJWT ,multer middleware

    const {title,description} = req.body

    if(!req.file){
        throw new ApiError(400,"Video File is required")
    }

    if(!(title && description)){
        throw new ApiError(400,"Title and Description are required Fields")
    }

    const cloudResult = await uploadFileOnCloudinary(req.file.path, "video")
    console.log(cloudResult)

    if(!cloudResult){
        throw new ApiError(404,"Error while uploading video")
    }

    let thumbnailUrl = cloudResult.secure_url
                                .replace("/video/upload" , "/video/upload/so_1")
                                .split(".")
    thumbnailUrl[thumbnailUrl.length - 1] = "jpg"
    thumbnailUrl=thumbnailUrl.join(".")     

    
    const newVideo = await Video.create({
        videoUrl:cloudResult.secure_url,
        thumbnail:thumbnailUrl,
        title,
        description,
        duration:cloudResult.duration,
        isPublished:true,
        owner:req.user._id,
        publicId:cloudResult.public_id
    })

    if(!newVideo){
        throw new ApiError(404,"Server Error")
    }
                                

    return res
        .status(201)
        .json(
            new ApiResponse(201, {
                newVideo,
                public_id: cloudResult.public_id,
                playbackUrl: cloudResult.playback_url,
                width: cloudResult.width,
                height: cloudResult.height,
                format: cloudResult.format,
                frameRate: cloudResult.frame_rate,
                rotation: cloudResult.rotation,
                uploadedAt: cloudResult.created_at,
                audio: cloudResult.audio,        // Optional: only if needed
                video: cloudResult.video         // Optional: only if needed
            }, "Video uploaded successfully")
        )
})

const getAllVideos = asyncHandler(async (req,res)=>{        // verifyJWT middleware

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    const totalVideos = await Video.countDocuments();

    const videos = await Video.aggregate([
        {
            $sort:{
                createdAt:-1
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
                localField:"owner",
                foreignField:"_id",
                as:"owner",
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
            $unwind:"$owner"
        }
        
    ])

    if(!videos){
        throw new ApiError(404,"Server Error")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,{
                    videos,
                    page,
                    limit,
                    totalVideos,
                    totalPages:Math.ceil(totalVideos / limit),
                    hasMore:page * limit < totalVideos
                },
                "Videos Fetched Successfully")
            )

})

const getVideoById = asyncHandler(async (req,res)=>{        // verifyJWT middleware
    
    const {id} = req.params

    if(!id || !mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(400,"Invalid ID")
    }

    const video = await Video.aggregate([
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
                as:"owner",
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
            $unwind:"$owner"
        },
        {
            $project:{
                __v:0
            }
        }
    ])

    if(!video.length){
        throw new ApiError(500,"Video doesnt Exist")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,video[0],"Video Fetched Successfully")
            )

})

const updateVideo = asyncHandler(async (req,res)=>{         // verifyJWT middleware

    const {id ,title , description} = req.body

    if(!id || !mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(400,"Invalid ID")
    }

    const video = await Video.findById(id)

    if(!video){
        throw new ApiError(400,"Video not found")
    }

    if(req.user._id.toString() !== video.owner.toString()){
        throw new ApiError(401,"unauthorized request")
    }

    if(!(title || description)){
        throw new ApiError(400,"Atleast one field is required for updation")
    }

    const updatedVideo = await Video.findByIdAndUpdate(id,
        {
            $set:{
                title:title?.trim() || video.title,
                description:description?.trim() || video.description
            }
        },
        {
            new:true
        }
    ).select("-__v")

    if(!updatedVideo){
        throw new ApiError(500,"Server Error")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,updatedVideo,"Video Updated Successfully")
            )

})

const deleteVideo = asyncHandler(async (req,res)=>{         // verifyJWT middleware

    const {id} = req.params

    if(!id || !mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(400,"Invalid ID")
    }

    const video = await Video.findById(id)

    if(!video){
        throw new ApiError(400,"Video with this ID doesnt exists")
    }

    if(req.user._id.toString() !== video.owner.toString()){
        throw new ApiError(401,"You are not Authorized for this Request")
    }

    const isDeletedFromCloudinary = await deleteFileFromCloudinary(video.publicId,"video")

    const deletedVideo = await Video.findByIdAndDelete(id)

    if(!deletedVideo){
        throw new ApiError(500,"Server Error")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,{
                    deletedVideo,
                    isDeletedFromCloudinary:isDeletedFromCloudinary ? true : false
                },
                "Video Deleted Successfully")
            )
    
})

export {
    uploadVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo
}