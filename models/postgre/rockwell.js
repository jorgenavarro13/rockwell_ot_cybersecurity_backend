import pg from './db.js';
import {auth} from '../../services/authService.js';
import { updateMissingFieldsRegister } from '../../helpers/updateMissingFieldsRegister.js';

export class RockwellModel {

  static async getDashboardData() {
    const data = await pg `
      SELECT DISTINCT ON (users.user_id)
      users.name AS user_name,
      users.email AS email,
      matches.score AS score,
      (SELECT COUNT(*) FROM matches) AS gamesplayed,
      type_users.relation AS relation,
      companies.name AS company_name,

      json_build_object(
        'name', countries.name,
        'flag', countries.logo,
        'code', countries.code
      ) AS country

    FROM users
    LEFT JOIN matches
      ON matches.user_id = users.user_id
    JOIN countries
      ON countries.country_id = users.country
    JOIN type_users
      ON type_users.type_id = users.type_of_user
    LEFT JOIN companies
      ON companies.company_id = users.company_id

    ORDER BY users.user_id, matches.score DESC NULLS LAST;
    ;`
    
    return data;
  }

  static async getAll ({ type }) {
    const users = await pg`
    SELECT
      u.user_id,
      u.name,
      u.country,
      u.email,
      u.phone,
      tu.relation AS type_of_user,
      COALESCE(cmp.name, '') AS company,
      u.birthday,
      u.role_id,
      u.is_active AS state,
      COALESCE(COUNT(m.user_id), 0)::INT AS gamesplayed
    FROM users u
    LEFT JOIN companies cmp ON cmp.company_id = u.company_id
    LEFT JOIN matches m ON m.user_id = u.user_id
    LEFT JOIN type_users tu ON tu.type_id = u.type_of_user
    GROUP BY
      u.user_id,
      u.name,
      u.country,
      u.email,
      u.phone,
      tu.relation,
      cmp.name,
      u.birthday,
      u.role_id,
      u.is_active
    ORDER BY u.user_id;
    `
    return users
  }
  
  static async getById ({ userData }) {
    const { user_id } = userData;
    const user = await pg `
    SELECT
      u.user_id,
      u.name,
      u.country,
      u.email,
      u.phone,
      type_users.relation AS type_of_user,
      COALESCE(cmp.name, '') AS company,
      u.birthday,
      u.role_id,
      u.is_active AS state,
      u.is_banned,
      u.is_active,

      json_build_object(
        'name', countries.name,
        'flag', countries.logo,
        'code', countries.code
      ) AS country,

      (u.role_id = (SELECT get_admin_role())) AS is_admin,
       
      COALESCE(COUNT(m.user_id), 0)::INT AS gamesplayed
    FROM users u
    LEFT JOIN companies cmp ON cmp.company_id = u.company_id
    LEFT JOIN matches m ON m.user_id = u.user_id
    JOIN countries
      ON countries.country_id = u.country
    JOIN type_users
      ON type_users.type_id = u.type_of_user
    WHERE u.user_id = ${ user_id }::INT
    GROUP BY
      u.user_id,
      u.name,
      u.country,
      u.email,
      u.phone,
      type_users.relation,
      cmp.name,
      u.birthday,
      u.role_id,
      u.is_active,
      countries.name,
      countries.logo,
      countries.code,
      u.is_banned,
      u.is_active,
      u.role_id;
    `

    if (user.length === 0) return null

    return user[0]
  }

  static async getGamesByUser ({ userData }) {
    const { user_id } = userData;
    const games = await pg `
    SELECT
    ROW_NUMBER() OVER (ORDER BY m.score DESC) AS position,
      m.match_id,
      m.score,
      m.date_end AS date
    FROM matches m
    WHERE m.user_id = ${ user_id }::INT and date_end IS NOT NULL
    ORDER BY m.date_end ASC
    ;
    `
    return games
  }

  static async create ({ input }) {
    const {
      name,
      country,
      email,
      password,
      phone,
      typeOfUser, // TODO: Replace the number of type of users
      company, // TODO: Replace the number for gloabal variable
      birthday
    } = input

    const hashedPassword = await auth.hashPassword(password);


    try {
      // Use RETURNING to get the new user_id atomically, avoiding an extra SELECT round-trip
      const inserted = await pg `
      INSERT INTO users
      (name, email, password_hash, type_of_user) 
      VALUES
      (
        ${name},
        ${email},
        ${hashedPassword},
        (SELECT type_id FROM type_users WHERE relation = ${typeOfUser})
      )
      RETURNING user_id;
      `

      const userId = inserted[0].user_id;
    
      try{
        await updateMissingFieldsRegister(userId, country, birthday, phone, company)
      } catch (e){ console.warn('Error updating missing fields:', e) }

     const user = await pg `
     SELECT * FROM users WHERE email=${email}`
    // TODO ! In production, consider selecting only the necessary fields instead of all user data, to enhance security and performance. For development and testing, having all fields can be useful for debugging.
    return user[0]; // user es una lista, entonces solo queremos el primer elemento de esta que es nuestro usuario
    // En producción se recomienda no pasar todos los datos, pero para fines de desarrollo y pruebas es útil tenerlos todos

    } catch (e) {
      console.error('DB ERROR:', e)
      throw e
    }
  }

