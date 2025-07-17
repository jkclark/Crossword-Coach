import { APIGatewayProxyEvent, Context, Handler } from "aws-lambda";

import { Entry } from "common";
import { GetEntriesOptions } from "storage";
import { getDataStore } from "./connect";
import { getCORSHeaders } from "./utils";

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

    /* Only return clue, answer, and explanation (if present) for each entry */
    const cluesAnswersAndExplanations = entries.map((entry) => {
      const entryObj: Entry = {
        clue: entry.clue,
        answer: entry.answer,
      };

      if (entry.explanation !== undefined) {
        entryObj.explanation = entry.explanation;
      }

      return entryObj;
    });

    return {
      statusCode: 200,
      headers: getCORSHeaders(),
      body: JSON.stringify({ entries: cluesAnswersAndExplanations }),
    };
  } catch (error) {
    return {
      statusCode: 400,
      headers: getCORSHeaders(),
      body: JSON.stringify({ error: (error as Error).message }),
    };
  }
};

function parseGetEntriesOptions(params: { [key: string]: string | undefined }): GetEntriesOptions {
  const { source, dayOfWeek, answerLengthMin, answerLengthMax, orderBy, orderDirection, pageSize, page } =
    params;

  console.log("Parsing GetEntriesOptions query params:", {
    source,
    dayOfWeek,
    answerLengthMin,
    answerLengthMax,
    orderBy,
    orderDirection,
    pageSize,
    page,
  });

  /* Required parameters */
  if (!orderBy || !orderDirection || !pageSize || !page) {
    throw new Error("Missing required GetEntriesOptions query parameters");
  }

  /* Filtering */
  // Cannot filter by day of week without a specific source
  if (dayOfWeek && !source) {
    throw new Error("dayOfWeek requires source to be specified");
  }

  // Day of week must be an integer if provided
  if (dayOfWeek && isNaN(parseInt(dayOfWeek, 10))) {
    throw new Error("Invalid dayOfWeek. Must be an integer");
  }

  // Answer length min and max must be provided together
  if ((answerLengthMin && !answerLengthMax) || (!answerLengthMin && answerLengthMax)) {
    throw new Error("Both answerLengthMin and answerLengthMax must be provided together");
  }

  // Answer length min must be an integer if provided
  if (answerLengthMin && isNaN(parseInt(answerLengthMin, 10))) {
    throw new Error("Invalid answerLengthMin. Must be an integer");
  }

  // Answer length max must be an integer if provided
  if (answerLengthMax && isNaN(parseInt(answerLengthMax, 10))) {
    throw new Error("Invalid answerLengthMax. Must be an integer");
  }

  // Answer length min and max must be non-negative integers
  if (
    (answerLengthMin && parseInt(answerLengthMin, 10) < 0) ||
    (answerLengthMax && parseInt(answerLengthMax, 10) < 0)
  ) {
    throw new Error("answerLengthMin and answerLengthMax must be non-negative integers");
  }

  // Answer length min must be less than or equal to max
  if (answerLengthMin && answerLengthMax && parseInt(answerLengthMin, 10) > parseInt(answerLengthMax, 10)) {
    throw new Error("answerLengthMin must be less than or equal to answerLengthMax");
  }

  /* Ordering */
  if (orderDirection !== "ASC" && orderDirection !== "DESC") {
    throw new Error("Invalid orderDirection. Must be 'ASC' or 'DESC'");
  }

  /* Pagination */
  const pageSizeNum = parseInt(pageSize, 10);
  const pageNum = parseInt(page, 10);

  if (isNaN(pageSizeNum) || isNaN(pageNum)) {
    throw new Error("Invalid pageSize or page. Must be integers");
  }

  return {
    /* Filtering */
    source: source || undefined,
    dayOfWeek: dayOfWeek ? parseInt(dayOfWeek, 10) : undefined,
    answerLength:
      answerLengthMin && answerLengthMax
        ? { min: parseInt(answerLengthMin, 10), max: parseInt(answerLengthMax, 10) }
        : undefined,

    /* Ordering */
    orderBy,
    orderDirection,

    /* Pagination */
    pageSize: pageSizeNum,
    page: pageNum,
  };
}
