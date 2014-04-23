var filesystem = require("fs");
var moment = require("moment");
var Promise = require("es6-promise").Promise;
var sql = require("../sql/sql.js");

function jsonEstimateForRow(row) {
    return {
        choice: row.ce_choice,
        value: Number(row.ce_value),
        lead_confidence: Number(row.ce_confidence),
        first_name: row.ce_first_name,
        last_name: row.ce_last_name,
        party: row.ce_party,
        incumbent: row.ce_incumbent
    };
}

function jsonEstimateByDateForRow(row) {
    return {
        date: moment(row.ce_date).format("YYYY-MM-DD"),
        estimates: [jsonEstimateForRow(row)]
    };
}

function jsonChartForRow(row) {
    return {
        title: row.chart_title,
        slug: row.chart_slug,
        topic: row.chart_topic,
        state: row.chart_state,
        poll_count: Number(row.chart_poll_count),
        last_updated: moment(row.chart_update).toISOString(),
        url: row.chart_url,
        estimates: [jsonEstimateForRow(row)]
    };
}

function jsonChartWithEstimateByDateForRow(row) {
    return {
        title: row.chart_title,
        slug: row.chart_slug,
        topic: row.chart_topic,
        state: row.chart_state,
        poll_count: Number(row.chart_poll_count),
        last_updated: moment(row.chart_update).toISOString(),
        url: row.chart_url,
        estimates: [jsonEstimateForRow(row)],
        estimates_by_date: []
    };
}

function jsonChartArrayForRowArray(rowArray) {
    var chartArray = [];

    rowArray.forEach(function(row) {
        if (chartArray[chartArray.length - 1] && chartArray[chartArray.length - 1].slug === row.chart_slug) {
            chartArray[chartArray.length - 1].estimates.push(jsonEstimateForRow(row));
        } else {
            chartArray.push(jsonChartForRow(row));
        }
    });

    return chartArray;
}

function jsonChartForRowArray(rowArray) {
    var chart;

    rowArray.forEach(function(row) {
        if (chart) {
            if (row.ce_date === null) {
                chart.estimates.push(jsonEstimateForRow(row));

            } else {
                var estimateByDateArray = chart.estimates_by_date;

                if (estimateByDateArray[estimateByDateArray.length - 1] && estimateByDateArray[estimateByDateArray.length - 1].date === moment(row.ce_date).format("YYYY-MM-DD")) {
                    estimateByDateArray[estimateByDateArray.length - 1].estimates.push(jsonEstimateForRow(row));
                } else {
                    estimateByDateArray.push(jsonEstimateByDateForRow(row));
                }
            }
        } else {
            chart = jsonChartWithEstimateByDateForRow(row);
        }
    });

    return chart;
}

function jsonResponseForRow(row) {
    return {
        id: row.response_id,
        choice: row.response_choice,
        value: Number(row.response_value),
        first_name: row.response_first_name,
        last_name: row.response_last_name,
        party: row.response_party,
        incumbent: row.response_incumbent
    };
}

function jsonSubpopulationForRow(row) {
    return {
        id: row.subpopulation_id,
        name: row.subpopulation_name,
        observations: Number(row.subpopulation_observations),
        margin_of_error: Number(row.subpopulation_margin_of_error),
        responses: [jsonResponseForRow(row)]
    };
}

function jsonQuestionForRow(row) {
    return {
        id: row.question_id,
        name: row.question_name,
        chart: row.question_chart,
        topic: row.question_topic,
        state: row.question_state,
        subpopulations: [jsonSubpopulationForRow(row)]
    };
}

function jsonPollForRow(row) {
    return {
        id_internal: row.poll_id,
        id: row.poll_id_external,
        pollster: row.poll_pollster,
        start_date: moment(row.poll_start_date).format("YYYY-MM-DD"),
        end_date: moment(row.poll_end_date).format("YYYY-MM-DD"),
        method: row.poll_method,
        source: row.poll_source,
        last_updated: moment(row.poll_update).toISOString(),
        survey_houses: JSON.parse(row.poll_pollster_array),
        sponsors: JSON.parse(row.poll_sponsor_array),
        questions: [jsonQuestionForRow(row)]
    };
}

