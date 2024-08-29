const { app } = require('@azure/functions');
const { Pool } = require('pg');
require('dotenv').config();




function createPool() {
  const isProduction = process.env.APP_ENV === 'PRODUCTION';
  return new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 5432,
    ssl: isProduction ? { rejectUnauthorized: false } : false
  });
}


async function executeQuery(query, params, context) {
  const pool = createPool();
  let client;

  try {
    client = await pool.connect();
    const result = await client.query(query, params);
    return result.rows;
  } catch (err) {
    context.log('Error executing query:', err.message);
    throw new Error(`Error executing query: ${err.message}`);
  } finally {
    if (client) {
      client.release();
    }
  }
}

app.http('updatePassword', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log(`HTTP function processed request for URL: "${request.url}"`);

    try {
      const bodyText = await request.text();
      const { email, password } = JSON.parse(bodyText);

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

      const query = 'UPDATE "userinfo" SET password = $1 WHERE email = $2 RETURNING *';
      const params = [password, email];
      const result = await executeQuery(query, params, context);

      if (result.length === 0) {
        return {
          status: 404,
          body: JSON.stringify({ error: 'Email not found' }),
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*"
          }
        };
      }

      return {
        status: 200,
        body: JSON.stringify(result),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      };
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




app.http('updateStatus', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log(`HTTP function processed request for URL: "${request.url}"`);

    try {
      const requestBody = await request.json(); 
      context.log('Request body:', requestBody);
      const { status, wo_id } = requestBody.updateStatus;

      const query = `
        UPDATE workorders
        SET status = $1
        WHERE wo_id = $2
        RETURNING *;
      `;
      const params = [status, wo_id];
      const result = await executeQuery(query, params, context);

      return {
        status: 200,
        body: JSON.stringify({
          message: 'Project updated successfully',
          project: result[0]
        }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      };
    } catch (error) {
      return {
        status: 500,
        body: JSON.stringify({ error: 'Internal Server Error' }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      };
    }
  }
});
