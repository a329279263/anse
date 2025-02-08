import { createEffect } from 'solid-js'
import { useStore } from '@nanostores/solid'
import { getMessagesByConversationId } from '@/stores/messages'
import { loadingStateMap, streamsMap } from '@/stores/streams'
import { promptSuggestions } from '@/stores/ui'
import { currentConversationId } from '@/stores/conversation'
import type { SuggestPayload } from '@/types/provider'

interface Props {
  setInputPrompt: (text: string) => void // 用于更新输入提示的函数
  inputRef: HTMLTextAreaElement // textarea的引用
}

export default (props: Props) => {
  const { setInputPrompt, inputRef } = props
  const $currentConversationId = useStore(currentConversationId)
  const $streamsMap = useStore(streamsMap)
  const $loadingStateMap = useStore(loadingStateMap)
  const $promptSuggestions = useStore(promptSuggestions)
  const isStreaming = () => !!$streamsMap()[$currentConversationId()]
  const isLoading = () => !!$loadingStateMap()[$currentConversationId()]

  const getSuggestionsForProvider = async(payload: SuggestPayload) => {
    const response = await fetch('https://demo-yj7h.onrender.com/single/suggest', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json', // 添加这个头部信息，告知后端发送的数据类型是 JSON
      },
      body: JSON.stringify(payload),
    })
    if (!response.ok)
      throw new Error('Failed to fetch suggestions')
    return response.json()
  }
  const fetchSuggestions = async() => {
    const suggestions = await getSuggestionsForProvider({
      model: 'gpt-3.5-turbo-0125',
      messages: [
        ...getMessagesByConversationId($currentConversationId()).map(message => ({
          role: message.role,
          content: message.content,
        })),
      ],
    })
    // 更新全局的 promptSuggestions 存储
    promptSuggestions.set(suggestions)
  }
  createEffect(() => {
    // if (!isStreaming() && !isLoading() && !!inputRef.value)
    //   fetchSuggestions()
    if (!isStreaming() && !isLoading())
      promptSuggestions.set(['2', '4', 'ertokw'])
  })

  return (
    $promptSuggestions().length > 0) && (
      <div class="flex flex-row flex-wrap gap-2">
        {$promptSuggestions().map(suggestion => (
          <button
            class="rounded bg-gray-200 px-1 py-1 text-start text-xs text-gray-900 outline-none ring-gray-500 transition duration-200 ease-in-out hover:bg-gray-100 focus-visible:ring-2"
            onClick={() => {
              props.setInputPrompt(suggestion)
              props.inputRef.value += suggestion
            }}
          >
            {suggestion}
          </button>
        ))}
      </div>
  )
}
