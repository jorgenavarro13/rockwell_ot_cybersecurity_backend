import express, { json } from 'express'
import cors from 'cors'
import { corsMiddleware } from './middlewares/cors.js'
import { createRockwellRouter } from './routes/rockwell.js'

export const App = ({ model }) => {
  const app = express()

  console.log("DB conectada:", !!model)

  // app.use(cors())
  app.use(json())
  app.use(corsMiddleware())
  app.disable('x-powered-by')

  app.use('/', createRockwellRouter({ model }))

  const PORT =  3000


  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`)
  })
}