
-- ============================================================
-- SCHEMA MIGRATION
-- Required before running triggers below
-- ============================================================

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS failed_login_attempts INT NOT NULL DEFAULT 0;


-- ============================================================
-- FUNCTION: get_or_create_company
--
-- WHY function and not trigger:
--   The users table only stores company_id (FK). A BEFORE INSERT
--   trigger on users would never see a company *name* — only an
--   ID that may or may not exist yet. A function lets the caller
--   pass the name and receive a valid ID before the INSERT.
--
-- TRANSACTION NOTE (see analysis at bottom):
--   Uses ON CONFLICT to be safe under concurrent calls.
-- ============================================================

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


-- ============================================================
-- TRIGGER 1: Keep highest score per match session
--
-- WHY BEFORE and not AFTER:
--   BEFORE lets us mutate NEW.score directly, avoiding a second
--   UPDATE that would re-fire the trigger.
-- ============================================================

CREATE OR REPLACE FUNCTION fn_keep_highest_score()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.score < OLD.score THEN
        NEW.score := OLD.score;
        NEW.aciertos := OLD.aciertos;
        NEW.power_ups := OLD.power_ups;
        NEW.racha := OLD.racha;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_keep_highest_score
BEFORE UPDATE OF score ON matches
FOR EACH ROW
EXECUTE FUNCTION fn_keep_highest_score();


-- ============================================================
-- TRIGGER 2: Auto-ban user after 3 failed login attempts
--
-- WHY BEFORE and not AFTER:
--   We intercept the UPDATE row and flip is_banned in the same
--   write, so no second statement fires and no extra round-trip
--   occurs.
-- Requires: failed_login_attempts column (migration above).
-- ============================================================

CREATE OR REPLACE FUNCTION fn_auto_ban_on_failed_logins()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
BEGIN
    IF NEW.failed_login_attempts >= 3 THEN
        NEW.is_banned := TRUE;
        NEW.failed_login_attempts := 0;
        RAISE NOTICE 'User % has been banned after % failed login attempts.',
            NEW.user_id, OLD.failed_login_attempts + 1;
    END IF;
    RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_auto_ban_on_failed_logins
BEFORE UPDATE OF failed_login_attempts ON users
FOR EACH ROW
EXECUTE FUNCTION fn_auto_ban_on_failed_logins();


-- ============================================================
-- TRIGGER 3: Enforce 20-match cap per user (delete oldest)
--
-- WHY AFTER and not BEFORE:
--   The new row must already be committed to the table so the
--   COUNT includes it, giving the correct total before we prune.
-- ============================================================

CREATE OR REPLACE FUNCTION fn_limit_matches_per_user()
RETURNS TRIGGER
LANGUAGE plpgsql AS $$
DECLARE
    v_match_count INT;
BEGIN
    SELECT COUNT(*) INTO v_match_count
    FROM matches
    WHERE user_id = NEW.user_id;

    IF v_match_count > 20 THEN
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


-- ============================================================
-- TRANSACTION ANALYSIS
-- ============================================================
--
-- 1. trg_keep_highest_score (BEFORE UPDATE on matches)
--    No explicit transaction needed. The trigger runs inside the
--    caller's UPDATE transaction atomically. If the UPDATE rolls
--    back, so does the score change.
--
-- 2. trg_auto_ban_on_failed_logins (BEFORE UPDATE on users)
--    No explicit transaction needed. Same as above — the ban
--    flag flip is part of the original UPDATE transaction.
--    Application code that increments failed_login_attempts
--    should do so in a single UPDATE statement so this trigger
--    fires once per attempt.
--
-- 3. trg_limit_matches_per_user (AFTER INSERT on matches)
--    RACE CONDITION RISK: if two matches for the same user are
--    inserted concurrently (e.g. two sessions), both triggers
--    see count = 21 and both delete, leaving 19 rows instead of
--    20. For this game workload the risk is low, but if strict
--    cap enforcement is required, wrap the INSERT in an explicit
--    SERIALIZABLE transaction or use an advisory lock:
--
--      BEGIN;
--      SELECT pg_advisory_xact_lock(user_id);
--      INSERT INTO matches ...;
--      COMMIT;
--
-- 4. get_or_create_company (function, called before INSERT user)
--    RACE CONDITION RISK: two concurrent calls with the same
--    company name could both skip past the SELECT (neither finds
--    it) and both try to INSERT, causing a unique constraint
--    violation on the second one. The ON CONFLICT DO NOTHING
--    clause handles this safely — the second INSERT silently
--    skips and the following SELECT retrieves the winner's row.
--    No SAVEPOINT or explicit transaction is required here.
--
-- SUMMARY TABLE
-- ┌─────────────────────────────────┬────────────┬───────────────────────────────┐
-- │ Object                          │ Needs TX?  │ Reason                        │
-- ├─────────────────────────────────┼────────────┼───────────────────────────────┤
-- │ trg_keep_highest_score          │ No         │ Atomic within caller's UPDATE │
-- │ trg_auto_ban_on_failed_logins   │ No         │ Atomic within caller's UPDATE │
-- │ trg_limit_matches_per_user      │ Optional   │ Advisory lock if strict cap   │
-- │ get_or_create_company           │ No         │ ON CONFLICT handles race      │
-- └─────────────────────────────────┴────────────┴───────────────────────────────┘
