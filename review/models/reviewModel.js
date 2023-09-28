const mongoose = require('mongoose');

const reviewSchema = mongoose.Schema({
    user:{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    tuto:{type: mongoose.Schema.Types.ObjectId, ref: 'Tuto', required: true},
    message:{type:String},
    star:{type:Number, required:true}
});

module.exports = mongoose.model('Review', reviewSchema);