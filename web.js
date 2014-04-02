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
            var responseText = "";

            responseJSON.forEach(function(element) {
                element.questions.forEach(function(question) {
                    responseText += handlebars.compile("<p>{{pollster}} on {{topic}} ...</p>")({
                        method: element.method,
                        pollster: element.pollster,
                        topic: question.chart,
                    });
                });
            });

            response.send('<body>' + responseText + '</body>');
        });
    });

    req.end();

});

var port = process.env.PORT || 5000;
app.listen(port, function() {
    console.log("Listening on " + port);
});

var t1 = 
"Most Americans disapprove of President Obama's performance, according to a \
Rasmussen poll. 51% of likely voters disapproved of the President's \
performance, while 48% approved.";

var t2 = 
"A plurality of Americans favor the Affordable Care Act, according to an \
ABC/Post poll. 49% of adults favored the Affordable Care Act, while 48% opposed.";

var t3 = 
"Democrat-leaning likley voters prefer incumbent Republican Thad Cochran to \
Democrat Travis Childers in the Mississippi Senate race, according to a Rasmussen poll.  48% preferred Cochran, \
31% preferred Childers, 9% preferred some other candidate, and 12% were undecided.";

var t4 = 
"Democrat-leaning likley voters prefer Republican Chris McDaniel to \
Democrat Travis Childers in the Mississippi Senate race, according to a Rasmussen poll.  47% preferred McDaniel, \
35% preferred Childers, 5% preferred some other candidate, and 14% were undecided.";

var t5 = 
"In Missippi, Democrat-leaning likely voters disapprove of President Obama's performance, \
according to a Rasmussen poll. 54% of likely voters disapproved of the President's performance, \
while 44% approved.";