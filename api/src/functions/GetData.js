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
    const serializedRows = rows.map(row => {
      return {
        ...row,
        uploadattachments: row.uploadattachments ? JSON.stringify(row.uploadattachments) : []
      };
    });

    return {
      status: 200,
      body: JSON.stringify(serializedRows),
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

app.http('getAllWorkOrders', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const query = 'SELECT * FROM workorders';
    return await handleGetRequest(query, context);
  }
});
app.http('getWorkOrderByWoId', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {

    const wo_id = request.headers['wo_id']; 




  
    if (!wo_id) {
      context.res = {
        status: 400,
        body: 'wo_id query parameter is required.',
      };
      return;
    }

    // SQL query to fetch data
    const query = 'SELECT * FROM workorders WHERE wo_id = $1';

    try {
      // Call your function to execute the query
      const result = await handleGetRequest(query, [wo_id]);

      // Return the result
      context.res = {
        status: 200,
        body: result,
      };
    } catch (error) {
      console.error('Error:', error);
      context.res = {
        status: 500,
        body: 'An error occurred while fetching the work order.',
      };
    }
  }
});

// app.http('getEditData', {
//   methods: ['GET'],
//   authLevel: 'anonymous',
//   handler: async (request, context) => {
    
//     const headersMap = request.headers[Symbol.for('headers map')];

//     // Fetch the 'wo_id' value from the headers map
//     const woIdHeader = headersMap.get('wo_id');
//     const wo_id = woIdHeader ? woIdHeader.value : undefined;
 
// context.log('woo-id',wo_id);
//     const query = "SELECT * FROM workorders WHERE wo_id = $1";
//     return await handleGetRequest(query, [wo_id]);
//   }
// });


app.http('getWorkType', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const query = 'SELECT work_id, work_type FROM type_of_work';
    return await handleGetRequest(query, context);
  }
});


app.http('getStatuses', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const query = 'SELECT status_id, status_name FROM work_order_status';
    return await handleGetRequest(query, context);
  }
});


app.http('getAuthorizers', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const query = "SELECT user_id, user_name FROM design_engineers WHERE user_role = 'Manager'";
    return await handleGetRequest(query, context);
  }
});


app.http('getRequesters', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const query = 'SELECT client_id, client_name FROM requesters';
    return await handleGetRequest(query, context);
  }
});

app.http('getDesignEngineers', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const query = "SELECT user_id, user_name FROM design_engineers WHERE user_role LIKE '%Engineer'";
    return await handleGetRequest(query, context);
  }
});

