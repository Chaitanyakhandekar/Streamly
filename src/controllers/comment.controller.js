import mongoose from "mongoose";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";


const addComment = asyncHandler(async (req, res) => {       // verifyJWT middleware used

    const { content, video } = req.body

    if (!(content && video)) {
        throw new ApiError(400, "All fields are Required")
    }

    if (content.trim() === "") {
        throw new ApiError(400, "Content should not be Empty")
    }

    if (!mongoose.Types.ObjectId.isValid(video) || !mongoose.Types.ObjectId.isValid(req.user._id)) {
        throw new ApiError(400, "Invalid Video or Owner ID's")
    }

    const comment = await Comment.create({
        content: content.trim(),
        video,
        owner: req.user._id
    })

    if (!comment) {
        throw new ApiError(500, "Server Error")
    }

    return res
        .status(201)
        .json(
            new ApiResponse(201, comment, "Comment Added Successfully")
        )

})

const getCommentsOnVideo = asyncHandler(async (req, res) => {      // verifyJWT middleware

    const id = req.query.id
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid ID")
    }

    const totalComments = await Comment.countDocuments({
        video: id
    })

    if (totalComments === 0) {
        return res.status(200).json(
            new ApiResponse(200, {
                comments: [],
                page,
                limit,
                totalComments: 0,
                totalPages: 0,
                hasMore: false,
            }, "No comments on this video yet.")
        );
    }

    const comments = await Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(id)
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $skip: skip
        },
        {
            $limit: limit
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            avatar: 1,
                            fullName: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$owner"
        },
        {
            $project: {
                __v: 0
            }
        }

    ])

    if (!comments.length) {
        throw new ApiError(500, "Server Error")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {
                comments,
                page,
                limit,
                totalComments,
                totalPages: Math.ceil(totalComments / limit),
                hasMore: page * limit < totalComments
            })
        )

})

const deleteComment = asyncHandler(async (req, res) => {       // verifyJWT middleware

    const { id } = req.params

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid ID")
    }

    const comment = await Comment.findById(id)

    if (!comment) {
        throw new ApiError(400, "Comment with this id doesnt exists")
    }

    const video = await Video.findById(comment.video)

    if (!video) {
        throw new ApiError(400, "Video doesnt exists")
    }

    if (comment.owner.toString() !== req.user._id.toString() && video.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(400, "You are not Authorized for this Request")
    }

    const deletedComment = await Comment.findByIdAndDelete(id)

    if (!deletedComment) {
        throw new ApiError(500, "Server Error")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, deletedComment, "Comment Deleted Successfully")
        )

})

const updateComment = asyncHandler(async (req, res) => {      // verifyJWT middleware

    const { id, content } = req.body

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid ID")
    }

    const comment = await Comment.findById(id)

    if (!comment) {
        throw new ApiError(400, "Comment doesnt exists")
    }

    if (comment.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(400, "You are not Authorized for this Request")
    }

    if (!content || content.trim() === "") {
        throw new ApiError(400, "Content is Required")
    }

    const updatedComment = await Comment.findByIdAndUpdate(id, {
        $set: {
            content: content.trim()
        }
    },
        {
            new:true
        })

    if(!updatedComment){
        throw new ApiError(500,"Server Error")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,updatedComment,"Comment Updated Successfully")
            )


})

const deleteCommentsOnVideo = asyncHandler(async (req, res) => {        // verifyJWT middleware

    const {id} = req.params

    if(!id || !mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(400,"Invalid ID")
    }

    const video = await Video.findById(id)

    if(!video){
        throw new ApiError(400,"Video with this Id doesnt exists")
    }

    if(video.owner.toString() !== req.user._id.toString()){
        throw new ApiError(400,"You are noy Authorized for this Request")
    }

    const deletedComments = await Comment.deleteMany({
        video:id
    })

    console.log(deletedComments)

    if(!deletedComments){
        throw new ApiError(500,"Server Error")
    }

    return res
            .status(200)
            .json(
                new ApiResponse(200,deletedComments,"Comments on this Video Deleted Successfully")
            )

})

export {
    addComment,
    getCommentsOnVideo,
    deleteComment,
    updateComment,
    deleteCommentsOnVideo
}