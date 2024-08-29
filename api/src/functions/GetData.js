const { app } = require('@azure/functions');
const { Pool } = require('pg');
app.http('GetData', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
      context.log(`HTTP function processed request for URL: "${request.url}"`);
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
        const query = 'SELECT * FROM userinfo';
        const result = await client.query(query);
  
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
  
