import postgres from 'postgres'
import 'dotenv/config'

const pg = postgres(process.env.SERVICE_URI)

;(async () => {
  try {
    await pg`select 1`
    console.log('Successfully connected to PostgreSQL database')
  } catch (error) {
    console.error('Failed to connect to PostgreSQL database', error)
    process.exit(1)
  }
})()
export default pg;



