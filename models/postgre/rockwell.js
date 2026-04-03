import pg from './db.js';
import {auth} from '../../services/authService.js';
import { updateMissingFieldsRegister } from '../../helpers/updateMissingFieldsRegister.js';

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

    const id= await pg `
      SELECT user_id FROM users WHERE email=${email}
      `
      console.log(id[0].user_id) // Remove this line in production;
    
      try{
        await updateMissingFieldsRegister(id[0].user_id, country, birthday, phone, company)
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
      SELECT * FROM users WHERE email=${email}
      `
      return (user.length > 0)
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