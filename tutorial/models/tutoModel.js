const mongoose = require('mongoose');

const tutoSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description: { 
        type: String,
        required: true,
    },
    tag: { type: mongoose.Schema.Types.ObjectId, ref: 'Tag', required: true },
    language: { type: mongoose.Schema.Types.ObjectId, ref: 'Language', required: true },
    videopath:{type:String, required:true},
    creationtime:{
        type:Number,
        required: true
    },
    createdbyuser:{
        type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
    }
});

module.exports = mongoose.model('Tuto', tutoSchema);