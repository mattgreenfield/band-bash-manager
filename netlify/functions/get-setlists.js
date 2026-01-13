const { MongoClient } = require('mongodb');

let cachedClient = null;

async function connectToDatabase() {
  if (cachedClient) {
    return cachedClient;
  }
  
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  cachedClient = client;
  return client;
}

exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const client = await connectToDatabase();
    const db = client.db('setlist-app');
    
    const { id } = event.queryStringParameters || {};
    
    if (id) {
      // Get single setlist by ID
      const { ObjectId } = require('mongodb');
      const setlist = await db.collection('setlists').findOne({ _id: new ObjectId(id) });
      
      if (!setlist) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: 'Setlist not found' }),
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(setlist),
      };
    }
    
    // Get all setlists
    const setlists = await db.collection('setlists').find({}).toArray();
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(setlists),
    };
  } catch (error) {
    console.error('Error fetching setlists:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to fetch setlists' }),
    };
  }
};
