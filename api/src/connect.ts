import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";

import { DataStore, MongoDBDataStore } from "storage";

/* Connect to MongoDB *outside* the handler to reuse the connection when possible */
export let dataStore: DataStore | null = null;
export let connectionPromise: Promise<void> | null = null;

export async function getDataStore(): Promise<DataStore> {
  if (!dataStore) {
    dataStore = new MongoDBDataStore(await getMongoDBURI());
    connectionPromise = dataStore.connect();
  } else if (!connectionPromise) {
    // This shouldn't ever really be the case, but just to be sure
    connectionPromise = dataStore.connect();
  }

  await connectionPromise;

  return dataStore;
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
