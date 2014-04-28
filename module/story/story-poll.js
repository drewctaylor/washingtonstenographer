var fs = require('fs');
var mustache = require("mustache");
var moment = require("moment");
var substitute = require("./story-poll-substitute.js").substitute;

var action = require("../universe/story-action.js");
var goal = require("../universe/story-goal.js");

var storyPollDisclaimerGoal = require("./story-poll-disclaimer.js").storyPollDisclaimerGoal();
var storyPollApproval = require("./story-poll-approval.js").storyPollApproval();
var storyPollFavorability = require("./story-poll-favorability.js").storyPollFavorability();
var storyPollGeneral = require("./story-poll-general.js").storyPollGeneral();
var storyPollPrimary = require("./story-poll-primary.js").storyPollPrimary();
var storyPollIdentification = require("./story-poll-identification.js").storyPollIdentification();
var storyPollDirection = require("./story-poll-direction.js").storyPollDirection();
var storyPollGeneric = require("./story-poll-generic.js").storyPollGeneric();
var storyPollSatisfaction = require("./story-poll-satisfaction.js").storyPollSatisfaction();

var storyPollTypeGoal = new goal.Goal("Story - Poll - Type")
        .action(storyPollApproval)
        .action(storyPollFavorability)
        .action(storyPollPrimary)
        .action(storyPollGeneral)
        .action(storyPollIdentification)
        .action(storyPollDirection)
        .action(storyPollGeneric)
        .action(storyPollSatisfaction);

var storyPoll = new action.Action("Story - Poll")
        .thereExists(function(poll) {
            return true;
        })
        .then(function(poll) {
            poll.question.subpopulation.responses = poll.question.subpopulation.responses.sort(function(a, b) {
                return b.value - a.value;
            });

            poll.start_date = moment(poll.start_date).format("dddd, MMMM Do, YYYY");
            poll.end_date = moment(poll.end_date).format("dddd, MMMM Do, YYYY");

            poll.method = poll.method === "mixed" ? "several methods" : poll.method;

            var p = JSON.stringify(poll);

            poll.text = "<div class=\"story\">";

            storyPollTypeGoal.satisfy(poll);
            storyPollDisclaimerGoal.satisfy(poll);
            
            poll.question.subpopulation.responses = poll.question.subpopulation.responses.map(function(response) {
                response.choice = response.last_name ? response.choice : response.choice.split(/\s/gi).map(function(word) {
                    return word.substring(0, 1).toUpperCase() + word.substring(1);
                }).join(" ");
                
                return response;
            });

            poll.text += mustache.render(fs.readFileSync(__dirname + "/poll/poll-table.html", "UTF-8"), poll);

            poll.text += "</div>";
        });

module.exports.StoryPollGoal = new goal.Goal("Story - Poll")
        .action(storyPoll);
