import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";
import { APIGatewayProxyEvent, Context, Handler } from "aws-lambda";

import { GetEntriesOptions, MongoDBDataStore } from "storage";

// Connect to MongoDB *outside* the handler to reuse the connection when possible
let mongoDBDataStore: MongoDBDataStore | null = null;
let connectionPromise: Promise<void> | null;

export const handler: Handler = async (event: APIGatewayProxyEvent, context: Context) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204, // No Content for preflight requests
      headers: getCORSHeaders(),
      body: "",
    };
  }

  const dataStore = await getDataStore();

  const { queryStringParameters } = event;

  if (!queryStringParameters) {
    return {
      statusCode: 400,
      headers: getCORSHeaders(),
      body: JSON.stringify({ error: "Missing query parameters" }),
    };
  }

  try {
    /* Parse query parameters */
    const options = parseGetEntriesOptions(queryStringParameters);

    /* Get entries */
    const entries = await dataStore.getEntries(options);

    /* Only return clue and answer for each entry */
    const cluesAndAnswers = entries.map((entry) => ({
      clue: entry.clue,
      answer: entry.answer,
    }));

    return {
      statusCode: 200,
      headers: getCORSHeaders(),
      body: JSON.stringify({ entries: cluesAndAnswers }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: getCORSHeaders(),
      body: JSON.stringify({ error: (error as Error).message }),
    };
  }
};

async function getDataStore(): Promise<MongoDBDataStore> {
  if (!mongoDBDataStore) {
    mongoDBDataStore = new MongoDBDataStore(await getMongoDBURI());
    connectionPromise = mongoDBDataStore.connect();
  } else if (!connectionPromise) {
    // This shouldn't ever really be the case, but just to be sure
    connectionPromise = mongoDBDataStore.connect();
  }

  await connectionPromise;

  return mongoDBDataStore;
}

async function getMongoDBURI(): Promise<string> {
  const client = new SSMClient({});
  const command = new GetParameterCommand({
    Name: process.env.MONGODB_URI_PARAMETER_NAME,
    WithDecryption: true,
  });
  const response = await client.send(command);
  if (!response.Parameter?.Value) {
    throw new Error("MongoDB URI not found in AWS Parameter Store");
  }
  return response.Parameter.Value;
}

function parseGetEntriesOptions(params: { [key: string]: string | undefined }): GetEntriesOptions {
  const { orderBy, orderDirection, pageSize, page } = params;

  console.log("Parsing GetEntriesOptions query params:", {
    orderBy,
    orderDirection,
    pageSize,
    page,
  });

  if (!orderBy || !orderDirection || !pageSize || !page) {
    throw new Error("Missing required GetEntriesOptions query parameters");
  }

  if (orderDirection !== "ASC" && orderDirection !== "DESC") {
    throw new Error("Invalid orderDirection. Must be 'ASC' or 'DESC'");
  }

  const pageSizeNum = parseInt(pageSize, 10);
  const pageNum = parseInt(page, 10);

  if (isNaN(pageSizeNum) || isNaN(pageNum)) {
    throw new Error("Invalid pageSize or page. Must be integers");
  }

  return {
    orderBy,
    orderDirection,
    pageSize: pageSizeNum,
    page: pageNum,
  };
}

function getCORSHeaders(): { [key: string]: string } {
  return {
    "Access-Control-Allow-Origin": "*", // Fine for development
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
