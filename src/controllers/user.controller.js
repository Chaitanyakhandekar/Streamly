import {asyncHandler} from '../utils/asyncHandler.js'

import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import { User } from '../models/user.model.js'
import {uploadFileOnCloudinary} from '../utils/cloudinary.js'
import {generateAccessAndRefreshToken} from "../utils/generateARTokens.js"
import jwt from "jsonwebtoken"
import { cookieOptions } from '../constants.js'
import mongoose from 'mongoose'

const registerUser = asyncHandler(async (req,res)=>{

                     // Algorithm
                     // get user info from request
                     // validate user info
                     // check if user already exists
                     // check for cover image and avatar
                     // upload them to multer (middleware)
                     // upload them to cloudinary
                     // create user object  - create user entry in DB
                     // remove password and refreshtoken field from response
                     // check if user is created 
                     // return response

   const {username,email,password,fullName} = req.body      // step 1
   console.log("userInfo = ",req.body)


   if(                                                      // step 2
      [username,email,password,fullName].some((field)=>field.trim() === "")
   ){
         throw new ApiError(400,"All fields are required...!")
   }

   const userExisted = await User.findOne(   // returns first occurence of given data     //! step 3
   {
       $or:[{email},{username}]    // if email is not find then it searches for username
   }
   )
   if(userExisted){
      throw new ApiError(409,"User with given data already exists ")
   }
   else{
      console.log("User with given data not exists ")

   }
   
   console.log(req.files)
   const avatarLocalPath = req.files?.avatar[0]?.path;
   const coverImageLocalPath = Array.isArray(req.files?.coverImage) ? req.files.coverImage[0].path : "";
   console.log(avatarLocalPath)
   console.log(coverImageLocalPath)

   if(!avatarLocalPath){
      throw new ApiError(400,"Avatar Image is required")
   }
   let coverImage;
   const avatar = await uploadFileOnCloudinary(avatarLocalPath)            // step 5
   if(coverImageLocalPath){
    coverImage = await uploadFileOnCloudinary(coverImageLocalPath);
   }
   const newUser = await User.create({                      // step 6
      username,
      email,
      fullName,
      password,
      avatar:avatar.url,
      coverImage:coverImage ? coverImage.url : ""
   })


   const createdUser = await User.findById(newUser._id).select("-password -refreshToken")
   
   if(!createdUser){
      throw new ApiError(500,"Something went Wrong!...")
   }

   return res.status(201)
             .json(
      new ApiResponse(201,createdUser,"User created Succesfully.")
   )


})

const loginUser = asyncHandler(async (req,res)=>{
   // ALGORITHM : {  
   // req.body -> data
   // validate data
   // check user exists in database with username or email
   // if not exists then throw error
   // if exists then check password 
   // generate accessToken and refreshToken 
   // store refreshToken in database
   // send accessToken in httpOnly and secure cookie  or (in response body if using mobile application)
   // send success message or response}


   const {email,username,password} = req.body

   if(!username && !email){
      throw new ApiError(400 , "username and email is required!")
   }

   const user = await User.findOne({
      $or: [{username},{email}]
   })

   if(!user){
      throw new ApiError(401, "User with give data doesnt exists")
   }

   if(!password){
      throw new ApiError(400,"password is required!")
   }

   const isValidPassword = await user.isCorrectPassword(password)

   if(!isValidPassword){
      throw new ApiError(401,"Invalid user credantials")
   }

   const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id)

   const options = {
      httpOnly:true,
      secure:true
   }

   return res
      .status(200)
      .cookie("accessToken" , accessToken , options)
      .cookie("refreshToken", refreshToken , options)
      .json({
         user:{            // if using mobile application
            id:user._id,
            username:user.username,
            email:user.email
         },
         accessToken,
         refreshToken
      })
})

const logoutUser = asyncHandler(async (req,res)=>{
   // Algorithm : {
   // req.user -> data
   // clear cookies
   // clear refreshToken from database
   // send success response}

   const options = {
      httpOnly:true,
      secure:true
   }

   const user = await User.findById(req.user._id)
   user.refreshToken = ""
   await user.save({validateBeforeSave:false})

   return res
            .status(200)
            .clearCookie("accessToken",options)
            .clearCookie("refreshToken",options)
            .json(
               new ApiResponse(200,{},"Logout succesfull")
            )
})

const refreshAccessToken = asyncHandler(async (req,res)=>{

   const incomingRefreshToken = req.cookies?.refreshToken

   if(!incomingRefreshToken){
      throw new ApiError(401,"Unauthorized request")
   }

   let decodedToken;

    try {
      decodedToken = jwt.verify(incomingRefreshToken , process.env.REFRESH_TOKEN_SECRET)
    } catch (error) {
         throw new ApiError(401,"Refresh Token Expired or used")
    }

   const user = await User.findById(decodedToken._id)

   if(!user){
      throw new ApiError(500,"User not found! ")
   }

   const {accessToken , newRefreshToken} = await generateAccessAndRefreshToken(user._id)

   return res.status(200)
             .cookie("accessToken",accessToken,cookieOptions)
             .cookie("refreshToken",newRefreshToken,cookieOptions)
             .json(
               new ApiResponse(200,
                  {
                     _id:user._id,
                     username:user.username,
                     email:user.email,
                     accessToken,
                  },
                  "AccessToken refreshed"
               )
             )
})

