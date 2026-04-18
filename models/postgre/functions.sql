CREATE FUNCTION get_default_role()
RETURNS INT AS $$
  SELECT role_id FROM roles WHERE description = 'user';
$$ LANGUAGE SQL;

CREATE FUNCTION get_admin_role()
RETURNS INT AS $$
  SELECT role_id FROM roles WHERE description = 'admin';
$$ LANGUAGE SQL;

CREATE OR REPLACE FUNCTION fn_can_login(p_user_id BIGINT)
RETURNS BOOLEAN
LANGUAGE plpgsql AS $$
     SELECT NOT is_banned AND (deactivation_date IS NULL OR deactivation_date > CURRENT_DATE)
     FROM users u
        JOIN user_security s ON s.user_id = u.user_id
        WHERE u.user_id = p_user_id;
$$;