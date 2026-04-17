import express, { json } from 'express'
import { corsMiddleware } from './middlewares/cors.js'
import { createRockwellRouter } from './routes/rockwell.js'
import cookieParser from 'cookie-parser'
import {tokenParser} from './middlewares/tokenParser.js'
import 'dotenv/config'
import morgan from 'morgan'

export const App = ({ model }) => {
  const app = express()
  app.use(cookieParser())
  app.use(tokenParser())
  // console.log("DB conectada:", !!model)
  app.use(json())
  app.use(morgan('tiny'))
  app.use(corsMiddleware())
  app.disable('x-powered-by')

  const { rockwellRouter, adminRouter } = createRockwellRouter({ model })
  
  app.use('/', rockwellRouter)
  app.use('/admin', adminRouter)

  const PORT = process.env.LOCALPORT || 3000
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
  })
}