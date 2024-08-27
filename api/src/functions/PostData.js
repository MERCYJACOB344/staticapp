const { app } = require('@azure/functions');
const { Pool } = require('pg');
app.http('postData', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
      context.log(`HTTP function processed request for URL: "${request.url}"`);
      const { email, password } = req.body;
      context.log(req.body);
      const pool = new Pool({
        host: 'servercld.postgres.database.azure.com',
        user: 'postgres@servercld',
        password: 'Dbuser123',
        database: 'postgres',
        port: 5432,
        ssl: {
            rejectUnauthorized: false
        }
      });
  
      let client;
  
      try {
        client = await pool.connect();
      
        const result = await client.query('INSERT INTO userInfo (email, password) VALUES ($1, $2)', [email, password]);
  
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
          body: JSON.stringify({ error: err }),
          headers: {
            "Content-Type": "text/plain",
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
  
