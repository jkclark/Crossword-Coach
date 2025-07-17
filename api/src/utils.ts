export function getCORSHeaders(): { [key: string]: string } {
  return {
    "Access-Control-Allow-Origin": "*", // Fine for development
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
