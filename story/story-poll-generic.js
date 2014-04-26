var action = require("./story-action.js");
var goal = require("./story-goal.js");
var substitute = require("./story-poll-substitute.js").substitute;

var storyPollLead = new action.Action("Story - Poll - Congressional Generic Ballot - Lead")
        .thereExists(function(poll) {
            return poll.calculation.responseLead.value - poll.calculation.responseFollow.value > 2 * poll.question.subpopulation.margin_of_error;
        })
        .then(substitute("/poll/poll-generic-lead.html"));

var storyPollDivided = new action.Action("Story - Poll - Congressional Generic Ballot - Divided")
        .thereExists(function(poll) {
            return poll.calculation.responseLead.value - poll.calculation.responseFollow.value <= 2 * poll.question.subpopulation.margin_of_error;
        })
        .then(substitute("/poll/poll-generic-divided.html"));

var storyPollDirectionGoal = new goal.Goal("Story - Poll - Congressional Generic Ballot - Type")
        .action(storyPollLead)
        .action(storyPollDivided);

exports.storyPollGeneric = function() {
    return new action.Action("Story - Poll - Congressional Generic Ballot")
            .thereExists(function(poll) {
                return poll.question.type.name === "congressional generic ballot";
            })
            .then(function(poll) {
                poll.question.subpopulation.responses = poll.question.subpopulation.responses.sort(function(a, b) {
                    return b.value - a.value;
                });

                poll.calculation = {
                    responseLead: poll.question.subpopulation.responses[0],
                    responseFollow: poll.question.subpopulation.responses[1]
                };
                
                storyPollDirectionGoal.satisfy(poll);
            });
};