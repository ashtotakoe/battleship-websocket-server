export const createWsResponse = (type: string, body: Record<string, unknown>, id = 0) =>
  JSON.stringify({ type, data: JSON.stringify(body), id })
