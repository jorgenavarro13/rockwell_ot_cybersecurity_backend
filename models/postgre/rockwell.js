import pg from './db.js';
import {auth} from '../../services/authService.js';
import { updateMissingFieldsRegister } from '../../helpers/updateMissingFieldsRegister.js';

export class RockwellModel {
  static async getAll ({ type }) {
    const users = await pg`
    SELECT user_id, name, country, email, phone, type_of_user, company, birthday, role_id FROM users;
    `
    return users
  }
  
  static async getById ({ id }) {
    const user = await pg `
    SELECT user_id, name, country, email, phone, type_of_user, company, birthday, role_id
    FROM users 
    WHERE user_id= ${ id }
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