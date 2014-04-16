var express = require("express");
var http = require("http");
var engineSet = require("consolidate");
var moment = require("moment");
var pollster = require("./pollster.js");
var story = require("./story/story-poll.js");

// initialize express application
var application = express();

// set strict routing
application.set("strict routing", true);

// register template engine
application.engine("html", engineSet.mustache);
application.set("views", "view");
application.set("view engine", "html");

// middleware
application.use(express.logger());
application.use(express.compress());
application.use(express.static("static"));

var index = function(request, response, next) {
    var before = request.query.date === undefined ? moment().format("YYYY-MM-DD") : moment(request.query.date).format("YYYY-MM-DD");
    var after = moment(before).subtract('days', 7).format("YYYY-MM-DD");

    var parameterMap = {
        after: after,
        before: before
    };

    pollster.poll(parameterMap, function(pollArray) {
        pollArray.forEach(pollster.clean);
        var responseText = "";

        pollArray.reduce(function(pollArray, poll) {
            poll.questions.forEach(function(question) {
                question.subpopulations.forEach(function(subpopulation) {
                    var pollClone = JSON.parse(JSON.stringify(poll));
                    pollClone.question = JSON.parse(JSON.stringify(question));
                    pollClone.question.subpopulation = subpopulation;

                    delete pollClone.questions;
                    delete pollClone.question.subpopulations;

                    pollArray.push(pollClone);
                });
            });

            return pollArray;
        }, []).sort(function(a, b) {
            if(a.question.type !== b.question.type) {
                if(a.question.type === "election") {
                    return -1;
                } else {
                    return 1;
                }
            } else {
                if(a.question.year !== b.question.year) {
                    if(a.question.year < b.question.year) {
                        return -1;
                    } else {
                        return 1;
                    }
                } else {
                    return 0;
                }
            }
        }).forEach(function(poll) {
            try {
                story.StoryPollGoal.satisfy(poll);
                responseText += poll.text;
            } catch (e) {
                poll.text = undefined;
                responseText += "<div class=\"story\">";
                responseText += JSON.stringify(poll);
                responseText += "</div>";
                console.log(e);
            }
        });

        response.render("index.html", {
            date: moment(before).format("dddd, MMMM Do, YYYY"),
            html: responseText
        });
    });
};

application.use("/", index);
application.use("/index.html", index);
application.use(function(request, response, next) {
    response.send(404);
});

// start the application
application.listen(process.env.PORT || 8000);