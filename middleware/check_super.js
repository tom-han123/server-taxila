module.exports = async (req,res, next) => {
    const role = req.user.role
    if (role !== 'super'){
        return res.status(400).json({message:"You are not authorize for this request..."});
    }
    next();
}