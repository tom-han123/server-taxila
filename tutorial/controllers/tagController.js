const asyncHandler = require("express-async-handler");
const mongoose = require('mongoose');
const { config } = require('dotenv');
const Tag = require("../models/tagModel");
config();

const getTag = asyncHandler( async(req, res, next) =>{
    try{
        var count = 1;
        var pgcount = 0;
        var { id, keyword, page, limit } = req.query;
        page = page === "" ? 1 : parseInt(page);
        limit = limit === "" ? 15 : parseInt(limit);
        var start = (page === '1') ? (page - 1) : (limit + (limit * (page - 2)))
        var end = (page === '1') ? limit : (limit + (limit * (page - 1)))

        let data = ''
        if (id) {
            data = await Tag.findById(id)
            if (!data) {
                res.status(404);
                throw new Error("Data Not Found.");
            }
        } else {
            let q = {}
            if (keyword) {
                q["name"] = RegExp(".*" + keyword + ".*");
            }
            data = await Tag.find(q).sort({ _id: 1 })
            count = data.length;
            pgcount = parseInt(count / limit);
            if (count % limit) {
                pgcount = pgcount + 1;
            }
            data = data.slice(start, end)
        }
        res.status(200).json({ total: count, pagecount: pgcount, data: data });
    }catch (err){
        throw new Error(err.message);
    }
});

const createTag = asyncHandler( async (req, res, next)=>{
    try{
        const { name } = req.body;
        if (!name) {
            res.status(400);
            throw new Error("All fields are mandatory.");
        }
        const tag = await Tag.create({
            name: name,
        })
        if (tag) {
            res.status(201).json({ "data": tag });
        } else {
            res.status(400);
            throw new Error("Data is invalid.");
        }
    }catch (err){
        throw new Error(err.message);
    }
});

const updateTag = asyncHandler( async (req, res, next)=>{
    try{
        const {id , name} = req.body;
        const tag = await Tag.findByIdAndUpdate(id, {name});
        if (tag) {
            res.status(200).json({ message: "Update data successful" });
        } else {
            res.status(400);
            throw new Error("Update Failed.");
        }
    }catch (err){
        throw new Error(err.message);
    }
});

const deleteTag = asyncHandler(async (req, res, next) => {
    try {
        const ids = req.body.idlist;
        ids.forEach(async (element) => {
            await Tag.findByIdAndDelete(element);
        });
        res.status(200).json({ 'message': "Delete data successful" });
    } catch (err) {
        throw new Error(err.message);
    }
});

module.exports = {getTag, createTag, updateTag, deleteTag}
