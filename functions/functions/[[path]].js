
import { handleRequest } from "../server.js";

export async function onRequest(context) {
  return handleRequest(context.request, context.env);
}
