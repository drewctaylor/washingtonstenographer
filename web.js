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

var sort = function(a, b) {
    if (pollster.sortQuestionType(a.question.type, b.question.type) === 0) {
        if (pollster.sortQuestionYear(a.question.year, b.question.year) === 0) {
            if (pollster.sortQuestionOffice(a.question.office, b.question.office) === 0) {
                return pollster.sortQuestionSubpopulationResponse(a.question.subpopulation.responses, b.question.subpopulation.responses);
            } else {
                return pollster.sortQuestionOffice(a.question.office, b.question.office);
            }
        } else {
            return pollster.sortQuestionYear(a.question.year, b.question.year);
        }
    } else {
        return pollster.sortQuestionType(a.question.type, b.question.type);
    }
};

var index = function(request, response, next) {
    var before = request.query.date === undefined ? moment().format("YYYY-MM-DD") : moment(request.query.date).format("YYYY-MM-DD");
    var after = moment(before).subtract('days', 7).format("YYYY-MM-DD");

    var parameterMap = {
        after: after,
        before: before
    };

    pollster.poll(parameterMap, function(pollArray) {
        var slugArray = pollArray.reduce(function(previousValue, currentValue) {
            currentValue.questions.forEach(function(question) {
                if (question.chart && previousValue.indexOf(question.chart) === -1) {
                    previousValue.push(question.chart);
                }
            });

            return previousValue;
        }, []);

        pollster.estimate(slugArray, function(chartArray) {
            pollArray.forEach(function(poll) {
                poll.questions.forEach(function(question) {
                    chartArray.forEach(function(chart) {
                        if (question.chart && question.chart === chart.slug) {
                            question.estimates = chart.estimates;
                            question.estimates_by_date = chart.estimates_by_date;
                        }
                    });
                });
            });

            pollArray.forEach(pollster.clean);
            var responseText = "";

            var pollArraySorted = pollArray.reduce(function(pollArray, poll) {
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
            }, []).sort(sort);

            pollArraySorted.forEach(function(pollArray) {
                try {
                    story.StoryPollGoal.satisfy(pollArray);
                    responseText += pollArray.text;
                } catch (e) {
                    console.log(pollArray.question.name);
                }
            });

            response.render("index.html", {
                yesterday: moment(before).subtract('days', 1).format("dddd, MMMM Do, YYYY"),
                yesterdayLink: moment(before).subtract('days', 1).format("YYYY-MM-DD"),
                tomorrow: moment(before).add('days', 1).format("dddd, MMMM Do, YYYY"),
                tomorrowLink: moment(before).add('days', 1).format("YYYY-MM-DD"),
                today: moment(before).format("dddd, MMMM Do, YYYY"),
                html: responseText
            });
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