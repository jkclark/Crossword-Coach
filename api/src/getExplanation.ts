import { APIGatewayProxyEvent, Handler } from "aws-lambda";

import { getCORSHeaders } from "./utils";

export const handler: Handler = async (event: APIGatewayProxyEvent, context: Context) => {
  return {
    statusCode: 501, // Not Implemented
    headers: getCORSHeaders(),
    body: JSON.stringify({ error: "This endpoint is not implemented yet." }),
  };
};
