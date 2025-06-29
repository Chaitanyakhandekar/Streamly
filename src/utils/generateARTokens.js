import { User } from "../models/user.model.js"
import { ApiError } from "./apiError.js"

export const generateAccessAndRefreshToken = async (userId)=>{

    const user = await User.findById(userId)

    if(!user){
        throw new ApiError(500,"error while generating access and refresh tokens")
    }

    const accessToken = await user.generateAccessToken()
    const refreshToken = await user.generateRefreshTokens()

    user.refreshToken = refreshToken

    await user.save({validateBeforeSave:false})         // DB operation so use await 

    return {accessToken,refreshToken}
}