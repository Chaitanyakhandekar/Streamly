import express from "express";
import cookieParser from "cookie-parser";
import cors from 'cors'

const server = express()

server.use(cors({
    origin:process.env.ALLOW_ORIGIN || "*",
    credentials:true
}))

server.use(express.json({limit:"16kb"}))
server.use(express.urlencoded({extended:true, limit:"16kb"}))
server.use(express.static("public"))
server.use(cookieParser())



//best practice to import Routes here instead of index.js

//Import 

import userRouter from './routes/user.routes.js'
import tweetRouter from "./routes/tweet.route.js"
import commentRouter from "./routes/comment.route.js"
import subscriptionRouter from "./routes/subscription.route.js"
import videoRouter from "./routes/video.route.js"
import likeRouter from "./routes/like.route.js"
import playlistRouter from "./routes/playlist.route.js"


// routes declaration

server.use("/api/v1/users", userRouter)
server.use("/api/v1/tweets", tweetRouter)
server.use("/api/v1/comments", commentRouter)
server.use("/api/v1/subscriptions", subscriptionRouter)
server.use("/api/v1/videos", videoRouter)
server.use("/api/v1/likes" , likeRouter)
server.use("/api/v1/playlists" , playlistRouter)

export {server}