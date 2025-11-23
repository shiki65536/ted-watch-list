const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");

// Authentication
router.use(auth);

// Favourites
router.get("/favourites", userController.getFavourites);
router.post("/favourites", userController.addFavourite);
router.delete("/favourites/:videoId", userController.removeFavourite);

// Watched
router.get("/watched", userController.getWatched);
router.post("/watched", userController.addWatched);
router.delete("/watched/:videoId", userController.removeWatched);

// Bucket
router.get("/bucket", userController.getBucket);

module.exports = router;
