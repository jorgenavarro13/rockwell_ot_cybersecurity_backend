import { Router } from 'express'
import { RockwellController } from '../controllers/.js'

export const createRockwellRouter = ({ model }) => {
  const rockwellRouter = Router()

  const rockwellController = new RockwellController({ model })

  rockwellRouter.get('/', rockwellController.getAll)
  // rockwellRouter.post('/', rockwellController.create)
// 
  // rockwellRouter.get('/:id', rockwellController.getById)
  // rockwellRouter.delete('/:id', rockwellController.delete)
  // rockwellRouter.patch('/:id', rockwellController.update)

  return rockwellRouter
}