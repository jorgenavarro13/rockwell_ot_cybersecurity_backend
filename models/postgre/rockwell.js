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
      email,
      password
    } = input

    const hashedPassword = await auth.hashPassword(password);

    // TODO: Validar que se cree y que no genere problemas relacionados al id
    try {
      await pg `
      INSERT INTO users
      (user_id,name, email, password_hash) 
      VALUES
      (13,${name}, ${email}, ${hashedPassword});
      `
    } catch (e) {
      throw new Error('Error creating the user')
      
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