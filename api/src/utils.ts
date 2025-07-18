/**
 *
 * @param methods - Comma-separated list of HTTP methods allowed for CORS requests.
 * @returns An object containing CORS headers.
 */
export function getCORSHeaders(methods: string): { [key: string]: string } {
  return {
    "Access-Control-Allow-Origin": "*", // Fine for development
    "Access-Control-Allow-Methods": methods,
    "Access-Control-Allow-Headers": "Content-Type",
  };
}
