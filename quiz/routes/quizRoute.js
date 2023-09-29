const express = require("express");
const router = express.Router();
const checkAuth = require("../../middleware/check_auth");
const checkRole = require("../../middleware/check_role");
const checksuper = require("../../middleware/check_super");

const {createQuiz, getQuiz, updateQuiz, deleteQuiz, testQuiz, getQuizResult} = require("../controllers/quizController");

router.post("/create",checkAuth, checkRole, createQuiz);
router.get("/getquiz", checkAuth, getQuiz);
router.put("/update", checkAuth, checkRole, updateQuiz);
router.delete("/delete", checkAuth, checkRole, deleteQuiz);
router.post("/testquiz", checkAuth, testQuiz);
router.get("/getresult", checkAuth, getQuizResult);

module.exports = router;