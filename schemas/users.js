import z from 'zod'
//import {variables} from './globalvariables.js';

const country= 
  z.object({
    code: z.string(),
    name: z.string(),
    flag: z.url()
  });

// Refactor schema, country is going to be a string, specifically a 
const userSchema = z.object({
  name: z.string({
    invalid_type_error: 'Name must be a string',
    required_error: 'Username is required.'
  }),
  
  country:country.optional(),

  email: z.email({
    message: 'Email must be a valid email address'
  }),

  password: z.string(), // TODO ! Add a layer where the lenght of the password is checked, and maybe the complexity

  phone:z.string().max(13).optional(),

  typeOfUser:z.enum(['Employee', 'Client', 'Not related']),

  company:z.string().optional(),

  birthday: z.iso.date().optional()

});


export function validateUser (input) {
  const cleanedInput = {...input}

    if( cleanedInput.country === null  || cleanedInput.country === undefined ) { delete cleanedInput.country}
    if( cleanedInput.phone === '' || cleanedInput.phone === null  || cleanedInput.phone === undefined) { delete cleanedInput.phone}
    if( cleanedInput.company=== '' || cleanedInput.company === null  || cleanedInput.company === undefined) { delete cleanedInput.company}
    if( cleanedInput.birthday=== '' || cleanedInput.birthday === null  || cleanedInput.birthday === undefined) { delete cleanedInput.birthday}

  return userSchema.safeParse(cleanedInput)
}

export function validatePartialUser (input) {
  return userSchema.partial().safeParse(input)
}