CREATE OR REPLACE FUNCTION response_insert (
    i_response_subpopulation integer,
    i_response_choice        character varying(100),
    i_response_value         numeric,
    i_response_first_name    character varying(100),
    i_response_last_name     character varying(100),
    i_response_party         character varying(100),
    i_response_incumbent     boolean) 
RETURNS integer 
AS 
$$
BEGIN
    INSERT INTO response (
            response_subpopulation, 
            response_choice, 
            response_value, 
            response_first_name, 
            response_last_name, 
            response_party, 
            response_incumbent) 
        VALUES (
            i_response_subpopulation, 
            i_response_choice, 
            i_response_value, 
            i_response_first_name, 
            i_response_last_name, 
            i_response_party, 
            i_response_incumbent);

    RETURN currval(response_response_id_seq);

END;
$$
LANGUAGE plpgsql;