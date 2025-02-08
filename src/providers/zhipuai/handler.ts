import { fetchChatCompletion, fetchImageGeneration } from './api'
import { parseStream } from './parser'
import type { Message } from '@/types/message'
import type { HandlerPayload, Provider, SettingsPayload } from '@/types/provider'

export const handlePrompt: Provider['handlePrompt'] = async(payload, signal?: AbortSignal) => {
  if (payload.botId === 'chat_continuous')
    return handleChatCompletion(payload, signal)
  if (payload.botId === 'chat_single')
    return handleChatCompletion(payload, signal)
  if (payload.botId === 'image_generation')
    return handleImageGeneration(payload)
}

export const handleRapidPrompt: Provider['handleRapidPrompt'] = async(prompt, globalSettings) => {
  const rapidPromptPayload = {
    conversationId: 'temp',
    conversationType: 'chat_single',
    botId: 'temp',
    globalSettings: {
      ...globalSettings,
      model: 'GLM-4',
      temperature: 0.4,
      maxTokens: 16384,
      top_p: 0.7,
      stream: false,
    },
    botSettings: {},
    prompt,
    messages: [{ role: 'user', content: prompt }],
  } as HandlerPayload
  const result = await handleChatCompletion(rapidPromptPayload)
  if (typeof result === 'string')
    return result
  return ''
}

const API_KEY_ENV_VAR = 'PUBLIC_ZHIPUAPI_API_KEY'

const getApiKey = (globalSettings: SettingsPayload) => {
  // 如果 globalSettings 中有 apiKey，使用它；否则，使用环境变量中的值。
  return (globalSettings.apiKey || import.meta.env[API_KEY_ENV_VAR]) as string
}

const handleChatCompletion = async(payload: HandlerPayload, signal?: AbortSignal) => {
  // An array to store the chat messages
  const messages: Message[] = []

  let maxTokens = payload.globalSettings.maxTokens as number
  let messageHistorySize = payload.globalSettings.messageHistorySize as number

  // Iterate through the message history
  while (messageHistorySize > 0) {
    messageHistorySize--
    // Get the last message from the payload
    const m = payload.messages.pop()
    if (m === undefined)
      break

    if (maxTokens - m.content.length < 0)
      break

    maxTokens -= m.content.length
    messages.unshift(m)
  }
  const response = await fetchChatCompletion({
    apiKey: getApiKey(payload.globalSettings),
    baseUrl: (payload.globalSettings.baseUrl as string).trim().replace(/\/$/, ''),
    body: {
      messages,
      max_tokens: maxTokens,
      model: payload.globalSettings.model as string,
      temperature: payload.globalSettings.temperature as number,
      top_p: payload.globalSettings.topP as number,
      stream: payload.globalSettings.stream as boolean ?? true,
    },
    signal,
  })
  if (!response.ok) {
    const responseJson = await response.json()
    console.log('responseJson', responseJson)
    const errMessage = responseJson.error?.message || response.statusText || 'Unknown error'
    throw new Error(errMessage, { cause: responseJson.error })
  }
  const isStream = response.headers.get('content-type')?.includes('text/event-stream')
  if (isStream) {
    return parseStream(response)
  } else {
    const resJson = await response.json()
    return resJson.choices[0].message.content as string
  }
}

const handleImageGeneration = async(payload: HandlerPayload) => {
  const prompt = payload.prompt
  const response = await fetchImageGeneration({
    apiKey: getApiKey(payload.globalSettings),
    baseUrl: (payload.globalSettings.baseUrl as string).trim().replace(/\/$/, ''),
    body: {
      prompt,
      model: 'CogView-3',
    },
  })
  if (!response.ok) {
    const responseJson = await response.json()
    const errMessage = responseJson.error?.message || response.statusText || 'Unknown error'
    throw new Error(errMessage)
  }
  const resJson = await response.json()
  return resJson.data[0].url
}
