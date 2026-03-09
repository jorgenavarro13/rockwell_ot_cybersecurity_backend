import { Pool } from 'pg'

const pool = new Pool({
  host: 'localhost',
  user: 'postgres',
  database: 'test',
  password: 'password',
  port: 5432
})

const result = await pool.query('SELECT * FROM users')

console.log(result.rows)