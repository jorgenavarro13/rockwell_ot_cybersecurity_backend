import z from 'zod'


 // TODO: Create schema for validation


const userSchema = z.object({
  name: z.string({
    invalid_type_error: 'Name must be a string',
    required_error: 'Username is required.'
  }),
  email: z.string().email({
    message: 'Email must be a valid email address'
  }),
  password: z.string().min(6,{
    message: 'Password must be at least 6 characters long'
  })
})

export function validateUser (input) {
  return userSchema.safeParse(input)
}

export function validatePartialUser (input) {
  return userSchema.partial().safeParse(input)
}