
CREATE OR REPLACE PROCEDURE insert_user_country(
    p_id BIGINT,
    p_code VARCHAR
)
LANGUAGE plpgsql
AS $$
    BEGIN
        --- Verificar si el pais existe
        IF NOT EXISTS (SELECT 1 FROM countries WHERE code=p_code) THEN
            RAISE EXCEPTION 'The country with code % does not exist.', p_code;
        end if;

        --- Verificar si el usuario existe
        IF NOT EXISTS (SELECT 1 FROM users WHERE user_id=p_id) THEN
            RAISE EXCEPTION 'The user with ID % does not exist.', p_id;
        end if;

        --- Actualizar el país del usuario
        UPDATE users
        SET country = (SELECT country_id FROM countries WHERE code=p_code)
        WHERE user_id = p_id;


        RAISE NOTICE 'The country of the user with ID % was updated', p_id;

    end;

    $$;




CREATE OR REPLACE PROCEDURE insert_user_phone(
    p_id BIGINT,
    p_phone VARCHAR
)
LANGUAGE plpgsql
AS $$
    BEGIN
        --- Verify if the user exists
        IF NOT EXISTS (SELECT 1 FROM users WHERE user_id=p_id) THEN
            RAISE EXCEPTION 'The user with ID % does not exist', p_id;
        end if;

        ---Verify the number is unique
        IF EXISTS (SELECT 1 FROM users where phone=p_phone) THEN
            RAISE EXCEPTION 'The phone % is not unique',p_phone;
        end if;

        --- Update user phone
        UPDATE users
        SET  phone=p_phone
        WHERE user_id = p_id;

        RAISE NOTICE 'The phone of the user with ID % was updated', p_id;

    end;

    $$;

CREATE OR REPLACE PROCEDURE insert_user_birthday(
    p_id BIGINT,
    p_birthday DATE
)
LANGUAGE plpgsql
AS $$
    BEGIN
        --- Verify if the user exists
        IF NOT EXISTS (SELECT 1 FROM users WHERE user_id=p_id) THEN
            RAISE EXCEPTION 'The user with ID % does not exist', p_id;
        end if;

        --- Update user birthday
        UPDATE users
        SET  birthday=p_birthday
        WHERE user_id = p_id;

        RAISE NOTICE 'The birthday of the user with ID % was updated', p_id;

    end;
    $$;
    

-- Single UPDATE — already atomic, no transaction needed.
CREATE OR REPLACE PROCEDURE sp_failed_login(p_user_id BIGINT)
LANGUAGE plpgsql AS $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM users WHERE user_id = p_user_id) THEN
        RAISE EXCEPTION 'User % not found', p_user_id;
    END IF;

    UPDATE user_security
    SET failed_attempts = failed_attempts + 1
    WHERE user_id = p_user_id;
END;
$$;


-- Multiple dependent writes: needs atomicity.
-- EXCEPTION re-raise rolls back the PL/pgSQL savepoint, undoing all writes on failure.
CREATE OR REPLACE PROCEDURE sp_successful_login(p_user_id BIGINT)
LANGUAGE plpgsql AS $$
DECLARE
    v_is_banned  BOOLEAN;
    v_unban_date DATE;
BEGIN
    SELECT u.is_banned, s.unban_date
    INTO   v_is_banned, v_unban_date
    FROM   users u
    JOIN   user_security s ON s.user_id = u.user_id
    WHERE  u.user_id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'User % not found', p_user_id;
    END IF;

    IF v_is_banned AND v_unban_date IS NOT NULL AND CURRENT_DATE >= v_unban_date THEN
        UPDATE users         SET is_banned  = FALSE WHERE user_id = p_user_id;
        UPDATE user_security SET unban_date = NULL  WHERE user_id = p_user_id;
    END IF;

    UPDATE user_security
    SET failed_attempts   = 0,
        deactivation_date = CURRENT_DATE + INTERVAL '1 year'
    WHERE user_id = p_user_id;

    INSERT INTO login_logs(user_id) VALUES (p_user_id);

EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$;


---- TRIGGERS

---- When in a match/game, if the new score is higher than the previous one, update it

--- When inserting a new person, if the company does not exist, create it.

--- When inserting more than 3 failed login attempts, ban the user.

--- When more than 20 matches are played for the same person, delete the oldest one.