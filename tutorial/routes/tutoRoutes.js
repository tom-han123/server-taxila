const express = require("express");
const router = express.Router();
const checkAuth = require("../../middleware/check_auth");
const checkRole = require("../../middleware/check_role");
const checksuper = require("../../middleware/check_super");
const upload_mp4 = require("../../middleware/upload_mp4");

const {getTag, createTag, updateTag, deleteTag} = require("../controllers/tagController");
const {getLang, createLang, updateLang, deleteLang} = require("../controllers/languageController");
const {createTuto, getTuto, updateTuto, deleteTuto} = require("../controllers/tutoController");

// Tags
router.get("/tag/gettag", checkAuth, getTag);
router.post("/tag/create",checkAuth, checksuper, createTag);
router.put("/tag/update",checkAuth, checksuper, updateTag);
router.delete("/tag/delete", checkAuth, checksuper, deleteTag);

// Tags
router.get("/lang/getlang", checkAuth, getLang);
router.post("/lang/create",checkAuth, checksuper, createLang);
router.put("/lang/update",checkAuth, checksuper, updateLang);
router.delete("/lang/delete", checkAuth, checksuper, deleteLang);

// Tutos
router.post("/create", checkAuth, checkRole, upload_mp4.single("vdfile"), createTuto);
router.get("/gettuto", checkAuth, getTuto);
router.put("/update", checkAuth, checkRole, upload_mp4.single("vdfile"), updateTuto);
router.delete("/delete", checkAuth, checksuper, deleteTuto);

module.exports = router;