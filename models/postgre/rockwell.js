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
      (name, email, password_hash, type_of_user) 
      VALUES
      (
        ${name},
        ${email},
        ${hashedPassword},
        (SELECT type_id FROM type_users WHERE relation = ${typeOfUser})
      );
      `

      // TODO: Verify and update the country, company and birthday fields

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