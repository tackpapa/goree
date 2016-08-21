'use strict';
var Question = require("../models/Question");
var User = require("../models/User");
var Response = require("../models/Response");
var Donation = require("../models/Donation");
const _ = require('lodash');
const async = require('async');
const validator = require('validator');
const request = require('request');
const cheerio = require('cheerio');
const graph = require('fbgraph');
const Twit = require('twit');
const ig = require('instagram-node').instagram();




exports.instaquery = (req, res, next) => {
    const token = req.user.tokens.find(token => token.kind === 'instagram');
    ig.use({
        client_id: process.env.INSTAGRAM_ID,
        client_secret: process.env.INSTAGRAM_SECRET
    });
    ig.use({
        access_token: token.accessToken
    });
    ig.user_search(req.body.query, (err, reply) => {
        res.render('list', {
            reply: reply
        });
    });
};

exports.findstarr = (req, res, next) => {
const token = req.user.tokens.find(token => token.kind === 'instagram');
ig.use({
client_id: process.env.INSTAGRAM_ID,
client_secret: process.env.INSTAGRAM_SECRET
});
ig.use({
access_token: token.accessToken
});

ig.user(req.params.id, (err, reply) => {

if (err) {
console.log(err)
} else {
ig.user_media_recent(req.params.id, (err, media) => {
    if (err) {
        console.log(err)
    } else {
        Question.find({
            target: req.params.id
        }).populate('user').populate('response').sort({
            date: 'desc'
        }).exec(function(err, data) {
            if (err) {
                console.log("findstar error ", err)
            } else {
                User.find({
                    instagram: req.params.id
                }).exec(function(err, donation) {
                    if (donation == null || undefined) {
                        console.log(err + "donationfinding");
                        res.render('star', {
                            reply: reply,
                            data: data,
                            media: media
                        })
                    } else {
                        Question.count({
                            target: req.params.id
                        }).exec(function(err, count) {
                            if (err) {
                                console.log(err)
                            } else {
                                User.find({instagram:req.params.id}).exec(function(err, celeb){
                                  if(err){console.log(err)}
                                  else{
                                    res.render('star', {
                                        reply: reply,
                                        data: data,
                                        media: media,
                                        donation: donation,
                                        count: count,
                                        celeb: celeb
                                    })
                                  }
                                })

                            }
                        })

                    }
                })

            }
        })
    }
})
}
});
};





exports.insertquery = (req, res, next) => {
    const token = req.user.tokens.find(token => token.kind === 'twitter');
    const T = new Twit({
        consumer_key: process.env.TWITTER_KEY,
        consumer_secret: process.env.TWITTER_SECRET,
        access_token: token.accessToken,
        access_token_secret: token.tokenSecret
    });
    T.get('users/search', {
        q: req.body.query,
        count: 24
    }, function(err, reply) {

        if (err) {
            console.log("inserting query error", err)
        }
        res.render('list', {
            reply: reply
        });

    });
};
exports.findstar = (req, res, next) => {
    const token = req.user.tokens.find(token => token.kind === 'twitter');
    const T = new Twit({
        consumer_key: process.env.TWITTER_KEY,
        consumer_secret: process.env.TWITTER_SECRET,
        access_token: token.accessToken,
        access_token_secret: token.tokenSecret
    });

    T.get('users/show', {
        user_id: req.params.id,
        count: 1
    }, function(err, reply) {
        if (err) {
            console.log(err)
        } else {
            Question.find({
                target: req.params.id
            }).populate('user').populate('response').sort({
                date: 'desc'
            }).exec(function(err, data) {
                if (err) {
                    console.log("findstar error ", err)
                } else {

                    res.render('star', {
                        reply: reply,
                        data: data
                    })
                }
            })
        }
    })
}
/**
 * GET /api/instagram
 * Instagram API example.
 */
exports.getInstagram = (req, res, next) => {
    const token = req.user.tokens.find(token => token.kind === 'instagram');
    ig.use({
        client_id: process.env.INSTAGRAM_ID,
        client_secret: process.env.INSTAGRAM_SECRET
    });
    ig.use({
        access_token: token.accessToken
    });
    async.parallel({
        searchByUsername: (done) => {
            ig.user_search('sss', (err, users) => {
                done(err, users);

            });
        },
        searchByUserId: (done) => {
            ig.user('175948269', (err, user) => {
                done(err, user);
            });
        },
        popularImages: (done) => {
            ig.media_popular((err, medias) => {
                done(err, medias);
            });
        },
        myRecentMedia: (done) => {
            ig.user_self_media_recent((err, medias) => {
                done(err, medias);
            });
        }
    }, (err, results) => {
        if (err) {
            return next(err);
        }
        res.render('api/instagram', {
            title: 'Instagram API',
            usernames: results.searchByUsername,
            userById: results.searchByUserId,
            popularImages: results.popularImages,
            myRecentMedia: results.myRecentMedia
        });
    });
};
