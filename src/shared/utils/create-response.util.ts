export const createResponse = (type: string, body: unknown, id = 0) =>
  JSON.stringify({ type, data: JSON.stringify(body), id })
