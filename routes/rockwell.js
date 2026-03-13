import { Router } from 'express'
import { RockwellController } from '../controllers/rockwell.js'

export const createRockwellRouter = ({ model }) => {
  const rockwellRouter = Router()

  const rockwellController = new RockwellController({ model })

  rockwellRouter.get('/user', rockwellController.getAll)
  rockwellRouter.get('/user/:id', rockwellController.getById)
  rockwellRouter.post('/login', rockwellController.create)
 
  // rockwellRouter.delete('/:id', rockwellController.delete)
  // rockwellRouter.patch('/:id', rockwellController.update)

  return rockwellRouter
}