function jsonPollArrayForRowArray(rowArray) {
    var pollArray = [];

    rowArray.forEach(function(row) {
        if (pollArray[pollArray.length - 1] && pollArray[pollArray.length - 1].id === row.poll_id_external) {
            var questionArray = pollArray[pollArray.length - 1].questions;

            if (questionArray[questionArray.length - 1].id === row.question_id) {
                var subpopulationArray = questionArray[questionArray.length - 1].subpopulations;

                if (subpopulationArray[subpopulationArray.length - 1].id === row.subpopulation_id) {
                    var responseArray = subpopulationArray[subpopulationArray.length - 1].responses;

                    responseArray.push(jsonResponseForRow(row));
                } else {
                    subpopulationArray.push(jsonSubpopulationForRow(row));
                }
            } else {
                questionArray.push(jsonQuestionForRow(row));
            }
        } else {
            pollArray.push(jsonPollForRow(row));
        }
    });

    return pollArray;
}

function Charts(connectionDescriptor) {
    if (connectionDescriptor === undefined)
        throw "connectionDescriptor === undefined";

    var stateValue;
    var topicValue;

    this.state = function(stateValueIn) {
        if (stateValueIn === undefined)
            throw "stateValueIn === undefined";

        stateValue = stateValueIn;

        return this;
    };

    this.topic = function(topicValueIn) {
        if (topicValueIn === undefined)
            throw "topicValueIn === undefined";

        topicValue = topicValueIn;

        return this;
    };

    this.promise = function() {
        return new Promise(function(resolve, reject) {
            var statement = "SELECT * FROM chart INNER JOIN chart_estimate ON chart.chart_id = chart_estimate.ce_chart ";
            var parameterIndex = 1;
            var parameterArray = [];

            if (stateValue !== undefined ||
                    topicValue !== undefined) {

                statement = statement + "WHERE ";
            }

            statement = statement + (stateValue !== undefined ? "chart_state = $" + parameterIndex++ + " AND " : "");
            statement = statement + (topicValue !== undefined ? "chart_topic = $" + parameterIndex++ + " AND " : "");
            statement = statement + " ce_date IS NULL";

            stateValue !== undefined ? parameterArray.push(stateValue) : undefined;
            topicValue !== undefined ? parameterArray.push(topicValue) : undefined;

            var connection = sql.connectionFactory(connectionDescriptor).connection();

            connection.enqueue([statement, parameterArray]);

            connection.promise().then(function(rowArray) {

                resolve(jsonChartArrayForRowArray(rowArray));
            }, reject);
        });
    };

}

function Chart(connectionDescriptor, chartValue) {
    if (connectionDescriptor === undefined)
        throw "connectionDescriptor === undefined";

    if (chartValue === undefined)
        throw "chartValue === undefined";

    this.promise = function() {
        return new Promise(function(resolve, reject) {
            var statement = "SELECT * FROM chart LEFT JOIN chart_estimate ON chart_id = ce_chart WHERE chart_slug = $1 ORDER BY ce_date desc";
            var parameterArray = [chartValue];

            var connection = sql.connectionFactory(connectionDescriptor).connection();

            connection.enqueue([statement, parameterArray]);

            connection.promise().then(function(rowArray) {
                resolve(jsonChartForRowArray(rowArray));
            }, reject);
        });
    };

}

