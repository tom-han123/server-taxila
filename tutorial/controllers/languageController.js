const asyncHandler = require("express-async-handler");
const { config } = require('dotenv');
const Language = require("../models/languageModel");
config();

const getLang = asyncHandler( async(req, res, next) =>{
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
            data = await Language.findById(id)
            if (!data) {
                res.status(404);
                throw new Error("Data Not Found.");
            }
        } else {
            let q = {}
            if (keyword) {
                q["name"] = RegExp(".*" + keyword + ".*");
            }
            data = await Language.find(q).sort({ _id: 1 })
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
})

const createLang = asyncHandler( async (req, res, next)=>{
    try{
        const { name } = req.body;
        if (!name) {
            res.status(400);
            throw new Error("All fields are mandatory.");
        }
        const tag = await Language.create({
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
})

const updateLang = asyncHandler( async (req, res, next)=>{
    try{
        const {id , name} = req.body;
        const tag = await Language.findByIdAndUpdate(id, {name});
        if (tag) {
            res.status(200).json({ message: "Update data successful" });
        } else {
            res.status(400);
            throw new Error("Update Failed.");
        }
    }catch (err){
        throw new Error(err.message);
    }
})

const deleteLang = asyncHandler(async (req, res, next) => {
    try {
        const ids = req.body.idlist;
        ids.forEach(async (element) => {
            await Language.findByIdAndDelete(element);
        });
        res.status(200).json({ 'message': "Delete data successful" });
    } catch (err) {
        throw new Error(err.message);
    }
});

module.exports = {getLang, createLang, updateLang, deleteLang}
