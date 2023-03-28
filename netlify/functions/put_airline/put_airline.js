const couchbase = require('couchbase')
require('dotenv').config()

const ENDPOINT = process.env.COUCHBASE_ENDPOINT
const USERNAME = process.env.COUCHBASE_USERNAME
const PASSWORD = process.env.COUCHBASE_PASSWORD
const BUCKET = process.env.COUCHBASE_BUCKET

const couchbaseClientPromise = couchbase.connect('couchbases://' + ENDPOINT, {
  username: USERNAME,
  password: PASSWORD,
  timeouts: {
    kvTimeout: 10000, // milliseconds
  },
})

const handler = async (event) => {
  // only allow PUT requests
  if (event.httpMethod !== 'PUT') {
    return {
      statusCode: 405,
    }
  }

  try {
    const cluster = await couchbaseClientPromise
    const bucket = cluster.bucket(BUCKET)
    const scope = bucket.scope('inventory')
    const collection = scope.collection('airline')

    // NOTE: we could also populate this document by fetching an ID to update to make it more dynamic
    const modifiedAirline = {
      callsign: 'MILE-AIR',
      country: JSON.parse(event.body).country,
      iata: 'Q5',
      icao: 'MLA',
      id: 10,
      name: '40-Mile-Air',
      type: 'airline',
    }

    const idToUpsert = modifiedAirline.type + '_' + modifiedAirline.id

    const result = await collection.upsert(idToUpsert, modifiedAirline)

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }