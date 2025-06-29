import { Router } from "express";
import 
{ 
    createTweet,
    getTweetById,
    updateTweet,
    deleteTweet,
    getAllTweets,
    getUserTweets

} from "../controllers/tweet.controller.js";
import { verifyJWT } from "../middlewares/authenticate.middleware.js";

const router = Router();

router.route("/create-tweet").post(verifyJWT,createTweet)   // always put static routes at top 
router.route("/get-all-tweets").get(verifyJWT,getAllTweets)
router.route("/update-tweet").post(verifyJWT,updateTweet)
router.route("/get-user-tweets").get(verifyJWT,getUserTweets)
router.route("/delete-tweet/:id").get(verifyJWT,deleteTweet)
router.route("/:id").get(verifyJWT,getTweetById)               // always put Dynamic routes at bottom

export default router;