var action = require("../universe/story-action.js");
var goal = require("../universe/story-goal.js");
var substitute = require("./story-poll-substitute.js").substitute;

var storyPollApprovalTypeGoal = new goal.Goal("Story - Poll - Approval - Type")
        .action(new action.Action("Story - Poll - Approval - Approve")
                .thereExists(function(poll) {
                    return poll.question.type.subject.type === "organization" && poll.calculation.net > 0 && Math.abs(poll.calculation.net) > 2 * poll.question.subpopulation.margin_of_error;
                })
                .then(substitute("/poll/poll-approval-organization-approve.html")))
        .action(new action.Action("Story - Poll - Approval - Disapprove")
                .thereExists(function(poll) {
                    return poll.question.type.subject.type === "organization" && poll.calculation.net < 0 && Math.abs(poll.calculation.net) > 2 * poll.question.subpopulation.margin_of_error;
                })
                .then(substitute("/poll/poll-approval-organization-disapprove.html")))
        .action(new action.Action("Story - Poll - Approval - Divided")
                .thereExists(function(poll) {
                    return poll.question.type.subject.type === "organization" && Math.abs(poll.calculation.net) <= 2 * poll.question.subpopulation.margin_of_error;
                })
                .then(substitute("/poll/poll-approval-organization-divided.html")))
        .action(new action.Action("Story - Poll - Approval - Approve")
                .thereExists(function(poll) {
                    return poll.question.type.subject.type === "person" && poll.calculation.net > 0 && Math.abs(poll.calculation.net) > 2 * poll.question.subpopulation.margin_of_error;
                })
                .then(substitute("/poll/poll-approval-approve.html")))
        .action(new action.Action("Story - Poll - Approval - Disapprove")
                .thereExists(function(poll) {
                    return poll.question.type.subject.type === "person" && poll.calculation.net < 0 && Math.abs(poll.calculation.net) > 2 * poll.question.subpopulation.margin_of_error;
                })
                .then(substitute("/poll/poll-approval-disapprove.html")))
        .action(new action.Action("Story - Poll - Approval - Divided")
                .thereExists(function(poll) {
                    return poll.question.type.subject.type === "person" && Math.abs(poll.calculation.net) <= 2 * poll.question.subpopulation.margin_of_error;
                })
                .then(substitute("/poll/poll-approval-divided.html")));

var storyPollApprovalTypeDetailGoal = new goal.Goal("Story - Poll - Approval - Detail - Type")
        .action(new action.Action("Story - Poll - Approval - Approve")
                .thereExists(function(poll) {
                    return poll.question.type.subject.type === "organization" && poll.calculation.net >= 0;
                })
                .then(substitute("/poll/poll-approval-organization-approve-detail.html")))
        .action(new action.Action("Story - Poll - Approval - Disapprove")
                .thereExists(function(poll) {
                    return poll.question.type.subject.type === "organization" && poll.calculation.net < 0;
                })
                .then(substitute("/poll/poll-approval-organization-disapprove-detail.html")))
        .action(new action.Action("Story - Poll - Approval - Approve")
                .thereExists(function(poll) {
                    return poll.question.type.subject.type === "person" && poll.calculation.net >= 0;
                })
                .then(substitute("/poll/poll-approval-approve-detail.html")))
        .action(new action.Action("Story - Poll - Approval - Disapprove")
                .thereExists(function(poll) {
                    return poll.question.type.subject.type === "person" && poll.calculation.net < 0;
                })
                .then(substitute("/poll/poll-approval-disapprove-detail.html")));

exports.storyPollApproval = function() {
    return new action.Action("Story - Poll - Approval")
            .thereExists(function(poll) {
                return poll.question.type.name === "approval";
            })
            .then(function(poll) {
                poll.question.subpopulation.responses.sort(function(a, b) {
                    if(a.choice.toLowerCase().indexOf("approve") !== -1 && b.choice.toLowerCase().indexOf("approve") !== -1) {
                        if(a.choice.toLowerCase().indexOf("disapprove") !== -1 && b.choice.toLowerCase().indexOf("disapprove") !== -1) {
                            return a.choice.toLowerCase().localeCompare(b.choice.toLowerCase());
                        } else if(a.choice.toLowerCase().indexOf("disapprove") !== -1) {
                            return 1;
                        } else {
                            return -1;
                        }
                    } else if(a.choice.toLowerCase().indexOf("approve") !== -1 ) {
                        return -1;
                    } else if(b.choice.toLowerCase().indexOf("approve") !== -1 ) {
                        return 1;
                    } else  {
                        return a.choice.toLowerCase().localeCompare(b.choice.toLowerCase());
                    }
                });
                
                poll.calculation = {};
                poll.calculation.approve = poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                    return previousValue + (currentValue.choice.toLowerCase().indexOf("approv") !== -1 && currentValue.choice.toLowerCase().indexOf("disapprov") === -1 ? currentValue.value : 0);
                }, 0);

                poll.calculation.disapprove = poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                    return previousValue + (currentValue.choice.toLowerCase().indexOf("approv") !== -1 && currentValue.choice.toLowerCase().indexOf("disapprov") !== -1 ? currentValue.value : 0);
                }, 0);

                poll.calculation.undecided = poll.question.subpopulation.responses.reduce(function(previousValue, currentValue) {
                    return previousValue + (currentValue.choice.toLowerCase() === "undecided" ? currentValue.value : 0);
                }, 0);
                
                poll.calculation.net = poll.calculation.approve - poll.calculation.disapprove;

                storyPollApprovalTypeGoal.satisfy(poll);
                storyPollApprovalTypeDetailGoal.satisfy(poll);
            });
};