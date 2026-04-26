import { validateUser, validatePartialUser } from '../schemas/users.js'
import jwt from 'jsonwebtoken'

export class RockwellController {
  constructor ({ model }) {
    this.model = model
  }

  getRanking = async (req, res) => {
          const ranking = await this.model.getRanking()
          console.log(ranking)
          res.json( ranking )
        }

  getAll = async (req, res) => {
    const { type } = req.query
    const users = await this.model.getAll({ type })
    res.json(users)
  }

  
  
  
  create = async (req, res) => {
    const result = validateUser(req.body)
    console.log('Validation result:', result) // Remove this line in production

    if (!result.success) {
    // 422 Unprocessable Entity
    // 400 Bad Request
      return res.status(400).json( JSON.parse(result.error.message) )
    }

    let newUser = {};
    try {
      newUser = await this.model.create({ input: result.data })
    }
    catch (e) {
      console.error('Error creating user:', e) // Remove this line in production
      return res.status(500).json({ error: 'Internal server error' })
    }

    const token = jwt.sign(
      {username:newUser.name, role:newUser.role_id, user_id: newUser.user_id}
    , process.env.SECRET_JWT_KEY
    , {expiresIn:'1h'}
    )

    const isProduction = process.env.NODE_ENV === 'production';
    const adminRole = await this.model.getAdminRoleId();

    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 3600000, // 1 hour
       sameSite: isProduction ? 'none' : 'lax',
       secure: isProduction
    })
    .status(201)
    .json({ success: true,
          user: {
            username: newUser.name,
            user_id:  newUser.user_id,
            isAdmin:  newUser.role === adminRole
          }
        })
  }
  
  session = async (req,res) => {
    // Todo: Possibly change for the tokenParser middleware option but it's working fine now
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ activeSession:false})
    }
    try {
      const data = jwt.verify(token, process.env.SECRET_JWT_KEY)
      console.log(data);
      
      const adminRole = await this.model.getAdminRoleId();

      console.log('Admin role ID:', adminRole); // Remove this line in production

      console.log('User is admin:', data.role === adminRole); // Remove this line in production
      return res.json({ activeSession:true, 
        user :{
            username: data.username,
            user_id: data.user_id,
            isAdmin: data.role === adminRole
        }
      })
    }catch {
      return res.json({ message: 'Invalid token' })
    }

  }


  getById = async (req, res) => {
    const token = req.cookies.token
    
    if (!token) {
      return res.status(401).json({ activeSession:false})
    }

    
    const userData = jwt.verify(token, process.env.SECRET_JWT_KEY)
    console.log('Decoded token data:', userData) // Remove this line in production
    

    console.log('Session data:', userData)
   // Remove this line in production
    const user = await this.model.getById({ userData })
    if (user) return res.status(200).json(user)
    res.status(404).json({ message: 'User not found' })
  }

  getGamesByUser = async (req, res) => {
    const token = req.cookies.token;
     if (!token) {
      return res.status(401).json({ activeSession:false})
    }

    
    const userData = jwt.verify(token, process.env.SECRET_JWT_KEY)
    console.log('Decoded token data:', userData) // Remove this line in production
    const games = await this.model.getGamesByUser({ userData })
    return res.status(200).json(games)

  }

    checkEmail = async (req, res) => {
      const { email } = req.query

      const user = await this.model.checkEmail({ email })

      if (user) {
        return res.json({ exists: true })
      }
      return res.json({ exists: false })
    }

    checkPhone = async (req, res) => {
      const { phone } = req.query

      const user = await this.model.checkPhone({ phone })

      if (user) {
        return res.json({ exists: true })
      }
      return res.json({ exists: false })
    }

    login = async (req, res) => {
      const user = validatePartialUser(req.body)

      if (!user.success) {
        return res.status(400).json({ error: JSON.parse(user.error.message) })
      }

      const result = await this.model.login({ input: user.data })
      console.log(result.success) // Remove this line in production

      if (result.success === false) {
        return res.status(401).json(result)
      }
      console.log(result)
      const adminRole = await this.model.getAdminRoleId();
      
        const token = jwt.sign(
          {username:result.name, role:result.role, user_id: result.user_id}
        , process.env.SECRET_JWT_KEY
        , {expiresIn:'1h'}
        )

        const isProduction = process.env.NODE_ENV === 'production';

        res.cookie('token', token, {
          httpOnly: true,
          maxAge: 3600000, // 1 hour
           sameSite: isProduction ? 'none' : 'lax',
           secure: isProduction
        })
        .json({ success: true,
          user: {
            username: result.name,
            user_id: result.user_id,
            isAdmin: result.role === adminRole
          }
        })
    }

  logout = async (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';

    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'lax',
      secure: isProduction,
    });

    return res.json({ success: true });
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