const changeCurrentPassword = asyncHandler(async (req,res)=>{     // used verifyJWT middleware

   const {currentPassword , newPassword} = req.body

   if(!(currentPassword && newPassword )){
      throw new ApiError(400,"All fields are required!")
   }

   const user = await User.findById(req.user?._id)

   const isCorrect = await user?.isCorrectPassword(currentPassword)

   if(!isCorrect){
      throw new ApiError(401,"Enter correct password to change password")
   }

   user.password = newPassword
   await user.save({validateBeforeSave:false})

   //!  EXTRA : FOR MORE SECURITY PURPOSE

   //const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id)

   return res
            .status(200)
            // .cookie("accessToken",accessToken,cookieOptions)      // new accessToken
            // .cookie("refreshToken",refreshToken,cookieOptions)    // new refreshToken
            .json(
               new ApiResponse(200,{},"Password updated succesfully")
            )
})

const getCurrentUser = asyncHandler(async (req,res)=>{      // used verifyJWT middleware
   return res
            .status(200)
            .json(
               new ApiResponse(200,req.user,"logged in user fetched succesfuly")
            )

})

const updateAccountDetails = asyncHandler(async (req,res)=>{   // used verifyJWT middleware   (recheck)

   const {fullName,username} = req.body

   if(!(fullName || username)){
      throw new ApiError(400,"All fields are required to update the Acxcount Details")
   }

   let updateFields ={};

   if(fullName) updateFields.fullName = fullName
   if(username) updateFields.username = username

   const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
         $set:{
              ...updateFields
         }
      },
      {new:true}     // returns updated user object
   ).select("-password -refreshToken")

   return res
            .status(200)
            .json(
               new ApiResponse(200,updatedUser,"Account Details Updated Succesfuly")
            )

})

const updateAvatarImage = asyncHandler(async (req,res)=>{      // used multer and verifyJWT middleware 

      const avatarLocalPath = req.file?.path

      if(!avatarLocalPath){
         throw new ApiError(400,"Avatar image is required")
      }

      const avatar = await uploadFileOnCloudinary(avatarLocalPath)

      if(!avatar){
         throw new ApiError(400,"Error while uploading Avatar Image")
      }

      const updatedUser = await User.findByIdAndUpdate(
         req.user._id,
         {
            $set:{
               avatar:avatar.url
            }
         },
         {new:true}  // returns updated user object
      ).select("-password -refreshToken")

      return res
               .status(200)
               .json(
                  new ApiResponse(200,updatedUser,"Avatar Image updated Successfully")
               )

})

const updateCoverImage = asyncHandler(async (req,res)=>{       // used multer and verifyJWT middleware 

      const coverImageLocalPath = req.file?.path

      if(!coverImageLocalPath){
         throw new ApiError(400,"Cover Image is required for updation")
      }

      const coverImage = await uploadFileOnCloudinary(coverImageLocalPath)

      if(!coverImage){
         throw new ApiError(400,"Error while uploading Cover Image")
      }

      const updatedUser = await User.findByIdAndUpdate(
         req.user._id,
         {
            $set:{
               coverImage:coverImage.url
            }
         },
         {new:true}    // retunrs updated user object
      ).select("-password -refreshToken")

      return res
               .status(200)
               .json(
                  new ApiResponse(200,updatedUser,"Cover Image updated Successfully")
               )

})

const getUserChannelProfile = asyncHandler(async (req,res)=>{    // used verifyJWT middleware

   const {username} = req.body

   if(!username?.trim()){
      throw new ApiError(400,"Username is required")
   }

   const channel = await User.aggregate([
      {
         $match:{
            username:username?.toLowerCase()
         }
      },
      {
         $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"channel",
            as:"subscribers"
         }
      },
      {
         $lookup:{
            from:"subscriptions",
            localField:"_id",
            foreignField:"subscriber",
            as:"subscribedTo"
         }
      },
      {
         $addFields:{
            subscribersCount:{
               $size:"$subscribers"
            },
            subscribedToCount:{
               $size:"$subscribedTo"
            },
            isSubscribed:{
               $anyElementTrue:{
                  $map:{
                     input:"$subscribers",
                     as:"sub",
                     in:{$eq:[req.user._id,"$$sub.subscriber"]}
                  }
               }
            }
         }
      },
      {
         $project:{
               username:1,
               email:1,
               fullName:1,
               avatar:1,
               coverImage:1,
               subscribersCount:1,
               subscribedToCount:1,
               isSubscribed:1
         }
      }
   ])

   if(!channel.length){
      throw new ApiError(404,"Chennel does not exists")
   }

   return res
            .status(200)
            .json(
               new ApiResponse(200,channel[0],"Channel fetched succesfully")
            )
})

const getUserWatchHistory = asyncHandler(async (req,res)=>{       // used verifyJWT middleware
      const history = await User.aggregate([
         {
            $match:{
               _id: new mongoose.Types.ObjectId(req.user._id)
            }
         },
         {
            $lookup:{
               from:"videos",
               localField:"watchHistory",
               foreignField:"_id",
               as:"watchedVideos",
               pipeline:[
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
                     $addFields:{
                        owner:{
                           $first:"$owner"
                        }
                     }
                  }
                  
               ]
            }
         },
         {
            $project:{
               username:1,
               email:1,
               watchedVideos:1
            }
         }
      ])

      return res
               .status(200)
               .json(
                  new ApiResponse(200,history[0],"user watchHistory fetched succesfully")
               )
})

export { 
   registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken,
   changeCurrentPassword,
   getCurrentUser,
   updateAccountDetails,
   updateAvatarImage,
   updateCoverImage,
   getUserChannelProfile,
   getUserWatchHistory
};