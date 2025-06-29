import {Router} from "express"
import {verifyJWT} from "../middlewares/authenticate.middleware.js"
import{
    subscribeToUser,
    unsubscribeFromUser,
    getUserSubscribers,
    getUserSubscriptions,
    isSubscribedToUser,
}from "../controllers/subscription.controller.js"

const router = Router()

// put static routes always at top and Dynamic routes at bottom

router.route("/user-subscribers/").get(verifyJWT,getUserSubscribers)
router.route("/user-subscriptions/").get(verifyJWT,getUserSubscriptions)
router.route("/is-subscribed-to/:channel").get(verifyJWT,isSubscribedToUser)
router.route("/subscribe/:channel").get(verifyJWT,subscribeToUser)
router.route("/unsubscribe/:channel").get(verifyJWT,unsubscribeFromUser)



export default router;