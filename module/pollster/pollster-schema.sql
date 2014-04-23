CREATE TABLE IF NOT EXISTS chart (
    chart_id serial,
    chart_title character varying(1000),
    chart_slug character varying(1000),
    chart_topic character varying(1000),
    chart_state character varying(1000),
    chart_poll_count integer,
    chart_update timestamp without time zone,
    chart_url character varying(1000)
);

CREATE TABLE IF NOT EXISTS chart_estimate (
    ce_id serial,
    ce_chart integer,
    ce_date date,
    ce_choice character varying(1000),
    ce_value numeric,
    ce_confidence numeric,
    ce_first_name character varying(1000),
    ce_last_name character varying(1000),
    ce_party character varying(1000),
    ce_incumbent boolean
);

CREATE TABLE IF NOT EXISTS poll (
    poll_id serial,
    poll_id_external integer,
    poll_pollster character varying(100),
    poll_start_date date,
    poll_end_date date,
    poll_method character varying(20),
    poll_source character varying(500),
    poll_update timestamp without time zone,
    poll_pollster_array character varying(300),
    poll_sponsor_array character varying(300)
);

CREATE TABLE IF NOT EXISTS question (
    question_id serial,
    question_poll integer,
    question_name character varying(100),
    question_chart character varying(100),
    question_topic character varying(100),
    question_state character varying(2)
);

CREATE TABLE IF NOT EXISTS response (
    response_id serial,
    response_subpopulation integer,
    response_choice character varying(100),
    response_value numeric,
    response_first_name character varying(100),
    response_last_name character varying(100),
    response_party character varying(100),
    response_incumbent boolean
);


CREATE TABLE IF NOT EXISTS subpopulation (
    subpopulation_id serial,
    subpopulation_question integer,
    subpopulation_name character varying(100),
    subpopulation_observations integer,
    subpopulation_margin_of_error numeric
);
