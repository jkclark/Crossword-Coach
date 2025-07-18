import { APIGatewayProxyEventV2, Context, Handler } from "aws-lambda";
import * as dotenv from "dotenv";
import OpenAI from "openai";

import { getDataStore } from "./connect";
import { getCORSHeaders } from "./utils";

dotenv.config({ path: "../.env" });

const ALLOWED_METHODS = "POST, OPTIONS";

export const handler: Handler = async (event: APIGatewayProxyEventV2, context: Context) => {
  if (event.requestContext.http.method === "OPTIONS") {
    return {
      statusCode: 204, // No Content for preflight requests
      headers: getCORSHeaders(ALLOWED_METHODS),
      body: "",
    };
  }

  const { clue, answer } = getClueAndAnswer(event);

  if (!clue || !answer) {
    return {
      statusCode: 400,
      headers: getCORSHeaders(ALLOWED_METHODS),
      body: JSON.stringify({ error: "Missing clue or answer in request body" }),
    };
  }

  const prompt = formPrompt(clue, answer);

  const explanation = await askLLMForExplanation(prompt);

  /* Update the entry in the database with the explanation */
  // NOTE: In theory, this could be done in a separate function or service
  // so that users don't have to wait for the explanation to be saved.
  const dataStore = await getDataStore();
  await dataStore.saveExplanation(clue, answer, explanation);

  return {
    statusCode: 200,
    headers: getCORSHeaders(ALLOWED_METHODS),
    body: JSON.stringify({ explanation }),
  };
};

function getClueAndAnswer(event: APIGatewayProxyEventV2): { clue: string; answer: string } {
  const body = JSON.parse(event.body || "{}");
  const clue = body.clue;
  const answer = body.answer;

  return { clue, answer };
}

function formPrompt(clue: string, answer: string): string {
  return `Terse crossword explanation\nclue:${clue}\nanswer:${answer}`;
}

async function askLLMForExplanation(prompt: string): Promise<string> {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: prompt,
  });

  return response.output_text;
}
