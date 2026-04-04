
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
    
CREATE FUNCTION get_default_role()
RETURNS INT AS $$
  SELECT role_id FROM roles WHERE description = 'user';
$$ LANGUAGE SQL;

CREATE FUNCTION get_admin_role()
RETURNS INT AS $$
  SELECT role_id FROM roles WHERE description = 'admin';
$$ LANGUAGE SQL;
