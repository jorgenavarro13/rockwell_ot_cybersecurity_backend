CREATE OR REPLACE FUNCTION get_or_create_company(p_name TEXT)
RETURNS INT
LANGUAGE plpgsql AS $$
DECLARE
    v_company_id INT;
BEGIN
    INSERT INTO companies(name)
    VALUES (p_name)
    ON CONFLICT (name) DO NOTHING;

    SELECT company_id INTO v_company_id
    FROM companies
    WHERE name = p_name;

    RETURN v_company_id;
END;
$$;


CREATE OR REPLACE FUNCTION fn_keep_highest_racha()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.racha > OLD.racha THEN
        NEW.racha := NEW.racha; -- Keep the new higher score
    ELSE
        NEW.racha := OLD.racha; -- Revert to the old score
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_keep_highest_racha
BEFORE UPDATE OF racha ON matches
FOR EACH ROW
EXECUTE FUNCTION fn_keep_highest_racha();



CREATE OR REPLACE FUNCTION fn_limit_matches_per_user()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
    v_match_count INT;
BEGIN
    SELECT COUNT(*) INTO v_match_count
    FROM matches
    WHERE user_id = NEW.user_id;

    IF v_match_count > 10 THEN
        DELETE FROM matches
        WHERE (user_id, game_id, time_start) = (
            SELECT user_id, game_id, time_start
            FROM matches
            WHERE user_id = NEW.user_id
            ORDER BY time_start ASC
            LIMIT 1
        );
        RAISE NOTICE 'Oldest match for user % deleted (cap of 20 reached).', NEW.user_id;
    END IF;

    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_limit_matches_per_user
AFTER INSERT ON matches
FOR EACH ROW
EXECUTE FUNCTION fn_limit_matches_per_user();


CREATE OR REPLACE FUNCTION fn_init_user_security()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO user_security(user_id) VALUES (NEW.user_id);
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_init_user_security
AFTER INSERT ON users
FOR EACH ROW
EXECUTE FUNCTION fn_init_user_security();


CREATE OR REPLACE FUNCTION fn_auto_ban_on_failed_logins()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.failed_attempts >= 3 THEN
        UPDATE users SET is_banned = TRUE WHERE user_id = NEW.user_id;
        NEW.unban_date := CURRENT_DATE + INTERVAL '30 days';
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_auto_ban_on_failed_logins
BEFORE UPDATE OF failed_attempts ON user_security
FOR EACH ROW
EXECUTE FUNCTION fn_auto_ban_on_failed_logins();


CREATE OR REPLACE FUNCTION fn_renew_deactivation_date()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    NEW.deactivation_date := CURRENT_DATE + INTERVAL '1 year';
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_renew_deactivation_date
BEFORE UPDATE OF total_logins ON user_security
FOR EACH ROW
EXECUTE FUNCTION fn_renew_deactivation_date();


CREATE OR REPLACE FUNCTION fn_count_logins()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE user_security
    SET
        total_logins    = total_logins + 1,
        failed_attempts = 0
    WHERE user_id = NEW.user_id;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_count_logins
AFTER INSERT ON login_logs
FOR EACH ROW
EXECUTE FUNCTION fn_count_logins();

