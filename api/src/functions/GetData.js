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


async function handleGetRequest(query, context) {
  try {
    const rows = await executeQuery(query);
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




app.http('getUsers',{
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const query = 'SELECT * FROM userinfo';
    return await handleGetRequest(query, context);
  }
});


app.http('getWorkOrders', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const query = 'SELECT wo_id, project_name,status,desc_of_work,start_date,end_date,lat_long FROM workorders';
    return await handleGetRequest(query, context);
  }
});


