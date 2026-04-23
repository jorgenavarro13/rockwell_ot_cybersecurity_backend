import { Router } from 'express'
import { RockwellController } from '../controllers/rockwell.js'
import { AdminController } from '../controllers/AdminController.js'
import { GameController } from '../controllers/GameController.js'

export const createRockwellRouter = ({ model }) => {

  const rockwellRouter = Router()
  const adminRouter = Router()
  const gameRouter = Router()


  const rockwellController = new RockwellController({ model })
  const adminController = new AdminController({ model })
  const gameController = new GameController({ model })

  /// GAME ENDPOINTS
  gameRouter.post('/play', gameController.createGame)
  gameRouter.get('/gameData', gameController.getGame) // Endpoint para obtener datos iniciales del juego, como el ranking, o los datos del usuario logueado
  gameRouter.patch('/gameOver', gameController.gameOver) 


  /// ADMIN ENDPOINTS
  adminRouter.get('/dashboard', adminController.getDashboardData) 


  /// ROCKWELL ENDPOINTS
  rockwellRouter.get('/session', rockwellController.session) // Middleware para obtención de token

  rockwellRouter.get('/user', rockwellController.getAll)
  rockwellRouter.get('/user/:id', rockwellController.getById)
  rockwellRouter.post('/register', rockwellController.create)
 
  rockwellRouter.get('/check-email',rockwellController.checkEmail) // Endpoint para verificar si el correo ya existe
  
  rockwellRouter.post('/login', rockwellController.login)
  rockwellRouter.post('/logout', rockwellController.logout)

  rockwellRouter.get('/ranking', rockwellController.getRanking)



  // USER ENDPOINTS

  // adminRouter.get('/dashboard/stats', adminController.getDashboardStats) // Endpoint para obtener estadísticas del dashboard

  // rockwellRouter.post('/logout', rockwellController.logout)

  // rockwellRouter.delete('/:id', rockwellController.delete)
  // rockwellRouter.patch('/:id', rockwellController.update)

  return { rockwellRouter, adminRouter, gameRouter }  
}