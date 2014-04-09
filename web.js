(function() {
    var express = require("express");
    var http = require("http");
    var engineSet = require("consolidate");
    var handlebars = require("handlebars");
    var moment = require("moment");

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

    application.use("/index.html", function(request, response, next) {

        var rightdirection =
                "<h4>{{pollster}}: {{rightdirection}}% Right Direction, {{wrongtrack}}% Wrong Track</h4> \
<p>Most {{subpopulation}} say America is heading in the right direction, according to a \
{{pollster}} poll. {{wrongtrack}}% of {{subpopulation}} say America is on the wrong track.</p>\n\
<code>{{rest}}</code>";

        var wrongtrack =
                "<h4>{{pollster}}: {{wrongtrack}}% Wrong Track, {{rightdirection}}% Right Direction</h4> \
<p>Most {{subpopulation}} say America is on the wrong track, according to a \
{{pollster}} poll. {{rightdirection}}% of {{subpopulation}} say America is heading in the right direction.</p>\n\
<code>{{rest}}</code>";

        var candidate =
                "<h4>{{pollster}}: {{first_name}} {{first_number}}%, {{second_name}} {{second_number}}%</h4> \
<p>{{first_name}} leads {{second_name}}, {{first_number}}% to {{second_number}}%, among {{subpopulation}}, according to a {{pollster}} poll. </p>";

        var disapprove =
                "<h4>{{pollster}}: {{disapprove}}% Disapprove, {{approve}}% Approve of Obama's Performance</h4> \
<p>Most {{subpopulation}} disapprove of President Obama's performance, according to a \
{{pollster}} poll. {{disapprove}}% of {{subpopulation}} disapproved of the President's \
performance, while {{approve}}% approve.</p>\n\
<code>{{rest}}</code>";

        var approve =
                "<h4>{{pollster}}: {{approve}}% Approve, {{disapprove}}% Disapprove of Obama's Performance</h4> \
<p>Most {{subpopulation}} approve of President Obama's performance, according to a \
{{pollster}} poll. {{approve}}% of {{subpopulation}} approved of the President's \
performance, while {{disapprove}}% disapproved.</p>\n\
<code>{{rest}}</code>";

        var congressdisapprove =
                "<h4>{{pollster}}: {{disapprove}}% Disapprove, {{approve}}% Approve of Congress' Performance</h4> \
<p>Most {{subpopulation}} disapprove of Congress' performance, according to a \
{{pollster}} poll. {{disapprove}}% of {{subpopulation}} disapproved of the Congress' \
performance, while {{approve}}% approve.</p>\n\
<code>{{rest}}</code>";

        var congressapprove =
                "<h4>{{pollster}}: {{approve}}% Approve, {{disapprove}}% Disapprove of Congress' Performance</h4> \
<p>Most {{subpopulation}} approve of Congress' performance, according to a \
{{pollster}} poll. {{approve}}% of {{subpopulation}} approved of the Congress' \
performance, while {{disapprove}}% disapproved.</p>\n\
<code>{{rest}}</code>";

        var subjectdisapprove =
                "<h4>{{pollster}}: On {{subject}}, {{disapprove}}% Disapprove, {{approve}}% Approve of Obama's Performance</h4> \
<p>When it comes to {{subject}}, most {{subpopulation}} disapprove of President Obama's performance, according to a \
{{pollster}} poll. {{disapprove}}% of {{subpopulation}} disapproved of the President's \
performance, while {{approve}}% approve.</p>\n\
<code>{{rest}}</code>";

        var subjectapprove =
                "<h4>{{pollster}}: On {{subject}}, {{approve}}% Approve, {{disapprove}}% Disapprove of Obama's Performance</h4> \
<p>When it comes to {{subject}}, most {{subpopulation}} approve of President Obama's performance, according to a \
{{pollster}} poll. {{approve}}% of {{subpopulation}} approved of the President's \
performance, while {{disapprove}}% disapproved.</p>\n\
<code>{{rest}}</code>";

        var favorable =
                "<h4>{{pollster}}: {{favorable}}% Favorable for {{candidate}}</h4> \
<p>Most {{subpopulation}} hold a favorable opinion of {{candidate}}, according to a \
{{pollster}} poll. {{unfavorable}}% hold an unfavorable opinion.</p>\n\
<code>{{rest}}</code>";

        var unfavorable =
                "<h4>{{pollster}}: {{unfavorable}}% Unfavorable for {{candidate}}</h4> \
<p>Most {{subpopulation}} hold an unfavorable opinion of {{candidate}}, according to a \
{{pollster}} poll. {{favorable}}% hold an favorable opinion.</p>\n\
<code>{{rest}}</code>";

        var date =
                "<p>{{pollster}} interviewed {{observations}} {{subpopulation}} between between {{start}} and {{end}}. The poll has a margin of error of +/-{{margin_of_error}}%.</p>"

        function rewriteSubpopuationName(name) {
            if (name === "likely voters - republican") {
                return "Republican likely voters";
            } else
            if (name === "likely voters - democrat") {
                return "Democratic likely voters";
            } else
            if (name === "registered voters - republican") {
                return "Republican registered voters";
            } else
            if (name === "registered voters - democrat") {
                return "Democratic registered voters";
            } else
            if (name === "adults - democrat") {
                return "Democrats";
            } else
            if (name === "adults - republican") {
                return "Republicans";
            } else
            if (name === "adults - independent") {
                return "independents";
            } else
            if (name === "registered voters - independent") {
                return "independent registered voters";
            } else {
                return name;
            }
        }

        function rewriteCandidateName(chart) {
            if (chart.indexOf("Obama") !== -1) {
                return "Barack Obama";
            }
            else if (chart.indexOf("Christie") !== -1) {
                return "Chris Christie";
            }
            else if (chart.indexOf("Boehner") !== -1) {
                return "John Boehner";
            }
            else if (chart.indexOf("Biden") !== -1) {
                return "Joe Biden";
            }
            else if (chart.indexOf("McConnell") !== -1) {
                return "Mitch McConnell";
            }
            else if (chart.indexOf("Reid") !== -1) {
                return "Harry Reid";
            }
            else if (chart.indexOf("Pelosi") !== -1) {
                return "Nancy Pelosi";
            }
            else if (chart.indexOf("Cuomo") !== -1) {
                return "Andrew Cuomo";
            }
            else if (chart.indexOf("Malley") !== -1) {
                return "Martin O'Malley";
            }
            else if (chart.indexOf("Warren") !== -1) {
                return "Elizabeth Warren";
            } else {
                return chart;
            }
        }
        var options = {
            hostname: "elections.huffingtonpost.com",
            port: 80,
            path: "/pollster/api/polls.json?page=2",
            method: "GET"
        };

        var req = http.request(options, function(res) {
            var responseData = [];
            res.on('data', function(chunk) {
                responseData.push(chunk);
            });

            res.on('end', function() {
                var responseJSON = JSON.parse(Buffer.concat(responseData));
                var responseText = "";

                responseJSON.forEach(function(poll) {
                    poll.questions.forEach(function(question) {
                        question.subpopulations.forEach(function(subpopulation) {
                            responseText += "<div class=\"story\">";

                            if (question.chart && question.chart.indexOf("obama-job-approval") !== -1) {
                                var approveValue;
                                var disapproveValue;
                                subpopulation.responses.forEach(function(response) {
                                    if (response.choice.toLowerCase() === "approve" || response.choice.toLowerCase() === "strongly approve" || response.choice.toLowerCase() === "somewhat approve") {
                                        approveValue = response.value;
                                    }

                                    if (response.choice.toLowerCase() === "disapprove" || response.choice.toLowerCase() === "strongly disapprove" || response.choice.toLowerCase() === "somewhat disapprove") {
                                        disapproveValue = response.value;
                                    }
                                });
                                if (approveValue < disapproveValue) {
                                    responseText += handlebars.compile(disapprove)({
                                        pollster: poll.pollster,
                                        subpopulation: question.state + " " + rewriteSubpopuationName(subpopulation.name.toLowerCase()),
                                        approve: approveValue,
                                        disapprove: disapproveValue,
                                    });
                                } else {
                                    responseText += handlebars.compile(approve)({
                                        pollster: poll.pollster,
                                        subpopulation: question.state + " " + rewriteSubpopuationName(subpopulation.name.toLowerCase()),
                                        approve: approveValue,
                                        disapprove: disapproveValue,
                                    });
                                }

                                responseText += handlebars.compile(date)({
                                    start: moment(poll.start_date).format("dddd, MMMM Do, YYYY"),
                                    end: moment(poll.end_date).format("dddd, MMMM Do, YYYY"),
                                    pollster: poll.pollster,
                                    observations: subpopulation.observations,
                                    subpopulation: question.state + " " + rewriteSubpopuationName(subpopulation.name.toLowerCase()),
                                    margin_of_error: subpopulation.margin_of_error
                                });
                            }
                            else if (question.chart === "congress-job-approval") {
                                var approveValue;
                                var disapproveValue;
                                subpopulation.responses.forEach(function(response) {
                                    if (response.choice === "Approve" || response.choice === "Strongly Approve" || response.choice === "Somewhat Approve") {
                                        approveValue = response.value;
                                    }

                                    if (response.choice === "Disapprove" || response.choice === "Strongly Disapprove" || response.choice === "Somewhat Disapprove") {
                                        disapproveValue = response.value;
                                    }
                                });
                                if (approveValue < disapproveValue) {
                                    responseText += handlebars.compile(congressdisapprove)({
                                        pollster: poll.pollster,
                                        subpopulation: question.state + " " + rewriteSubpopuationName(subpopulation.name.toLowerCase()),
                                        approve: approveValue,
                                        disapprove: disapproveValue,
                                    });
                                } else {
                                    responseText += handlebars.compile(congressapprove)({
                                        pollster: poll.pollster,
                                        subpopulation: question.state + " " + rewriteSubpopuationName(subpopulation.name.toLowerCase()),
                                        approve: approveValue,
                                        disapprove: disapproveValue,
                                    });
                                }

                                responseText += handlebars.compile(date)({
                                    start: moment(poll.start_date).format("dddd, MMMM Do, YYYY"),
                                    end: moment(poll.end_date).format("dddd, MMMM Do, YYYY"),
                                    pollster: poll.pollster,
                                    observations: subpopulation.observations,
                                    subpopulation: question.state + " " + rewriteSubpopuationName(subpopulation.name.toLowerCase()),
                                    margin_of_error: subpopulation.margin_of_error
                                });
                            }
                            else if (question.chart === "obama-job-approval-health" || question.chart === "obama-job-approval-economy") {
                                var approveValue;
                                var disapproveValue;

                                subpopulation.responses.forEach(function(response) {
                                    if (response.choice === "Approve" || response.choice === "Strongly Approve" || response.choice === "Somewhat Approve") {
                                        approveValue = response.value;
                                    }

                                    if (response.choice === "Disapprove" || response.choice === "Strongly Disapprove" || response.choice === "Somewhat Disapprove") {
                                        disapproveValue = response.value;
                                    }
                                });

                                if (approveValue < disapproveValue) {
                                    responseText += handlebars.compile(subjectdisapprove)({
                                        pollster: poll.pollster,
                                        subpopulation: question.state + " " + rewriteSubpopuationName(subpopulation.name.toLowerCase()),
                                        approve: approveValue,
                                        disapprove: disapproveValue,
                                        subject: question.chart.indexOf("economy") !== -1 ? "the economy" : "health care"
                                    });
                                } else {
                                    responseText += handlebars.compile(subjectapprove)({
                                        pollster: poll.pollster,
                                        subpopulation: question.state + " " + rewriteSubpopuationName(subpopulation.name.toLowerCase()),
                                        approve: approveValue,
                                        disapprove: disapproveValue,
                                        subject: question.chart.indexOf("economy") !== -1 ? "the economy" : "health care"
                                    });
                                }

                                responseText += handlebars.compile(date)({
                                    start: moment(poll.start_date).format("dddd, MMMM Do, YYYY"),
                                    end: moment(poll.end_date).format("dddd, MMMM Do, YYYY"),
                                    pollster: poll.pollster,
                                    observations: subpopulation.observations,
                                    subpopulation: question.state + " " + rewriteSubpopuationName(subpopulation.name.toLowerCase()),
                                    margin_of_error: subpopulation.margin_of_error
                                });
                            } else if (question.name && question.name.indexOf("Favorable Rating") !== -1) {
                                var favorableValue = 0;
                                var unfavorableValue = 0;

                                subpopulation.responses.forEach(function(response) {
                                    if (response.choice.toLowerCase() === "somewhat favorable" || response.choice.toLowerCase() === "favorable" || response.choice.toLowerCase() === "very favorable") {
                                        favorableValue += response.value;
                                    }

                                    if (response.choice.toLowerCase() === "somewhat unfavorable" || response.choice.toLowerCase() === "unfavorable" || response.choice.toLowerCase() === "very unfavorable") {
                                        unfavorableValue += response.value;
                                    }
                                });

                                if (favorableValue < unfavorableValue) {
                                    responseText += handlebars.compile(unfavorable)({
                                        pollster: poll.pollster,
                                        subpopulation: question.state + " " + rewriteSubpopuationName(subpopulation.name.toLowerCase()),
                                        favorable: favorableValue,
                                        unfavorable: unfavorableValue,
                                        candidate: rewriteCandidateName(question.name),
                                    });
                                } else {
                                    responseText += handlebars.compile(favorable)({
                                        pollster: poll.pollster,
                                        subpopulation: question.state + " " + rewriteSubpopuationName(subpopulation.name.toLowerCase()),
                                        favorable: favorableValue,
                                        unfavorable: unfavorableValue,
                                        candidate: rewriteCandidateName(question.name),
                                    });
                                }

                                responseText += handlebars.compile(date)({
                                    start: moment(poll.start_date).format("dddd, MMMM Do, YYYY"),
                                    end: moment(poll.end_date).format("dddd, MMMM Do, YYYY"),
                                    pollster: poll.pollster,
                                    observations: subpopulation.observations,
                                    subpopulation: question.state + " " + rewriteSubpopuationName(subpopulation.name.toLowerCase()),
                                    margin_of_error: subpopulation.margin_of_error
                                });
                            } else if (question.chart === "us-right-direction-wrong-track") {
                                var favorableValue = 0;
                                var unfavorableValue = 0;

                                subpopulation.responses.forEach(function(response) {
                                    if (response.choice.toLowerCase() === "right direction") {
                                        favorableValue += response.value;
                                    }

                                    if (response.choice.toLowerCase() === "wrong track") {
                                        unfavorableValue += response.value;
                                    }
                                });

                                if (favorableValue < unfavorableValue) {
                                    responseText += handlebars.compile(wrongtrack)({
                                        pollster: poll.pollster,
                                        subpopulation: question.state + " " + rewriteSubpopuationName(subpopulation.name.toLowerCase()),
                                        rightdirection: favorableValue,
                                        wrongtrack: unfavorableValue,
                                    });
                                } else {
                                    responseText += handlebars.compile(rightdirection)({
                                        pollster: poll.pollster,
                                        subpopulation: question.state + " " + rewriteSubpopuationName(subpopulation.name.toLowerCase()),
                                        rightdirection: favorableValue,
                                        wrongtrack: unfavorableValue,
                                    });
                                }

                                responseText += handlebars.compile(date)({
                                    start: moment(poll.start_date).format("dddd, MMMM Do, YYYY"),
                                    end: moment(poll.end_date).format("dddd, MMMM Do, YYYY"),
                                    pollster: poll.pollster,
                                    observations: subpopulation.observations,
                                    subpopulation: question.state + " " + rewriteSubpopuationName(subpopulation.name.toLowerCase()),
                                    margin_of_error: subpopulation.margin_of_error
                                });

                            } else if (question.name && (question.name.indexOf("Senate") !== -1 || question.name.indexOf("Gubernatorial") !== -1 || question.name.indexOf("Governor") !== -1 || question.name.indexOf("Presidential") !== -1 || question.name.indexOf("Mayor") !== -1 || question.name.indexOf("National House Race") !== -1) || question.name.indexOf("National GOP Primary") !== -1) {
                                var firstName;
                                var secondName;
                                var firstValue;
                                var secondValue;

                                subpopulation.responses.forEach(function(response) {
                                    if (firstName) {
                                        if (response.value > firstValue) {
                                            secondName = firstName;
                                            secondValue = firstValue;
                                            firstName = response.choice;
                                            firstValue = response.value;
                                        } else {
                                            if (secondName) {
                                                if (response.value > secondValue) {
                                                    secondName = response.choice;
                                                    secondValue = response.value;
                                                }
                                            } else {
                                                secondName = response.choice;
                                                secondValue = response.value;
                                            }
                                        }
                                    } else {
                                        firstName = response.choice;
                                        firstValue = response.value;
                                    }
                                });

                                responseText += handlebars.compile(candidate)({
                                    first_name: firstName,
                                    second_name: secondName,
                                    first_number: firstValue,
                                    second_number: secondValue,
                                    subpopulation: question.state + " " + rewriteSubpopuationName(subpopulation.name.toLowerCase()),
                                    pollster: poll.pollster,
                                });

                                responseText += handlebars.compile(date)({
                                    start: moment(poll.start_date).format("dddd, MMMM Do, YYYY"),
                                    end: moment(poll.end_date).format("dddd, MMMM Do, YYYY"),
                                    pollster: poll.pollster,
                                    observations: subpopulation.observations,
                                    subpopulation: question.state + " " + rewriteSubpopuationName(subpopulation.name.toLowerCase()),
                                    margin_of_error: subpopulation.margin_of_error
                                });
                            } else {
                                responseText += "<h4>?</h4>";
                                responseText += "<code>" + JSON.stringify(question) + "</code>";
                            }

                            responseText += "</div>";
                        });
                    });
                });

                response.render("index.html", {
                    date: moment().format("dddd, MMMM Do, YYYY"),
                    html: responseText
                });
            });
        });

        req.end();

    });

    application.use(function(request, response, next) {
        response.send(404);
    });

    // start the application
    application.listen(process.env.PORT || 8000);
})();