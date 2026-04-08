import anthropicLogo from '@/assets/anthropic.png';
import cloudflareLogo from '@/assets/cloudflare.png';
import googleLogo from '@/assets/google.svg';
import openaiLogo from '@/assets/openai.ico';
import groqLogo from '@/assets/groq.png';
import moonshotAIlogo from '@/assets/moonshotai.svg';
import metaLogo from '@/assets/meta.svg';
import miniMaxLogo from '@/assets/minimax.svg';
import xAILogo from '@/assets/xAI.svg';
import deepseekLogo from '@/assets/deepseek.svg';
import openrouterLogo from '@/assets/openrouter.png';
import nvidiaLogo from '@/assets/nvidia.ico';
import cohereLogo from '@/assets/Cohere.png';
import mistralLogo from '@/assets/mistral.png';
import qwenLogo from '@/assets/qwen.png';
import alibabaLogo from '@/assets/alibaba.png';
import zaiLogo from '@/assets/zai.svg';
import xiaomiLogo from '@/assets/xiaomi.svg';

// Create a mapping of provider names to their logos
export const providerLogos: Record<string, string> = {
    'Anthropic': anthropicLogo,
    'Cloudflare': cloudflareLogo,
    'Google AI': googleLogo,
    'OpenAI': openaiLogo,
    "Groq": groqLogo,
    'xAI': xAILogo,
    'Meta': metaLogo,
    'DeepSeek': deepseekLogo,
    'OpenRouter': openrouterLogo,
    'Mistral': mistralLogo,
    'Cohere': cohereLogo,
    'Alibaba': alibabaLogo,
    'Xiaomi': xiaomiLogo,
};

// Add developer logos mapping (using same logos as providers)
export const developerLogos: Record<string, string> = {
    'Anthropic': anthropicLogo,
    'OpenAI': openaiLogo,
    'Google AI': googleLogo,
    'Meta': metaLogo,
    'xAI': xAILogo,
    'MiniMax': miniMaxLogo,
    'DeepSeek': deepseekLogo,
    'Moonshot AI': moonshotAIlogo,
    'Nvidia': nvidiaLogo,
    'Mistral': mistralLogo,
    'Cohere': cohereLogo,
    'Qwen': qwenLogo,
    'Z AI': zaiLogo,
    'Xiaomi': xiaomiLogo,
};

// Country flag emojis by developer
export const developerFlags: Record<string, string> = {
    'Anthropic': '🇺🇸',
    'OpenAI': '🇺🇸',
    'Google AI': '🇺🇸',
    'Meta': '🇺🇸',
    'xAI': '🇺🇸',
    'Nvidia': '🇺🇸',
    'Mistral': '🇪🇺',
    'DeepSeek': '🇨🇳',
    'MiniMax': '🇨🇳',
    'Moonshot AI': '🇨🇳',
    'Z AI': '🇨🇳',
    'Qwen': '🇨🇳',
    'Cohere': '🇨🇦',
    'Xiaomi': '🇨🇳',
};
