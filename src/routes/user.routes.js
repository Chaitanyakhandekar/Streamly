import {Router} from 'express'

import 
{
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
    getUserWatchHistory,
} from '../controllers/user.controller.js';

import {upload} from '../middlewares/multer.middleware.js'
import { verifyJWT } from '../middlewares/authenticate.middleware.js';

const router = Router()

router.route("/register").post(
    upload.fields([                 // here we injected Middleware and choose to upload multiple fields
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),

    registerUser
)

router.route("/login").post(loginUser)

// secured Routes

router.route("/logout").post(verifyJWT, logoutUser)
router.route("/refresh-token").post(refreshAccessToken)
router.route("/change-password").post(verifyJWT,changeCurrentPassword)
router.route("/current-user").get(verifyJWT,getCurrentUser)
router.route("/update-details").patch(verifyJWT,updateAccountDetails)
router.route("/update-avatar").patch(verifyJWT,upload.single("avatar"),updateAvatarImage)
router.route("/update-coverImage").patch(verifyJWT,upload.single("coverImage"),updateCoverImage)
router.route("/channel").post(verifyJWT,getUserChannelProfile)
router.route("/watch-history").get(verifyJWT,getUserWatchHistory)


export default router;