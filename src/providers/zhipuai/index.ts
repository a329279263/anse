import {
  handlePrompt,
  handleRapidPrompt,
} from './handler'
import type { Provider } from '@/types/provider'

const providerZhiPuAI = () => {
  const provider: Provider = {
    id: 'provider-zhipuai',
    icon: 'i-simple-icons-openai', // @unocss-include
    name: '智谱AI',
    globalSettings: [
      {
        key: 'apiKey',
        name: 'API Key',
        type: 'api-key',
      },
      {
        key: 'baseUrl',
        name: 'Base URL',
        description: '智谱 API 的基础 url.',
        type: 'input',
        default: 'https://open.bigmodel.cn',
      },
      {
        key: 'model',
        name: '通用大模型',
        description: '选择你的模型.',
        type: 'select',
        options: [
          // 根据输入的自然语言指令完成多种语言类任务，推荐使用 SSE 或异步调用方式请求接口
          { value: 'GLM-4', label: 'GLM-4' },
          // 根据输入的自然语言指令和图像信息完成任务，推荐使用 SSE 或同步调用方式请求接口 2k tokens 上下文
          { value: 'GLM-4V', label: 'GLM-4V' },
          { value: 'GLM-3-Turbo', label: 'GLM-3-Turbo' },
        ],
        default: 'GLM-4',
      },
      {
        key: 'maxTokens',
        name: 'MaxToken',
        description: '模型输出最大 tokens.',
        type: 'slider',
        min: 0,
        max: 8192,
        default: 1024,
        step: 1,
      },
      {
        key: 'messageHistorySize',
        name: '最大历史消息大小',
        description: '如果消息长度超过 MaxToken 参数，则保留的历史消息数量将被截断.',
        type: 'slider',
        min: 1,
        max: 24,
        default: 5,
        step: 1,
      },
      {
        key: 'temperature',
        name: '采样温度，控制输出的随机性',
        type: 'slider',
        description: '使用什么采样温度，在0到1之间。较高的值如0.8会使输出更随机，而较低的值如0.2会使其更集中和确定性.',
        min: 0,
        max: 1,
        default: 0.95,
        step: 0.01,
      },
      {
        key: 'top_p',
        name: '核取样',
        description: '用温度采样的另一种方法称为核采样，因此0.1意味着只考虑包含前10%概率质量的token.',
        type: 'slider',
        min: 0.01,
        max: 0.99,
        default: 0.7,
        step: 0.01,
      },
    ],
    bots: [
      {
        id: 'chat_continuous',
        type: 'chat_continuous',
        name: '连续对话',
        settings: [],
      },
      {
        id: 'chat_single',
        type: 'chat_single',
        name: '单次对话',
        settings: [],
      },
      {
        id: 'image_generation',
        type: 'image_generation',
        name: '文生图',
        settings: [],
      },
    ],
    handlePrompt,
    handleRapidPrompt,
  }
  return provider
}

export default providerZhiPuAI
