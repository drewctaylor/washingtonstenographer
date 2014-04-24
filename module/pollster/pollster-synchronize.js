var filesystem = require("fs");
var moment = require("moment");
var pollsterHttp = require("./pollster-http.js");
var sql = require("../sql/sql.js");
var Promise = require("es6-promise").Promise;

function queryArrayForInitialization() {
    return filesystem.readFileSync(__dirname + "/pollster-schema.sql", {encoding: "UTF-8"})
            .split(";")
            .map(function(tableDefinition) {
                return [tableDefinition];
            });
}

function queryArrayForResponse(response) {
    return [["INSERT INTO response (response_subpopulation, response_choice, response_value, response_first_name, response_last_name, response_party, response_incumbent) VALUES (currval('subpopulation_subpopulation_id_seq'), $1, $2, $3, $4, $5, $6)", [
                response.choice,
                response.value,
                response.first_name,
                response.last_name,
                response.party,
                response.incumbent]]];
}

function queryArrayForSubpopulation(subpopulation) {
    return Array.prototype.concat.apply([["INSERT INTO subpopulation (subpopulation_question, subpopulation_name, subpopulation_observations, subpopulation_margin_of_error) VALUES (currval('question_question_id_seq'), $1, $2, $3)", [
                subpopulation.name,
                subpopulation.observations,
                subpopulation.margin_of_error]]],
            subpopulation.responses.map(queryArrayForResponse));
}

function queryArrayForQuestion(question) {
    return Array.prototype.concat.apply([["INSERT INTO question (question_poll, question_name, question_chart, question_topic, question_state) VALUES (currval('poll_poll_id_seq'), $1, $2, $3, $4)", [
                question.name,
                question.chart,
                question.topic,
                question.state]]],
            question.subpopulations.map(queryArrayForSubpopulation));
}

function queryArrayForPoll(poll) {
    return Array.prototype.concat.apply([
        ["DELETE FROM poll WHERE poll_id_external = $1", [poll.id]],
        ["DELETE FROM question WHERE question_poll NOT IN (SELECT poll_id FROM poll)"],
        ["DELETE FROM subpopulation WHERE subpopulation_question NOT IN (SELECT question_id FROM question)"],
        ["DELETE FROM response WHERE response_subpopulation NOT IN (SELECT subpopulation_id FROM subpopulation)"],
        ["INSERT INTO poll (poll_id_external, poll_pollster, poll_start_date, poll_end_date, poll_method, poll_source, poll_update, poll_pollster_array, poll_sponsor_array) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)", [
                poll.id,
                poll.pollster,
                poll.start_date,
                poll.end_date,
                poll.method,
                poll.source,
                poll.last_updated,
                JSON.stringify(poll.survey_houses),
                JSON.stringify(poll.sponsors)
            ]]],
            poll.questions.map(queryArrayForQuestion));
}

function queryArrayForEstimate(estimate) {
    return [["INSERT INTO chart_estimate (ce_chart, ce_date, ce_choice, ce_value, ce_confidence, ce_first_name, ce_last_name, ce_party, ce_incumbent) VALUES (currval('chart_chart_id_seq'), NULL, $1, $2, $3, $4, $5, $6, $7)", [
                estimate.choice,
                estimate.value,
                estimate.lead_confidence,
                estimate.first_name,
                estimate.last_name,
                estimate.party,
                estimate.incumbent
            ]]];
}

function queryArrayForEstimateByDate(estimate_by_date) {
    return estimate_by_date.estimates.map(function(estimate) {
        return ["INSERT INTO chart_estimate (ce_chart, ce_date, ce_choice, ce_value) VALUES (currval('chart_chart_id_seq'), $1, $2, $3)", [
                estimate_by_date.date,
                estimate.choice,
                estimate.value]];
    });
}

function queryArrayForChart(chart) {
    return Array.prototype.concat.apply(
            Array.prototype.concat.apply([
                ["DELETE FROM chart WHERE chart_slug = $1", [chart.slug]],
                ["DELETE FROM chart_estimate WHERE ce_chart NOT IN (SELECT chart_id FROM chart)"],
                ["INSERT INTO chart (chart_title, chart_slug, chart_topic, chart_state, chart_poll_count, chart_update, chart_url) VALUES ($1, $2, $3, $4, $5, $6, $7)", [
                        chart.title,
                        chart.slug,
                        chart.topic,
                        chart.state,
                        chart.poll_count,
                        chart.last_updated,
                        chart.url]]],
                    chart.estimates.map(queryArrayForEstimate)),
            chart.estimates_by_date.map(queryArrayForEstimateByDate));
}

function promiseForInitialization(connectionDescriptor) {
    var connection = sql.connectionFactory(connectionDescriptor).connection();

    queryArrayForInitialization().forEach(function(query) {
        connection.enqueue(query);
    });

    return connection.promise();
}

function promiseForUpdate(connectionDescriptor) {
    var connection = sql.connectionFactory(connectionDescriptor).connection();

    connection.enqueue(["SELECT MAX(poll_update) as update FROM poll"]);

    return connection.promise();
}

function promiseForPollArray(connectionDescriptor, pollArray) {
    var connection = sql.connectionFactory(connectionDescriptor).connection();

    pollArray.map(queryArrayForPoll).forEach(function(queryArray) {
        queryArray.map(function(query) {
            connection.enqueue(query);
        });
    });

    return connection.promise();
}

function promiseForChartArray(connectionDescriptor, chartArray) {
    var connection = sql.connectionFactory(connectionDescriptor).connection();

    chartArray.map(queryArrayForChart).forEach(function(queryArray) {
        queryArray.map(function(query) {
            connection.enqueue(query);
        });
    });

    return connection.promise();
}

exports.synchronize = function(connectionDescriptor) {
    return promiseForInitialization(connectionDescriptor).then(function() {
        console.log("Initialized.");
        return promiseForUpdate(connectionDescriptor);
    }).then(function(rowArray) {
        console.log("Checked.");
        if (rowArray[0].update === null) {
            return pollsterHttp.poll().updatedSince("2014-01-01").promise();
        } else {
            return pollsterHttp.poll().updatedSince(moment(rowArray[0].update).format("YYYY-MM-DD")).promise();
        }
    }).then(function(pollArray) {
        console.log("Checked HTTP.");
        return Promise.all([pollArray, Promise.all(pollArray.reduce(function(questionArray, poll) {
                return questionArray.concat(poll.questions);
            }, []).reduce(function(chartArray, question) {
                return question.chart && chartArray.indexOf(question.chart) === -1 ? chartArray.concat(question.chart) : chartArray;
            }, []).map(function(chart) {
                return pollsterHttp.chart(chart).promise();
            }))]);
    }).then(function(array) {
        return Promise.all([
            promiseForPollArray(connectionDescriptor, array[0]),
            promiseForChartArray(connectionDescriptor, array[1])]);
    }).catch(function(error) {
        console.log(error);
    });
};