function Poll(connectionDescriptor) {
    if (connectionDescriptor === undefined)
        throw "connectionDescriptor === undefined";

    var fromValue;
    var pageValue;
    var chartValue;
    var stateValue;
    var topicValue;
    var beforeValue;
    var afterValue;
    var updateValue;

    this.from = function(fromValueIn) {
        if (pageValue !== undefined)
            throw "pageValue !== undefined";
        if (Number.isNaN(parseInt(fromValueIn)))
            throw "Number.isNaN(parseInt(fromValueIn))";

        fromValue = parseInt(fromValueIn);

        return this;
    };

    this.page = function(pageValueIn) {
        if (fromValue !== undefined)
            throw "fromValue !== undefined";
        if (Number.isNaN(parseInt(pageValueIn)))
            throw "Number.isNaN(parseInt(pageValueIn))";

        pageValue = parseInt(pageValueIn);

        return this;
    };

    this.chart = function(chartValueIn) {
        if (chartValueIn === undefined)
            throw "chartValueIn === undefined";

        chartValue = chartValueIn;

        return this;
    };

    this.state = function(stateValueIn) {
        if (stateValueIn === undefined)
            throw "stateValueIn === undefined";

        stateValue = stateValueIn;

        return this;
    };

    this.topic = function(topicValueIn) {
        if (topicValueIn === undefined)
            throw "topicValueIn === undefined";

        topicValue = topicValueIn;

        return this;
    };

    this.endedBefore = function(beforeValueIn) {
        if (!moment(beforeValueIn).isValid())
            throw "!moment(beforeValueIn).isValid()";
        if (afterValue && afterValue > moment(beforeValueIn))
            throw "afterValue && afterValue > moment(beforeValueIn)";

        beforeValue = moment(beforeValueIn);

        return this;
    };

    this.endedAfter = function(afterValueIn) {
        if (!moment(afterValueIn).isValid())
            throw "!moment(afterValueIn).isValid()";
        if (beforeValue && beforeValue < moment(afterValueIn))
            throw "beforeValue && beforeValue < moment(afterValueIn)";

        afterValue = moment(afterValueIn);

        return this;
    };

    this.updatedSince = function(updateValueIn) {
        if (!moment(updateValueIn).isValid())
            throw "!moment(updateValueIn).isValid()";

        updateValue = moment(updateValueIn);

        return this;
    };

    this.promise = function() {
        return new Promise(function(resolve, reject) {
            var statement = "SELECT DISTINCT poll.poll_id_external, poll.poll_update FROM poll INNER JOIN question ON poll_id = question_poll ";
            var parameterIndex = 1;
            var parameterArray = [];

            if (fromValue !== undefined ||
                    pageValue !== undefined ||
                    chartValue !== undefined ||
                    stateValue !== undefined ||
                    topicValue !== undefined ||
                    beforeValue !== undefined ||
                    afterValue !== undefined ||
                    updateValue !== undefined) {
                statement = statement + "WHERE ";
            }

            statement = statement + (chartValue !== undefined ? "question_chart = $" + parameterIndex++ + " AND " : "");
            statement = statement + (stateValue !== undefined ? "question_state = $" + parameterIndex++ + " AND " : "");
            statement = statement + (topicValue !== undefined ? "question_topic = $" + parameterIndex++ + " AND " : "");
            statement = statement + (beforeValue !== undefined ? "poll_end_date <= $" + parameterIndex++ + " AND " : "");
            statement = statement + (afterValue !== undefined ? "poll_end_date >= $" + parameterIndex++ + " AND " : "");
            statement = statement.substring(0, statement.length - 4);

            statement = statement + "ORDER BY poll_update DESC ";

            if (fromValue === undefined && pageValue === undefined) {
                fromValue = 1;
            }

            if (fromValue !== undefined) {
                statement = statement + (fromValue !== undefined ? "OFFSET " + (fromValue - 1) * 10 : "");
            } else if (pageValue !== undefined) {
                statement = statement + (pageValue !== undefined ? "OFFSET " + (pageValue - 1) * 10 + " LIMIT 10 " : "");
            }

            chartValue !== undefined ? parameterArray.push(chartValue) : undefined;
            stateValue !== undefined ? parameterArray.push(stateValue) : undefined;
            topicValue !== undefined ? parameterArray.push(topicValue) : undefined;
            beforeValue !== undefined ? parameterArray.push(beforeValue.format("YYYY-MM-DD")) : undefined;
            afterValue !== undefined ? parameterArray.push(afterValue.format("YYYY-MM-DD")) : undefined;

            var connection = sql.connectionFactory(connectionDescriptor).connection();

            connection.enqueue([statement, parameterArray]);

            connection.promise().then(function(rowArray) {
                if (rowArray.length === 0) {
                    return [];
                } else {
                    var idArray = rowArray.map(function(element) {
                        return element.poll_id_external;
                    }).join(", ");
                    var statement = "SELECT * FROM poll INNER JOIN question ON poll_id = question_poll INNER JOIN subpopulation ON question_id = subpopulation_question INNER JOIN response ON subpopulation_id = response_subpopulation WHERE poll_id_external IN (" + idArray + ")";

                    var connection = sql.connectionFactory(connectionDescriptor).connection();

                    connection.enqueue([statement]);

                    return connection.promise();
                }
            }, reject).then(function(rowArray) {

                resolve(jsonPollArrayForRowArray(rowArray));
            }, reject);
        });
    };
}

exports.initialize = function(connectionDescriptor) {
    return {
        chart: function(chartValue) {
            return new Chart(connectionDescriptor, chartValue);
        },
        charts: function() {
            return new Charts(connectionDescriptor);
        },
        poll: function() {
            return new Poll(connectionDescriptor);
        }
    };
};