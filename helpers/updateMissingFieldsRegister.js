import pg from '../models/postgre/db.js';

const updateMissingFieldsRegister = async (id, country, birthday, phone, company) => {
    
    const user_id = Number(id);
    console.log('Updating missing fields for user_id:', user_id, 'with type:', typeof user_id) // Remove this line in production

      // TODO: Verify and update the country, company and birthday fields

      // Aqui vamos a usar un store procedure para insertar el resto de la información en las tablas correspondientes 
      if (country) {
        const {code} = country;
        await pg `
        CALL insert_user_country(${user_id}::BIGINT, ${code});
        `
      } // ! Verify the type before sending it to the store procedure, it should be a bigint,but as we are passing it as a parameter it might be a string, so we need to verify that and convert it if necessary
      // if (company) {
      //   await pg `
      //   CALL insert_user_company(${user_id}::BIGINT, ${company});
      //   `
      // }

      if (birthday) {
        await pg `
        CALL insert_user_birthday(${user_id}::BIGINT, ${birthday}::DATE);
        `
      }

      if (phone) {
        await pg `
        CALL insert_user_phone(${user_id}::BIGINT, ${phone});
        `
      } 

      if (company) {
      await pg`
        UPDATE users 
        SET company_id = get_or_create_company(${company}::VARCHAR)
        WHERE user_id = ${user_id}::BIGINT;
      `;
    }
    }

    export {updateMissingFieldsRegister};