    static async checkEmail ({ email }) {
      const user = await pg `
      SELECT 1 FROM users WHERE email=${email} LIMIT 1
      `
      return (user.length > 0)
    }

    static async checkPhone ({ phone }) {
      const user = await pg `
      SELECT 1 FROM users WHERE phone=${phone} LIMIT 1
      `
      return (user.length > 0)
    }

    static async login ({input}) {
      const {email,password} = input

      const databaseUser = await pg `
      SELECT password_hash FROM users WHERE email=${email} 
      `
      const hashedPassword = databaseUser[0]?.password_hash;

      if (!hashedPassword) { return { success: false, message: 'Invalid email or password' } }

      const isMatch = await auth.verifyPassword(password,hashedPassword);

      if (!isMatch) { return { success: false, message: 'Invalid email or password' };}

      const user = await pg `
      SELECT user_id, name, role_id FROM users WHERE email=${email} 
      `
      return ({ success: true, user_id: user[0].user_id, name: user[0].name, role: user[0].role_id }) ;

    }

    static async getAdminRoleId() {
      const result = await pg `
        SELECT get_admin_role();
      `;

      return result[0]?.get_admin_role ?? null;
    }


    static async getRanking() {
      const ranking = await pg `
        WITH best_matches AS (
        SELECT DISTINCT ON (users.user_id)
          users.user_id AS id,
          users.name AS playername,
          matches.score AS score,
          matches.date_end::date AS date,

          json_build_object(
          'name', countries.name,
          'flag', countries.logo,
          'code', countries.code
        ) AS country

        FROM users
        LEFT JOIN matches
          ON matches.user_id = users.user_id
        JOIN countries
              ON  countries.country_id=users.country
        ORDER BY users.user_id, matches.score DESC
      )

      SELECT *,
        RANK() OVER (ORDER BY score DESC NULLS LAST) AS position
      FROM best_matches;
        `;

      return ranking;
    }


    static async createGame ({ userData }) {
      console.log(userData);
      const {
        user_id
      } = userData

      const game =  await pg `
        INSERT INTO matches (user_id,game_id)
        VALUES ( ${user_id}::INT, ${1}::INT )
        RETURNING match_id;
      `
        // En esta fase solo se tiene un juego, pero en el futuro se pueden agregar más juegos, entonces el game_id se puede usar para diferenciarlos
        // Hay que ser explicitos en la inserción desde el backend.
      return game[0];
    }

    static async getGame ({ userData }) {
      //console.log(userData);
      const {
        user_id,
        game_id,
        time_start
      } = userData

      const gameInfo = await pg `
        SELECT *
        FROM matches
        WHERE user_id = ${user_id}
          AND game_id = ${game_id}
          AND time_start BETWEEN ${time_start}::timestamp - interval '1 ms'
                              AND ${time_start}::timestamp + interval '1 ms'
        ;`

      // Postgre is very special with time, so to avoid any issues with the time comparison, we use a range of 2 milliseconds around the provided time_start. This should be enough to account for any discrepancies in time storage and retrieval, while still ensuring we get the correct game record.

      // // console.log('Game info retrieved:', gameInfo); // Debugging line
      return gameInfo[0];
    }

    static async GameOver ({matchData }) {
      console.log(matchData);
      const {
        match_id
      } = matchData

      const result = await pg`
        UPDATE matches
        SET 
          date_end = now() 
        WHERE match_id = ${match_id}
          AND date_end IS NULL
        RETURNING match_id;
      `;
      return result[0];
    }

    static async updateScore ({gameData}) {
      console.log(gameData);
      const {
        match_id,
        score
      } = gameData
      const result = await pg`
        UPDATE matches
        SET 
          score = ${score} 
        WHERE match_id = ${match_id}
        RETURNING match_id;
      `;
      return result[0];
    }

}


/*
  static async delete ({ id }) {
    // ejercio fácil: crear el delete
  }

  static async update ({ id, input }) {
    // ejercicio fácil: crear el update
  }

}
*/  