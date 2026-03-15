import pg from './db.js';
import {auth} from '../../services/authService.js';

export class RockwellModel {
  static async getAll ({ type }) {
    const users = await pg`
    SELECT * FROM users;
    `
    return users
  }
  
  static async getById ({ id }) {
    const user = await pg `
    SELECT * 
    FROM users 
    WHERE user_id= ${ id }
    `

    if (user.length === 0) return null

    return user
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

      await pg `
      INSERT INTO users
      (name, email, password_hash, country, phone, type_of_user, company_id, birthday) 
      VALUES
      (
        ${name},
        ${email},
        ${hashedPassword},
        ${country ?? null},
        ${phone ?? null},
        (SELECT type_id FROM type_users WHERE relation = 'player'),
        ${company ?? null},
        ${birthday ?? null}
      );
      `

      const user = await pg `
      SELECT * FROM users WHERE email=${email}`
      
      return user;

    } catch (e) {
      console.error('DB ERROR:', e)
      throw e
    }
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