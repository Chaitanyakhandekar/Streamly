import { Router } from "express";
import 
{
    createPlaylist,
    updatePlaylist,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    getUserPlaylists,
    getVideosInPlaylist
}
from "../controllers/playlist.controller.js"
import { verifyJWT } from "../middlewares/authenticate.middleware.js";
import {validateOwnership} from "../middlewares/validateOwnership.middleware.js"

const router = Router()

router.route("/create").post(verifyJWT,createPlaylist)
router.route("/update").patch(verifyJWT,validateOwnership,updatePlaylist)
router.route("/delete/:pid").get(verifyJWT,validateOwnership,deletePlaylist)
router.route("/add-video").post(verifyJWT,validateOwnership,addVideoToPlaylist)
router.route("/remove-video/").get(verifyJWT,validateOwnership,removeVideoFromPlaylist)
router.route("/my").get(verifyJWT,getUserPlaylists)
router.route("/get-videos/").get(verifyJWT,validateOwnership,getVideosInPlaylist)

export default router;