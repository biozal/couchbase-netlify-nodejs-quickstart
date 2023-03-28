const couchbase = require("couchbase");
require("dotenv").config();

const ENDPOINT = process.env.COUCHBASE_ENDPOINT;
const USERNAME = process.env.COUCHBASE_USERNAME;
const PASSWORD = process.env.COUCHBASE_PASSWORD;

const couchbaseClientPromise = couchbase.connect("couchbases://" + ENDPOINT, {
  username: USERNAME,
  password: PASSWORD,
  timeouts: {
    kvTimeout: 10000, // milliseconds
  },
});

// Docs on event and context https://docs.netlify.com/functions/build/#code-your-function-2
const handler = async (event) => {
  // only allow GET requests
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
    };
  }

  try {
    const cluster = await couchbaseClientPromise;
    const results = await cluster.query(
      "SELECT * from `travel-sample`.inventory.airline LIMIT 5"
    );

    return {
      statusCode: 200,
      body: JSON.stringify(results),
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};

module.exports = { handler };
