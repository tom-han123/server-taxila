const asyncHandler = require("express-async-handler");
const { config } = require('dotenv');
const {Quiz, QuizResult} = require("../models/quizModel");
config();

const createQuiz = asyncHandler( async(req, res, next) =>{
    try{
        const {title, description, questions, timer, tuto} = req.body;
        var d = (new Date()).getTime();
        const quiz = await Quiz.create({title, description, questions, tuto, timer, creationtime:d, createdbyuser:req.user.userid});
        res.status(201).json(quiz);
    }catch (err){
        throw new Error(err.message);
    }
}
);

const getQuiz = asyncHandler( async(req, res, next) =>{
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
            data = await Tuto.findById(id)
            if (!data) {
                res.status(404);
                throw new Error("Data Not Found.");
            }
        } else {
            data = await Quiz.aggregate([
                {
                    $lookup:{
                        from: "tutos",
                        localField:"tuto",
                        foreignField:"_id",
                        as:"tutos"
                    }
                },
                {
                    $unwind:"$tutos",
                },
                {
                    $project: {
                      title: 1,
                      description: 1,
                      tuto:'$tutos._id',
                      tutoname:'$tutos.name',
                      questions:1,
                    //   questions:{
                    //     $map: {
                    //       input: "$questions",
                    //       as: "question",
                    //       in: {
                    //         question: "$$question.question",
                    //         options:{
                    //             $map:{
                    //                 input:"$$question.options",
                    //                 as:"option",
                    //                 in:{
                    //                     option:"$$option.option",
                    //                     _id:"$$option._id"
                    //                 }
                    //             }
                    //         },
                    //         _id: "$$question._id"
                    //       }
                    //     }
                    //   },
                      creationtime:1,
                      createdbyuser:1,
                    },
                  },
                

            ]);
            
            if (keyword){
                data = data.filter(item =>item.title.includes(keyword)=== true)
            }
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

const updateQuiz = asyncHandler( async (req, res, next) =>{
    try{
        const id = req.body.id;
        var obj = {}
        var quiz = await Quiz.findById(id);
        if (!quiz){
            res.status(400);
            throw new Error("No data with the following Id.");
        }
        Object.keys(req.body).forEach(k => {
            if(k !== "createdbyuser" && k !== "creationtime" && k !== "tuto"){
                obj[k] = (req.body)[k];
            }
        });
        await Quiz.findByIdAndUpdate(id, obj);
        res.status(200).json({ message: "Update data successful" });
    }catch (err){
        throw new Error(err.message);
    }
});

const deleteQuiz = asyncHandler( async (req, res, next) =>{
    try{
        const id = req.body.id;
        await Quiz.findByIdAndDelete(id);
        res.status(200).json({"message":"Delete data successful."});
    }catch (err){
        throw new Error(err.message);
    }
});

const testQuiz = asyncHandler( async (req, res, next) =>{
    try{
        const {quizid, answer} = req.body;
        var d = (new Date()).getTime();
        let compareans = {}
        let total_score = 0
        answer.forEach(ans =>{
            compareans[ans['questionid']] = ans['choice_option']
        })
        const quiz = await Quiz.findById(quizid);
        for (let i of Object.keys(compareans)){
            quiz.questions.forEach(quest =>{
                if (quest._id.equals(i)){
                    quest.options.forEach(opt=>{
                        if (opt._id.equals(compareans[i])){
                            if (opt.correctanswer){
                                total_score = total_score + 1;
                            }
                        }
                    })
                }
            });
        }
        await QuizResult.create({quiz:quizid, user:req.user.userid, score:total_score, creationtime:d});
        res.status(200).json({"message": total_score});
    }catch (err){
        throw new Error(err.message);
    }
});

const getQuizResult = asyncHandler ( async (req, res, next)=>{
    try{
        const quiz = req.query.quiz;
        let q = {user:req.user.userid}
        if(quiz){
            q["quiz"] = quiz;
        }
        const result = await QuizResult.find(q);
        res.status(200).json(result);
    }catch (err){
        res.status(500);
        throw new Error(err.message);
    }
})


module.exports = {createQuiz, getQuiz, updateQuiz, deleteQuiz, testQuiz, getQuizResult}
