import postgres from 'postgres'
import 'dotenv/config'

const pg = postgres(process.env.SERVICE_URI)

if (!pg) {
  console.error('Failed to connect to PostgreSQL database')
} else {
  console.log('Successfully connected to PostgreSQL database')
} 
export default pg;



