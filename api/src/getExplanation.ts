import { APIGatewayProxyEvent, Context, Handler } from "aws-lambda";
import * as dotenv from "dotenv";

import OpenAI from "openai";
import { getCORSHeaders } from "./utils";

dotenv.config({ path: "../.env" });

export const handler: Handler = async (event: APIGatewayProxyEvent, context: Context) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204, // No Content for preflight requests
      headers: getCORSHeaders(),
      body: "",
    };
  }

  const { clue, answer } = getClueAndAnswer(event);

  if (!clue || !answer) {
    return {
      statusCode: 400,
      headers: getCORSHeaders(),
      body: JSON.stringify({ error: "Missing clue or answer in request body" }),
    };
  }

  const prompt = formPrompt(clue, answer);

  const explanation = await askLLMForExplanation(prompt);

  return {
    statusCode: 200,
    headers: getCORSHeaders(),
    body: JSON.stringify({ explanation }),
  };
};

function getClueAndAnswer(event: APIGatewayProxyEvent): { clue: string; answer: string } {
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
    model: "gpt-4.1-nano",
    input: prompt,
  });

  return response.output_text;
}
