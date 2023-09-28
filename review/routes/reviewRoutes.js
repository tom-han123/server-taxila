const express = require("express");
const router = express.Router();
const checkAuth = require("../../middleware/check_auth");
const checkRole = require("../../middleware/check_role");
const checksuper = require("../../middleware/check_super");

const {getReview, createReview, updateReview, deleteReview} = require("../controllers/reviewController");

router.get("/getreview", checkAuth, getReview);
router.post("/create", checkAuth, createReview);
router.put("/update", checkAuth, updateReview);
router.delete("/delete", checkAuth, deleteReview);

module.exports = router;