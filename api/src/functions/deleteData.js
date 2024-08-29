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

async function executeQuery(query, params = []) {
  const pool = createPool();
  let client;

  try {
    client = await pool.connect();
    const result = await client.query(query, params);
    return result.rows;
  } catch (err) {
    throw new Error(`Error executing query: ${err.message}`);
  } finally {
    if (client) {
      client.release();
    }
  }
}

async function handleDeleteRequest(query, params, context) {
  try {
    await executeQuery(query, params);
    context.log('Delete operation successful for params:', params);

    return {
      status: 200,
      body: JSON.stringify({ deletedId: params[0] }), // Respond with the deleted ID or any relevant information
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" // Allow CORS if needed
      }
    };
  } catch (err) {
    context.log('Error:', err.message);

    return {
      status: 500,
      body: JSON.stringify({ error: err.message }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    };
  }
}

app.http('deleteWorkOrder', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
        const requestBody = await request.json(); 
      context.log('Request body:', requestBody);

      const { wo_id } = requestBody.deletedProjects;

      const query = 'DELETE FROM workorders WHERE wo_id = $1';
      const params = [wo_id];

      return await handleDeleteRequest(query, params, context);
    } catch (error) {
      context.log('Error processing request:', error);

      return {
        status: 500,
        body: JSON.stringify({ message: 'Internal Server Error' }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      };
    }
  }
});
