import z from 'zod'
//import {variables} from './globalvariables.js';

const userSchema = z.object({
  name: z.string({
    invalid_type_error: 'Name must be a string',
    required_error: 'Username is required.'
  }),
  
  country: z.number().min(0).max(4).optional(), //TODO Stablish max value based on global variables

  email: z.string().email({
    message: 'Email must be a valid email address'
  }),

  password: z.string().min(6,{
    message: 'Password must be at least 6 characters long'
  }),
  
  phone:z.string().max(13).optional(),

  typeOfUser:z.number().positive().min(0).max(5).optional(), // TODO: Replace the number of type of users

  company:z.number().positive().min(0).max(5).optional(), // TODO: Replace the number for gloabal variable

  birthday: z.iso.date().optional()

});


export function validateUser (input) {
  return userSchema.safeParse(input)
}

export function validatePartialUser (input) {
  return userSchema.partial().safeParse(input)
}