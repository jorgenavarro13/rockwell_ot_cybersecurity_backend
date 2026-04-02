import { validateUser, validatePartialUser } from '../schemas/users.js'
import jwt from 'jsonwebtoken'

export class RockwellController {
  constructor ({ model }) {
    this.model = model
    // console.log("Model en controller:", !!model)
  }

  getAll = async (req, res) => {
    const { type } = req.query
    const users = await this.model.getAll({ type })
    res.json(users)
  }

  
  getById = async (req, res) => {
    const { id } = req.params
    const user = await this.model.getById({ id })
    if (user) return res.json(user)
    res.status(404).json({ message: 'User not found' })
  }

  
  create = async (req, res) => {
    const result = validateUser(req.body)

    if (!result.success) {
    // 422 Unprocessable Entity
    // 400 Bad Request
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    let newUser = null;
    try {
    newUser = await this.model.create({ input: result.data })
    }
    catch (e) {
      console.error('Error creating user:', e) // Remove this line in production
      return res.status(500).json({ error: 'Internal server error' })
    }

    const token = jwt.sign( {
      username:newUser.name, role:newUser.role
    },process.env.SECRET_JWT_KEY,{expiresIn:'1h'})

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 3600000, // 1 hour
       sameSite: 'lax',
       secure: false
    })
    .status(201)
    .json( {newUser} )

  }
  
  /*
  delete = async (req, res) => {
    const { id } = req.params

    const result = await this.model.delete({ id })

    if (result === false) {
      return res.status(404).json({ message: 'User not found' })
    }

    return res.json({ message: 'User deleted' })
  }

  update = async (req, res) => {
    const result = validatePartialUser(req.body)

    if (!result.success) {
      return res.status(400).json({ error: JSON.parse(result.error.message) })
    }

    const { id } = req.params

    const updatedUser = await this.model.update({ id, input: result.data })

    return res.json(updatedUser)
  }
    */
}