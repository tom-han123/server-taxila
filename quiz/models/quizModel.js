const mongoose = require("mongoose");


const quizOptionSchema = mongoose.Schema({
    option:{type:String, required:true},
    correctanswer:{type:Boolean, required:true}
});
const quizQuestionSchema = mongoose.Schema({
    question:{type:String, required:true},
    options:[quizOptionSchema]
});

const quizSchema = mongoose.Schema({
    title:{type:String, required:true},
    description:{type:String, required:true},
    questions:[quizQuestionSchema],
    creationtime:{type:Number, required:true},
    tuto:{type: mongoose.Schema.Types.ObjectId, ref: 'Tuto', required: true},
    timer:{type:Number, required:true},
    createdbyuser:{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true}
});


const quizResultSchema = mongoose.Schema({
    quiz:{type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true},
    user:{type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    score:{type:Number, required:true},
    creationtime:{type:Number, required:true}
})
const QuizResult = mongoose.model("QuizResult", quizResultSchema);
const Quiz = mongoose.model("Quiz", quizSchema);
module.exports = {Quiz, QuizResult};