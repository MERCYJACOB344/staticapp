const { app } = require('@azure/functions');
const { Pool } = require('pg');
require('dotenv').config();

const createDatabasePool = () => {
  const isProduction = process.env.APP_ENV === 'PRODUCTION';
  return new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: 5432,
    ssl: isProduction ? { rejectUnauthorized: false } : false
  });
};

const handleDatabaseOperation = async (query, params, context) => {
  const pool = createDatabasePool();
  let client;
  try {
    client = await pool.connect();
    const result = await client.query(query, params);
    context.log('reee',result.rows);
    return {
      status: 200,
      body: JSON.stringify(result.rows),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*" 
      }
    };
  } catch (err) {
    context.log('Error executing query:', err);
    return {
      status: 500,
      body: JSON.stringify({ error: err.message }),
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
};

const parseRequestBody = async (request) => {
  const bodyText = await request.text();
  return JSON.parse(bodyText);
};
app.http('postUser', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log(`HTTP function processed request for URL: "${request.url}"`);

    const requestBody = await parseRequestBody(request);
    const { email, password } = requestBody;

    const query = 'INSERT INTO "userinfo" (email, password) VALUES ($1, $2) RETURNING *';
    const params = [email, password];

    return await handleDatabaseOperation(query, params, context);
  }
});

app.http('postWorkOrders', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    context.log(`HTTP function processed request for URL: "${request.url}"`);

    const requestBody = await parseRequestBody(request);
    context.log(requestBody);
    const { project_name, desc_of_work, start_date, status,end_date }  = requestBody.addedProjects;

    const query = 'INSERT INTO "workorders" (project_name, desc_of_work, start_date,status,end_date) VALUES ($1, $2, $3, $4,$5) RETURNING *';
    const params = [project_name, desc_of_work, start_date,status,end_date];

    return await handleDatabaseOperation(query, params, context);
  }
});
