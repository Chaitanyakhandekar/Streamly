import { Router } from "express";
import {verifyJWT} from "../middlewares/authenticate.middleware.js"
import 
{
    addComment,
    getCommentsOnVideo,
    deleteComment,
    updateComment,
    deleteCommentsOnVideo
}
from "../controllers/comment.controller.js"


const router = Router();

router.route("/add-comment").post(verifyJWT,addComment)
router.route("/update-comment").post(verifyJWT,updateComment)
router.route("/get-video-comments/").get(verifyJWT,getCommentsOnVideo)
router.route("/delete-comment/:id").get(verifyJWT,deleteComment)
router.route("/delete-comments-on-video/:id").get(verifyJWT,deleteCommentsOnVideo)

export default router;