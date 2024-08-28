const { app } = require('@azure/functions');
const { Pool } = require('pg');
require('dotenv').config();

app.http('postData', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log(`HTTP function processed request for URL: "${request.url}"`);

     const bodyText = await request.text();
     requestBody = JSON.parse(bodyText);
    const { email, password } = requestBody;
    

    const isProduction = process.env.APP_ENV === 'PRODUCTION';
    const pool = new Pool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: 5432,
      ssl: isProduction ? { rejectUnauthorized: false } : false
    });

    let client;

    try {
      client = await pool.connect();
      
      // Execute the query
      const result = await client.query('INSERT INTO "userinfo" (email, password) VALUES ($1, $2) RETURNING *', [email, password]);
     


      const rows = result.rows; // Array of rows
      context.log('Query result:', rows);

      return {
        status: 200,
        body: JSON.stringify(rows),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*" // Allow CORS if needed
        }
      };
    } catch (err) {
      context.log('Error executing query:', err);

      return {
        status: 500,
        body: JSON.stringify({ error: err.message }), // Return error message
        headers: {
          "Content-Type": "application/json", // Changed to JSON
          "Access-Control-Allow-Origin": "*"
        }
      };
    } finally {
      if (client) {
        client.release();
      }
    }
  }
});
