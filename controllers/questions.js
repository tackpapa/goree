var Question = require("../models/Question");
var User = require("../models/User");
var Response = require("../models/Response");

exports.postquestion = (req, res) => {
    if(req.user.money < req.body.price){
      req.body = null;
      res.redirect('/notenoughmoney')
    }

    var question = new Question({
        user: req.body.user,
        title: req.body.title,
        context: req.body.context,
        price: req.body.price,
        target: req.body.target
    })
    question.save(function(err) {
        if (err) {
            console.log(err)
        } else {
            newPrice = req.user.money - req.body.price
            User.update({
                _id: req.body.user
            }, {
                money: newPrice
            }, function(err) {
                if (err) {
                    console.log(err)
                } else {
                    res.redirect('/star/' + req.body.target)
                }
            })
        }
    })

};
exports.postresponse = (req, res) => {
    Question.findOne({
        _id: req.params.id
    }, function(err, question) {

        var response = new Response({
            user: req.body.user,
            question: req.body.question,
            response: req.body.response
        })
        response.save(function(err) {
                question.response.push(response);
                question.save(function(err) {
                    if (err) {
                        console.log(err);
                    } else {
                        var updateMoney = req.user.money + question.price
                        User.update({
                            _id: req.user._id
                        }, {
                            money: updateMoney
                        }, function(err) {
                            if (err) {
                                console.log(err)
                            } else {
                                res.redirect('/star/' + req.body.twitter)
                            }
                        });
                    }
                })

            }

        )
    })
}
exports.chargeone = (req, res) => {
    User.findOne({
        _id: req.params.id
    }, function(err, user) {
        if (err) {
            console.log("charging error", err)
        } else {
          if(user.money == 0){
            res.redirect('/refillmoney')
          }
            user.money = user.money - 1
            user.save(function(err) {
                if (err) {
                    console.log(err)
                } else {
                    res.json(200)
                }
            })
        }
    })

};
exports.refillmoney = (req, res) => {
res.render('refill')
};
exports.notenough = (req, res) => {
res.render('notenough')
};
exports.refill = (req, res) => {
User.update({_id:req.user._id}, {money:parseInt(req.user.money)+parseInt(req.body.charging)}, function(err){
  if(err){console.log("refill error", err)}
  else {res.redirect('/')}
})

};
