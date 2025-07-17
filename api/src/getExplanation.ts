import { APIGatewayProxyEvent, Context, Handler } from "aws-lambda";

import { getCORSHeaders } from "./utils";

export const handler: Handler = async (event: APIGatewayProxyEvent, context: Context) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204, // No Content for preflight requests
      headers: getCORSHeaders(),
      body: "",
    };
  }

  return {
    statusCode: 501, // Not Implemented
    headers: getCORSHeaders(),
    body: JSON.stringify({ error: "This endpoint is not implemented yet." }),
  };
};
