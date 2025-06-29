import mongoose,{Schema} from "mongoose";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from "dotenv"

dotenv.config({path:'./.env'})

const userSchema = new Schema({
    username:{
        type:String,
        unique:true,
        required:true,
        lowercase:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"User"
        }
    ],
    password:{
        type:String,
        required:true
    },
    fullName:{
        type:String,
        required:true,
        index:true
    },
    avatar:{
        type:String,  //cloudinary
        required:true,
    },
    coverImage:{
        type:String
    },
    refreshToken:{
        type:String
    }

},{timestamps:true})

userSchema.pre("save",async function(next){             //! hashing password before saving
    if(!this.isModified("password")) return next()

    this.password = await bcrypt.hash(this.password,10)
    next()
})     // use normal function instead of callback because it has reference of current class(this)


userSchema.methods.isCorrectPassword = async function(password){  //!  custom function in userSchema for password cheking
    return await bcrypt.compare(password,this.password)
} 

userSchema.methods.generateAccessToken = function(){       //!  custom function in userSchema for generate access token 
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
            username:this.username,
            fullName:this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateRefreshTokens = function(){      //! custom function in userSchema for generate refresh token
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User",userSchema);