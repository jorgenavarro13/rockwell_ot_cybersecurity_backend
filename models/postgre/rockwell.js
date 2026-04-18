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
      u.type_of_user,
      COALESCE(cmp.name, '') AS company,
      u.birthday,
      u.role_id,
      u.is_active AS state,
      COALESCE(COUNT(m.user_id), 0)::INT AS gamesplayed
    FROM users u
    LEFT JOIN companies cmp ON cmp.company_id = u.company_id
    LEFT JOIN matches m ON m.user_id = u.user_id
    GROUP BY
      u.user_id,
      u.name,
      u.country,
      u.email,
      u.phone,
      u.type_of_user,
      cmp.name,
      u.birthday,
      u.role_id,
      u.is_active
    ORDER BY u.user_id;
    `
    return users
  }
  
  static async getById ({ id }) {
    const user = await pg `
    SELECT
      u.user_id,
      u.name,
      u.country,
      u.email,
      u.phone,
      u.type_of_user,
      COALESCE(cmp.name, '') AS company,
      u.birthday,
      u.role_id,
      u.is_active AS state,
      COALESCE(COUNT(m.user_id), 0)::INT AS gamesplayed
    FROM users u
    LEFT JOIN companies cmp ON cmp.company_id = u.company_id
    LEFT JOIN matches m ON m.user_id = u.user_id
    WHERE u.user_id = ${ id }
    GROUP BY
      u.user_id,
      u.name,
      u.country,
      u.email,
      u.phone,
      u.type_of_user,
      cmp.name,
      u.birthday,
      u.role_id,
      u.is_active
    `

    if (user.length === 0) return null

    return user[0]
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