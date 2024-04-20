export interface ZhiPuAIFetchPayload {
  apiKey: string
  baseUrl: string
  body: Record<string, any>
  signal?: AbortSignal
}

export const fetchChatCompletion = async(payload: ZhiPuAIFetchPayload) => {
  const initOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${payload.apiKey}`,
    },
    method: 'POST',
    body: JSON.stringify(payload.body),
    signal: payload.signal,
  }
  return fetch(`${payload.baseUrl}/api/paas/v4/chat/completions`, initOptions)
}

export const fetchImageGeneration = async(payload: ZhiPuAIFetchPayload) => {
  const initOptions = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${payload.apiKey}`,
    },
    method: 'POST',
    body: JSON.stringify(payload.body),
    signal: payload.signal,
  }
  return fetch(`${payload.baseUrl}/api/paas/v4/images/generations`, initOptions)
}
