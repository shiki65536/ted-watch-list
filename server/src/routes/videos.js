const express = require("express");
const router = express.Router();
const videoController = require("../controllers/videoController");
const auth = require("../middleware/auth");

// get video (public)
router.get("/:channel", videoController.getVideos);

// manually refresh (validation required)
router.post("/refresh", auth, videoController.refreshVideos);

module.exports = router;
