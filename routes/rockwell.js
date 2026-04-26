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
  gameRouter.patch('/updateScore', gameController.updateScore); // Endpoint para actualizar el score durante el juego, se puede llamar cada vez que el score cambie, o cada cierto tiempo, dependiendo de la lógica del juego.


  /// ADMIN ENDPOINTS
  adminRouter.get('/dashboard', adminController.getDashboardData) 


  /// ROCKWELL ENDPOINTS
  rockwellRouter.get('/session', rockwellController.session) // Middleware para obtención de token

  rockwellRouter.get('/users', rockwellController.getAll)
  rockwellRouter.get('/user', rockwellController.getById)
  rockwellRouter.get('/user/games',rockwellController.getGamesByUser) // Endpoint para obtener los juegos de un usuario
  rockwellRouter.post('/register', rockwellController.create)
 
  rockwellRouter.get('/check-email',rockwellController.checkEmail) // Endpoint para verificar si el correo ya existe
  rockwellRouter.get('/check-phone',rockwellController.checkPhone) // Endpoint para verificar si el teléfono ya existe
  
  rockwellRouter.post('/login', rockwellController.login)
  rockwellRouter.post('/logout', rockwellController.logout)

  rockwellRouter.get('/ranking', rockwellController.getRanking)



  // USER ENDPOINTS

  // adminRouter.get('/dashboard/stats', adminController.getDashboardStats) // Endpoint para obtener estadísticas del dashboard

  return { rockwellRouter, adminRouter, gameRouter }  
}