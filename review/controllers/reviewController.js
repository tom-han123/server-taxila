const asyncHandler = require("express-async-handler");
const { config } = require('dotenv');
const Review = require("../models/reviewModel");
config();

const getReview = asyncHandler(async (req, res, next) => {
    var count = 1;
    var pgcount = 0;
    var { id, keyword, page, limit } = req.query;
    page = page === "" ? 1 : parseInt(page);
    limit = limit === "" ? 15 : parseInt(limit);
    var start = (page === '1') ? (page - 1) : (limit + (limit * (page - 2)))
    var end = (page === '1') ? limit : (limit + (limit * (page - 1)))

    let data = ''
    if (id) {
        data = await Review.findById(id)
        if (!data) {
            res.status(404);
            throw new Error("Data Not Found.");
        }
    } else {
        let q = {}
        if (keyword) {
            q["message"] = RegExp(".*" + keyword + ".*");
        }
        data = await Review.find(q).sort({ _id: 1 })
        count = data.length;
        pgcount = parseInt(count / limit);
        if (count % limit) {
            pgcount = pgcount + 1;
        }
        data = data.slice(start, end)
    }
    res.status(200).json({ total: count, pagecount: pgcount, data: data });

});

const createReview = asyncHandler(async (req, res, next) => {
    const { tuto, message, star } = req.body;
    var d = (new Date()).getTime();
    if (!tuto || !star) {
        res.status(400);
        throw new Error(err.message);
    }
    const findr = await Review.findOne({ "user": req.user.userid, "tuto": tuto });
    if (findr) {
        res.status(400);
        throw new Error("You can not make review twice.");
    }
    const review = await Review.create({
        user: req.user.userid,
        tuto,
        message,
        star,
        creationtime: d
    });
    if (!review) {
        res.status(400);
        throw new Error("Create data failed.");
    } else {
        res.status(201).json(review);
    }
});

const updateReview = asyncHandler( async (req, res, next) =>{
    try{
        const {id, message, star} = req.body;
        var r = await Review.findOne({"_id":id, "user":req.user.userid});
        if (!r){
            res.status(400);
            throw new Error("You have no permission to update this data.");
        }
        if (!id || !message || !star){
            res.status(400);
            throw new Error("All Fields are mandatory.");
        }
        await r.updateOne({message,star});
        res.status(200).json("Update data successful.");
    }catch (err){
        throw new Error(err.message);
    }
});

const deleteReview = asyncHandler(async (req, res, next)=>{
    try{
        const {id} = req.body;
        var r = await Review.findById(id);
        if (!r.user.equals(req.user.userid) && req.user.role !== "super"){
            res.status(400);
            throw new Error("You have no permission to delete this data.");
        }
        await r.deleteOne();
        res.status(200).json({"message":"Delete data successful."});
    }catch (err){
        throw new Error(err.message);
    }
})

module.exports = { getReview, createReview , updateReview, deleteReview}