var action = require("./story-action.js");
var goal = require("./story-goal.js");
var substitute = require("./story-poll-substitute.js").substitute;

var storyPollFavorabilityTypeGoal = new goal.Goal("Story - Poll - Favorability - Type")
        .action(new action.Action("Story - Poll - Favorability - Favorable")
                .thereExists(function(poll) {
                    return poll.calculation.net > 0 && Math.abs(poll.calculation.net) > 2 * poll.question.subpopulation.margin_of_error;
                })
                .then(substitute("/poll/poll-favorability-favorable.html")))
        .action(new action.Action("Story - Poll - Favorability - Unfavorable")
                .thereExists(function(poll) {
                    return poll.calculation.net < 0 && Math.abs(poll.calculation.net) > 2 * poll.question.subpopulation.margin_of_error;
                })
                .then(substitute("/poll/poll-favorability-unfavorable.html")))
        .action(new action.Action("Story - Poll - Favorability - Divided")
                .thereExists(function(poll) {
                    return Math.abs(poll.calculation.net) <= 2 * poll.question.subpopulation.margin_of_error;
                })
                .then(substitute("/poll/poll-favorability-divided.html")));

exports.storyPollFavorability = function() {
    return new action.Action("Story - Poll - Favorability")
            .thereExists(function(poll) {
                return poll.question.type.name === "favorability";
            })
            .then(function(poll) {
                poll.question.subpopulation.responses.sort(function(a, b) {
                    if(a.choice.toLowerCase().indexOf("favorable") !== -1 && b.choice.toLowerCase().indexOf("favorable") !== -1) {
                        if(a.choice.toLowerCase().indexOf("unfavorable") !== -1 && b.choice.toLowerCase().indexOf("unfavorable") !== -1) {
                            return a.choice.toLowerCase().localeCompare(b.choice.toLowerCase());
                        } else if(a.choice.toLowerCase().indexOf("unfavorable") !== -1) {
                            return 1;
                        } else {
                            return -1;
                        }
                    } else if(a.choice.toLowerCase().indexOf("favorable") !== -1 ) {
                        return -1;
                    } else if(b.choice.toLowerCase().indexOf("favorable") !== -1 ) {
                        return 1;
                    } else  {
                        return a.choice.toLowerCase().localeCompare(b.choice.toLowerCase());
                    }
                });
                
                poll.calculation = {};
                poll.calculation.favorable = poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                    return previousValue + (currentValue.choice.toLowerCase().indexOf("favorable") !== -1 && currentValue.choice.toLowerCase().indexOf("unfavorable") === -1 ? currentValue.value : 0);
                }, 0);

                poll.calculation.unfavorable = poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                    return previousValue + (currentValue.choice.toLowerCase().indexOf("favorable") !== -1 && currentValue.choice.toLowerCase().indexOf("unfavorable") !== -1 ? currentValue.value : 0);
                }, 0);

                poll.calculation.undecided = poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                    return previousValue + (currentValue.choice.toLowerCase() === "undecided" ? currentValue.value : 0);
                }, 0);

                poll.calculation.net = poll.calculation.favorable - poll.calculation.unfavorable;

                storyPollFavorabilityTypeGoal.satisfy(poll);
            });
};