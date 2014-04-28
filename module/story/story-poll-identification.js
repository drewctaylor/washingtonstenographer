var action = require("../universe/story-action.js");
var goal = require("../universe/story-goal.js");
var substitute = require("./story-poll-substitute.js").substitute;

var storyPollLead = new action.Action("Story - Poll - Identification - Lead")
        .thereExists(function(poll) {
            return poll.calculation.responseLead.value - poll.calculation.responseFollow.value > 2 * poll.question.subpopulation.margin_of_error;
        })
        .then(function(poll) {
            poll.calculation.identification = poll.calculation.identification.slice(1);

            substitute("/poll/poll-identification-lead.html")(poll);
        });

var storyPollDivided = new action.Action("Story - Poll - Identification - Divided")
        .thereExists(function(poll) {
            return poll.calculation.responseLead.value - poll.calculation.responseFollow.value <= 2 * poll.question.subpopulation.margin_of_error;
        })
        .then(substitute("/poll/poll-identification-divided.html"));

var storyPollDirectionGoal = new goal.Goal("Story - Poll - Identification - Type")
        .action(storyPollLead)
        .action(storyPollDivided);

exports.storyPollIdentification = function() {
    return new action.Action("Story - Poll - Identification")
            .thereExists(function(poll) {
                return poll.question.type.name === "identification";
            })
            .then(function(poll) {
                poll.question.subpopulation.responses = poll.question.subpopulation.responses.sort(function(a, b) {
                    return b.value - a.value;
                });

                poll.calculation = {
                    identification: poll.question.subpopulation.responses.reduce(function(identificationArray, response) {
                        return response.choice.toLowerCase() === "republican" || response.choice.toLowerCase() === "democrat" || response.choice === "independent" ?
                                identificationArray.concat(response) :
                                identificationArray;
                    }, []),
                    responseLead: poll.question.subpopulation.responses[0],
                    responseFollow: poll.question.subpopulation.responses[1]
                };

                storyPollDirectionGoal.satisfy(poll);
            });
};