const { app } = require('@azure/functions');
const { Pool } = require('pg');
require('dotenv').config();

app.http('updatePassword', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
      context.log(`HTTP function processed request for URL: "${request.url}"`);
  
      try {
        const bodyText = await request.text();
        const requestBody = JSON.parse(bodyText);
        const { email, password } = requestBody;
  
        if (!email || !password) {
          return {
            status: 400,
            body: JSON.stringify({ error: 'Email and password are required' }),
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          };
        }
  
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
  
          // Execute the update query
          const result = await client.query(
            'UPDATE "userinfo" SET password = $1 WHERE email = $2 RETURNING *',
            [password, email]
          );
  
          if (result.rowCount === 0) {
            // No rows updated, email may not exist
            return {
              status: 404,
              body: JSON.stringify({ error: 'Email not found' }),
              headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
              }
            };
          }
  
          const rows = result.rows; // Array of rows
          context.log('Query result:', rows);
  
          return {
            status: 200,
            body: JSON.stringify(rows),
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          };
        } catch (err) {
          context.log('Error executing query:', err);
  
          return {
            status: 500,
            body: JSON.stringify({ error: err.message }), // Return error message
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*"
            }
          };
        } finally {
          if (client) {
            client.release();
          }
        }
      } catch (error) {
        return {
          status: 500,
          body: JSON.stringify({ error: 'Invalid request format' }),
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        };
      }
    }
  });
  
  