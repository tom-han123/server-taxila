const asyncHandler = require("express-async-handler");
const fs = require("fs");
const { config } = require('dotenv');
const Tuto = require("../models/tutoModel");
const Tag = require("../models/tagModel");
const Language = require("../models/languageModel");
config();

const createTuto = asyncHandler(async (req, res, next) =>{
    try{
        const {name, description, tag, language} = req.body;
        var d = (new Date()).getTime();
        if( !name || !description || !tag || !language){
            res.status(400);
            throw new Error("All fields are madatory.");
        }
        const tuto = await Tuto.create({
            name,
            description,
            tag,
            language,
            creationtime:d,
            videopath:req.file.path,
            createdbyuser:req.user.userid
        })
        if (tuto){
            res.status(201).json(tuto);
        }else{
            res.status(400);
            throw new Error("Create Data Failed");
        }
    }catch (err) {
        throw new Error(err.message);
    }
});

const getTuto = asyncHandler(async (req, res, next) => {
    try {
        var count = 1;
        var pgcount = 0;
        var { id, keyword, page, limit } = req.query;
        page = page === "" ? 1 : parseInt(page);
        limit = limit === "" ? 15 : parseInt(limit);
        var start = (page === '1') ? (page - 1) : (limit + (limit * (page - 2)))
        var end = (page === '1') ? limit : (limit + (limit * (page - 1)))

        let data = ''
        if (id) {
            data = await Tuto.findById(id)
            if (!data) {
                res.status(404);
                throw new Error("Data Not Found.");
            }
        } else {
            let q = {}
            if (keyword) {
                q["name"] = RegExp(".*" + keyword + ".*");
            }
            data = await Tuto.find(q).populate("tag").populate("language").populate({path:"createdbyuser", select:"name"}).sort({ _id: 1 })
            count = data.length;
            pgcount = parseInt(count / limit);
            if (count % limit) {
                pgcount = pgcount + 1;
            }
            data = data.slice(start, end)
        }
        res.status(200).json({ total: count, pagecount: pgcount, data: data });
    } catch (err) {
        throw new Error(err.message);
    }
});

const updateTuto = asyncHandler( async (req, res, next) =>{
    try{
        const id = req.body.id;
        var obj = {}
        var t = await Tuto.findById(id);
        if (t.createdbyuser !== req.user.userid && req.user.role !== "super"){
            res.status(400);
            throw new Error("You are not allowed to update this content");
        }
        Object.keys(req.body).forEach(k => {
            obj[k] = (req.body)[k];
        });
        if (req.file.path) {
            
            if (t.videopath){
                fs.unlink(t.videopath, (err) => {
                    if (err) {
                      console.error(`Error deleting file: ${err}`);
                    } else {
                      console.log('File deleted successfully');
                    }
                  });
            }
            obj['videopath'] = req.file.path;
        }
        const tuto = await Tuto.findByIdAndUpdate(id, obj);
        if (tuto) {
            res.status(200).json({ message: "Update data successful" });
        } else {
            res.status(400);
            throw new Error("Update Failed.");
        }
    }catch (err){
        throw new Error(err.message);
    }
});

const deleteTuto = asyncHandler( async (req, res, next) =>{
    try{
        const {id} = req.body;
        const t = await Tuto.findById(id);
        if (!t){
            res.status(400);
            throw new Error("Delete Data Failed.");
        }else{
            if (t.videopath){
                fs.unlink(t.videopath, (err) => {
                    if (err) {
                      res.status(400);
                      throw new Error("Delete Data Failed");
                    } else {
                      console.log('File deleted successfully');
                    }
                  });
            }
            await t.deleteOne();
            res.status(200).json({"message":"Delete Data Successful."});
        }
    }catch (err){
        throw new Error(err.message);
    }
})

module.exports = {createTuto, getTuto, updateTuto, deleteTuto}