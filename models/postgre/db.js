/*
import { Client } from 'pg'
import "dotenv/config"
import fs from 'node:fs/promises'
import path from 'node:path'

const filePath = path.join(import.meta.dirname, 'ca.pem')

export async function createClient() {
  const ca = await fs.readFile(filePath)

  const client = new Client({
    user: process.env.USER,
    password: process.env.PASSWORD,
    host: process.env.HOST,
    port:process.env.PORT,
    database: process.env.DATABASE,
    ssl: {
      rejectUnauthorized: true,
      ca
    }
  })

  await client.connect()
  return client
}
*/
import postgres from 'postgres'
import 'dotenv/config'
//dotenv.config({ path: '../../.env' })

const pg = postgres(process.env.SERVICE_URI)

if (!pg) {
  console.error('Failed to connect to PostgreSQL database')
} else {
  console.log('Successfully connected to PostgreSQL database')
  
  // const firstquery = {
  //   result: await pg`SELECT * FROM users;`
  // }
  // console.log('Test query result:', firstquery)
} 
export default pg


