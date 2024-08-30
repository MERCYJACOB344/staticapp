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

async function handleUpdateRequest(query, params, context) {
  try {
    const result = await executeQuery(query, params, context);

    if (result.length === 0) {
      return {
        status: 404,
        body: JSON.stringify({ error: 'Work request not found' }),
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
        }
      };
    }

    return {
      status: 200,
      body: JSON.stringify({
        message: 'Work request updated successfully',
        data: result[0]
      }),
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*"
      }
    };
  } catch (error) {
    context.log('Error updating work request:', error.message);
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
app.http('updateWorkRequest', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      // Parse the request body
      const bodyText = await request.text();
      const workOrderData = JSON.parse(bodyText);

      // Log the parsed data for debugging
      context.log('Parsed work order data:', workOrderData);

      const {
        projectName,
        requesterId,
        contactNumber,
        workTypeId,
        workDescription,
        authorizerId,
        startDate,
        endDate,
        status,
        latitudeLongitude,
        workTickets,
        specialInstructions,
        designEngineerId,
        uploadAttachment,
        wo_id
      } = workOrderData;

      const parseDate = (dateString) => {
        return dateString ? new Date(dateString).toISOString().split('T')[0] : null;
      };

      const parsedStartDate = parseDate(startDate);
      const parsedEndDate = parseDate(endDate);

      const updateQuery = `
        UPDATE workorders
        SET project_name = $1,
            requested_by = $2,
            contact_number = $3,
            type_of_work = $4,
            desc_of_work = $5,
            work_auth_by = $6,
            start_date = $7,
            end_date = $8,
            status = $9,
            lat_long = $10,
            work_tickets_req = $11,
            special_instr = $12,
            design_engineer = $13,
            uploadattachments = $14
        WHERE wo_id = $15
        RETURNING *;
      `;

      return await handleUpdateRequest(updateQuery, [
        projectName,
        requesterId,
        contactNumber,
        workTypeId,
        workDescription,
        authorizerId,
        parsedStartDate,
        parsedEndDate,
        status,
        latitudeLongitude,
        workTickets,
        specialInstructions,
        designEngineerId,
        uploadAttachment,
        wo_id
      ], context);
    } catch (error) {
      context.log('Error in updateWorkRequest handler:', error.message);
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