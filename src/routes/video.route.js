import { Router } from "express";
import {verifyJWT} from "../middlewares/authenticate.middleware.js"
import
{
    uploadVideo,
    getAllVideos,
    getVideoById,
    updateVideo,
    deleteVideo
}
from "../controllers/video.controller.js"
import { upload } from "../middlewares/multer.middleware.js";

const router = Router()

// Always keep Static routes at top and Dynamic routes at bottom

router.route("/upload").post(verifyJWT , upload.single("video1") , uploadVideo)
router.route("/get-all/").get(verifyJWT,getAllVideos)
router.route("/get-by-id/:id").get(verifyJWT,getVideoById)
router.route("/update-video").patch(verifyJWT,updateVideo)
router.route("/delete-video/:id").get(verifyJWT,deleteVideo)

export default router