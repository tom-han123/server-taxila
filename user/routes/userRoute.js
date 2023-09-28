const express = require("express");
const router = express.Router();
const checkAuth = require("../../middleware/check_auth");
const checksuper = require("../../middleware/check_super");
const upload = require('../../middleware/upload');
const {signup, usercreate, login, logoutuser, getuser, updateuser, updatepassword, deleteuser} = require('../controllers/userController');

router.post("/signup",signup);
router.post("/login", login);
router.post("/logout",checkAuth, logoutuser);
router.post("/create", checkAuth, checksuper, usercreate);
router.delete("/delete",checkAuth, checksuper, deleteuser);
router.put("/update", checkAuth, upload.single('avatar'), updateuser);
router.put("/update_password", checkAuth, updatepassword);
router.get("/getuser", checkAuth, checksuper, getuser);
module.exports = router;