const asyncHandler = require("express-async-handler");
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { config } = require('dotenv');

const User = require('../models/userModel');
const Token = require('../models/tokenModel');
config();

const signup = asyncHandler(async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        var role = ""
        var d = (new Date()).getTime();
        const finduser = await User.find({ email })
        const count = await User.find().count();
        if (count === 0) {
            role = 'super'
        } else {
            role = 'user'
        }
        if (finduser.length >= 1) {
            res.status(400);
            throw new Error("User already registered!");
        } else {
            const hashedpass = await bcrypt.hash(password, 10);
            const user = await User.create({
                name,
                email,
                password: hashedpass,
                role: role,
                avatar: "uploads/imgs/default.jpg",
                creationtime: d
            })
            if (user) {
                res.status(201).json(user);
            } else {
                res.status(400);
                throw new Error("User data is not valid");
            }
        }
    } catch (err) {
        throw new Error(err.message);
    }
});

const usercreate = asyncHandler(async (req, res, next) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            res.status(400);
            throw new Error("All fields are mandatory.");
        }
        var d = (new Date()).getTime();
        var hashedpass = await bcrypt.hash(password, 10);
        const user = await User.create({
            name: name,
            email: email,
            password: hashedpass,
            role: "admin",
            avatar: "uploads/imgs/default.jpg",
            creationtime: d
        })
        if (user) {
            res.status(201).json({ "data": user });
        } else {
            res.status(400);
            throw new Error("User data is invalid.");
        }
    } catch (err) {
        throw new Error(err.message);
    }


});

const login = asyncHandler(async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400);
            throw new Error("All Fields are mandatory");
        }
        const user = await User.findOne({ email });
        if (!user) {
            res.status(401);
            throw new Error("Email does not exist...");
        } else if (await bcrypt.compare(password, user.password)) {
            const accessToken = jwt.sign(
                {
                    userid: user._id,
                    role: user.role
                },
                process.env.JWT_KEY,
                {
                    expiresIn: "24h"
                }
            );
            await Token.deleteOne({ user: user._id });
            await Token.create({
                user: user._id,
                token: accessToken
            })
            res.status(200).json({ "user": user, accessToken });
        } else {
            res.status(401);
            throw new Error("Login Failed, incorrect password.");
        }
    } catch (err) {
        throw new Error(err.message);
    }
});

const logoutuser = asyncHandler(async (req, res, next) => {
    try {
        await Token.deleteOne({ user: req.user.userid });
        res.status(200).json({ message: "Logout Successful..." });
    } catch (err) {
        throw new Error(err.message);
    }
});

const getuser = asyncHandler(async (req, res, next) => {
    try {
        var count = 1;
        var pgcount = 0;
        var { id, keyword, page, limit, role } = req.query;
        page = page === "" ? 1 : parseInt(page);
        limit = limit === "" ? 15 : parseInt(limit);
        var start = (page === '1') ? (page - 1) : (limit + (limit * (page - 2)))
        var end = (page === '1') ? limit : (limit + (limit * (page - 1)))

        let data = ''
        if (id) {
            data = await User.findById(id)
            if (!data) {
                res.status(404);
                throw new Error("User Not Found.");
            }
        } else {
            let q = { _id: { $ne: "6513da2c4da52d37461d1c98" } }
            if (keyword) {
                q["name"] = RegExp(".*" + keyword + ".*");
            }
            if (role){
                q["role"] = role;
            }
            data = await User.find(q).sort({ _id: 1 })
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

const updateuser = asyncHandler(async (req, res, next) => {
    try {
        const id = req.body.id;
        if (req.user.role !== "admin" && req.user.userid !== id) {
            res.status(400);
            throw new Error("You are not allowed to update this user");
        }
        var userobj = {}
        Object.keys(req.body).forEach(k => {
            if (k !== 'password' || k !== 'role') {
                userobj[k] = (req.body)[k];
            }
        });
        if (req.file.path) {
            userobj['avatar'] = req.file.path;
        }
        const user = await User.findByIdAndUpdate(id, userobj);
        if (user) {
            res.status(200).json({ message: "Update data successful" });
        } else {
            res.status(400);
            throw new Error("Update Failed.");
        }

    } catch (err) {
        throw new Error(err.message);
    }

});

const updatepassword = asyncHandler(async (req, res, next) => {
    try {
        const userid = req.user.userid;
        const { newpass, confirmpass } = req.body;
        if (newpass !== confirmpass) {
            res.status(400);
            throw new Error("Two passwords do not match each other...");
        }
        const hashedpass = await bcrypt.hash(newpass, 10);
        const user = await User.findByIdAndUpdate(userid, { password: hashedpass });
        if (user) {
            res.status(200).json({ message: "Password update successful" });
        } else {
            res.status(400);
            throw new Error("Update Failed");
        }
    } catch (err) {
        throw new Error(err.message);
    }
});

const deleteuser = asyncHandler(async (req, res, next) => {
    try {
        const ids = req.body.idlist;
        ids.forEach(async (element) => {
            await User.findByIdAndDelete(element);
        });
        res.status(200).json({ 'message': "Delete data successful" });
    } catch (err) {
        throw new Error(err.message);
    }
});

module.exports = { signup, usercreate, login, logoutuser, getuser, updateuser, updatepassword, deleteuser };