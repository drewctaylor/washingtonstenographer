var express = require("express");
var http = require("http");
var handlebars = require("handlebars");

var app = express();
app.use(express.logger());

app.get("/", function(request, response) {
    var options = {
        hostname: "elections.huffingtonpost.com",
        port: 80,
        path: "/pollster/api/polls.json",
        method: "GET"
    };

    response.set('Content-Type', 'text/html');

    var req = http.request(options, function(res) {
        var responseData = [];
        res.on('data', function(chunk) {
            responseData.push(chunk);
        });

        res.on('end', function() {
            var responseJSON = JSON.parse(Buffer.concat(responseData));
            var responseText = "<html><head><link href='http://fonts.googleapis.com/css?family=Domine' rel='stylesheet' type='text/css'></head><body style='width: 500px; margin: 10px auto'>";

            responseJSON.forEach(function(poll) {
                poll.questions.forEach(function(question) {
                    question.subpopulations.forEach(function(subpopulation) {
                        var approveValue;
                        var disapproveValue;

                        subpopulation.responses.forEach(function(response) {
                            if (response.choice === "Approve") {
                                approveValue = response.value;
                            }

                            if (response.choice === "Disapprove") {
                                disapproveValue = response.value;
                            }
                        });

                        if (question.chart === "obama-job-approval") {
                            if (approveValue < disapproveValue) {
                                responseText += handlebars.compile(disapprove)({
                                    pollster: poll.pollster,
                                    subpopulation: rewriteSubpopuationName(subpopulation.name.toLowerCase()),
                                    approve: approveValue,
                                    disapprove: disapproveValue,
                                });
                            } else {
                                responseText += handlebars.compile(approve)({
                                    pollster: poll.pollster,
                                    subpopulation: rewriteSubpopuationName(subpopulation.name.toLowerCase()),
                                    approve: approveValue,
                                    disapprove: disapproveValue,
                                });
                            }
                        }
                    });
                });
            });

            response.send(responseText + '</body></html>');
        });
    });

    req.end();

});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});

var disapprove =
        "<h4>{{pollster}}: {{disapprove}}% Disapprove, {{approve}}% Approve of Obama's Performance</h4> \
<p>Most {{subpopulation}} disapprove of President Obama's performance, according to a \
{{pollster}} poll. {{disapprove}}% of {{subpopulation}} disapproved of the President's \
performance, while {{approve}}% approve. {{rest}}</p>";

var approve =
        "<h4>{{pollster}}: {{approve}}% Approve, {{disapprove}}% Disapprove of Obama's Performance</h4> \
<p>Most {{subpopulation}} disapprove of President Obama's performance, according to a \
{{pollster}} poll. {{approve}}% of {{subpopulation}} approved of the President's \
performance, while {{disapprove}}% disapproved. {{rest}}</p>";

function rewriteSubpopuationName(name) {
    if (name === "registered voters - republican") {
        return "Republican registered voters";
    } else
    if (name === "registered voters - democrat") {
        return "Democratic registered voters";
    } else
    if (name === "registered voters - independent") {
        return "independent registered voters";
    } else {
        return name;
    }
}