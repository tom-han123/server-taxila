const jwt = require('jsonwebtoken');
const Token = require('../user/models/tokenModel');

module.exports = async (req, res, next) =>{
    try{
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_KEY);
        req.user = decoded
        const findtoken = await Token.findOne({user:req.user.userid});
        if (!findtoken){
            return res.status(401).json('Unauthorize for this request');
        }
        next();
    }catch (err){
        return res.status(401).json({
            message: "Unauthorize for this request..."
        })
    }
}