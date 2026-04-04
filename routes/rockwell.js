import { Router } from 'express'
import { RockwellController } from '../controllers/rockwell.js'

export const createRockwellRouter = ({ model }) => {
  const rockwellRouter = Router()

  const rockwellController = new RockwellController({ model })
  rockwellRouter.get('/session', rockwellController.session) // Middleware para obtención de token

  rockwellRouter.get('/user', rockwellController.getAll)
  rockwellRouter.get('/user/:id', rockwellController.getById)
  rockwellRouter.post('/register', rockwellController.create)
 
  rockwellRouter.get('/check-email',rockwellController.checkEmail) // Endpoint para verificar si el correo ya existe
  
  rockwellRouter.post('/login', rockwellController.login)

  // rockwellRouter.post('/logout', rockwellController.logout)

  // rockwellRouter.delete('/:id', rockwellController.delete)
  // rockwellRouter.patch('/:id', rockwellController.update)

  return rockwellRouter
}