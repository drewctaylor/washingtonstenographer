var express = require("express");
var http = require("http");
var engineSet = require("consolidate");
var moment = require("moment");
var pollster = require("./module/pollster/pollster-sql.js").initialize(process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/POLLSTER");
var sort = require("./module/pollster/pollster-sort.js").sort
var clean = require("./module/pollster/pollster-clean.js").clean;
var story = require("./module/story/story-poll.js");
var Promise = require("es6-promise").Promise;

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

    pollster.poll().endedAfter(after).endedBefore(before).promise().then(function(pollArray) {
        var slugArray = pollArray.reduce(function(previousValue, currentValue) {
            currentValue.questions.forEach(function(question) {
                if (question.chart && previousValue.indexOf(question.chart) === -1) {
                    previousValue.push(question.chart);
                }
            });

            return previousValue;
        }, []);

        pollArray.forEach(clean);
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
        }, [])

        if (request.query.nosort === undefined) {
            pollArraySorted = pollArraySorted.sort(sort);
        } else {
            pollArraySorted = pollArraySorted.sort(function(a, b) {
                return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
            });
        }
        
        pollArraySorted.forEach(function(poll) {
            try {
                story.StoryPollGoal.satisfy(poll);
                responseText += poll.text;
            } catch (e) {
                console.log(poll);
                console.log(e.stack);
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
    }).catch(function(error) {
        console.log(error.stack);
    });
};

application.use("/", index);
application.use("/index.html", index);
application.use(function(request, response, next) {
    response.send(404);
});

// start the application
application.listen(process.env.PORT || 8000);

//        Promise.all(slugArray.map(function(slug) {
//            return pollster.chart(slug).promise();
//        })).then(function(chartArray) {
//            pollArray.forEach(function(poll) {
//                poll.questions.forEach(function(question) {
//                    chartArray.forEach(function(chart) {
//                        if (question.chart && question.chart === chart.slug) {
//                            question.estimates = chart.estimates;
//                            question.estimates_by_date = chart.estimates_by_date;
//                        }
//                    });
//                });
//            });
//        });

