/**
 * GET /
 * Home page.
 */

 var Question = require("../models/Question");
 var User = require("../models/User");
 var Response = require("../models/Response");

exports.postquestion = (req, res) => {
    var question = new Question({
      user:req.body.user,
      title:req.body.title,
      context:req.body.context,
      price:req.body.price,
      target:req.body.target
    })
    question.save(function(err){
      if (err){console.log(err)}
      else{res.redirect('/star/'+req.body.target);}
    })

};
exports.postresponse = (req, res) => {
  Question.findOne({_id: req.params.id}, function(err, question){
      // data from form on the front end
      var response = new Response({
        user:req.body.user,
        question:req.body.question,
        response:req.body.response

      })
      response.save(function(err){
              question.response.push(response);
              question.save(function(err){
                   if(err) {
                        console.log('Error');
                   } else {
                        res.redirect('/star/'+req.body.twitter);
                   }
               });
       });
  });

};
