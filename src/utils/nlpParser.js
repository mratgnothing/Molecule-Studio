/**
 * Natural Language Processing Parser
 * Converts natural language queries to molecule identifiers using an OpenAI-compatible LLM API.
 * Runtime configuration is stored in localStorage so users can enter their own API key and model in the browser.
 */

import axios from 'axios';

const DEFAULT_API_BASE = import.meta.env.VITE_SILICON_API_BASE || 'https://api.siliconflow.cn/v1';
const DEFAULT_MODEL = import.meta.env.VITE_LLM_MODEL || 'Qwen/Qwen2.5-7B-Instruct';
const ENV_API_KEY = import.meta.env.VITE_SILICON_API_KEY || '';
const STORAGE_KEY = 'molecule_studio_ai_config';

const DEFAULT_CONFIG = {
  apiKey: ENV_API_KEY,
  apiBase: DEFAULT_API_BASE,
  model: DEFAULT_MODEL,
};

const LOCAL_MOLECULE_ALIASES = [
  { keys: ['阿司匹林', 'aspirin'], name: 'aspirin', formula: 'C9H8O4' },
  { keys: ['咖啡因', 'caffeine'], name: 'caffeine', formula: 'C8H10N4O2' },
  { keys: ['阿莫西林', 'amoxicillin'], name: 'amoxicillin', formula: 'C16H19N3O5S' },
  { keys: ['水分子', '水', 'water'], name: 'water', formula: 'H2O' },
  { keys: ['乙醇', '酒精', 'ethanol'], name: 'ethanol', formula: 'C2H6O' },
  { keys: ['甲醇', 'methanol'], name: 'methanol', formula: 'CH4O' },
  { keys: ['葡萄糖', 'glucose'], name: 'glucose', formula: 'C6H12O6' },
  { keys: ['苯', 'benzene'], name: 'benzene', formula: 'C6H6' },
  { keys: ['甲烷', 'methane'], name: 'methane', formula: 'CH4' },
  { keys: ['乙酸', '醋酸', 'acetic acid'], name: 'acetic acid', formula: 'C2H4O2' },
];

export const MODEL_OPTIONS = [
  'Qwen/Qwen2.5-7B-Instruct',
  'Qwen/Qwen2.5-14B-Instruct',
  'Qwen/Qwen2.5-32B-Instruct',
  'deepseek-ai/DeepSeek-V3',
  'deepseek-ai/DeepSeek-R1',
  'THUDM/glm-4-9b-chat',
];

export const getAIConfig = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_CONFIG;
  }

  try {
    const rawConfig = window.localStorage.getItem(STORAGE_KEY);
    if (!rawConfig) {
      return DEFAULT_CONFIG;
    }

    const parsedConfig = JSON.parse(rawConfig);
    return {
      apiKey: parsedConfig.apiKey || DEFAULT_CONFIG.apiKey,
      apiBase: parsedConfig.apiBase || DEFAULT_CONFIG.apiBase,
      model: parsedConfig.model || DEFAULT_CONFIG.model,
    };
  } catch (error) {
    console.warn('Failed to read AI config from localStorage:', error);
    return DEFAULT_CONFIG;
  }
};

export const saveAIConfig = (config) => {
  if (typeof window === 'undefined') return;

  const normalizedConfig = {
    apiKey: config.apiKey?.trim() || '',
    apiBase: config.apiBase?.trim() || DEFAULT_API_BASE,
    model: config.model?.trim() || DEFAULT_MODEL,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedConfig));
  window.dispatchEvent(new Event('ai-config-updated'));
};

export const clearAIConfig = () => {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event('ai-config-updated'));
};

export const isLLMConfigured = () => {
  return !!getAIConfig().apiKey;
};

const stripMarkdownCodeFence = (content) => {
  return content
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```$/i, '')
    .trim();
};

const parseLLMJson = (content) => {
  const cleaned = stripMarkdownCodeFence(content);

  try {
    return JSON.parse(cleaned);
  } catch (error) {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw error;
  }
};

export const extractMoleculeName = (query) => {
  return String(query || '')
    .replace(/^(show|draw|visualize|display|render|please|绘制|显示|可视化|生成|打开|查看)\s*/i, '')
    .replace(/(分子|结构|模型|compound|molecule|structure|model)/gi, '')
    .replace(/["'“”‘’，。,.!?？]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export const parseLocalNaturalLanguage = (query) => {
  const original = String(query || '').trim();
  const lower = original.toLowerCase();
  const cleaned = extractMoleculeName(original);

  for (const item of LOCAL_MOLECULE_ALIASES) {
    if (item.keys.some((key) => lower.includes(key.toLowerCase()) || cleaned.toLowerCase() === key.toLowerCase())) {
      return {
        success: true,
        source: 'local',
        moleculeName: item.name,
        smiles: '',
        formula: item.formula,
        candidates: [item.name, item.formula, cleaned, original].filter(Boolean),
      };
    }
  }

  if (cleaned) {
    return {
      success: true,
      source: 'local-cleaned',
      moleculeName: cleaned,
      smiles: '',
      formula: '',
      candidates: [cleaned, original].filter(Boolean),
    };
  }

  return null;
};

export const callLLM = async (query) => {
  const { apiKey, apiBase, model } = getAIConfig();

  if (!apiKey) {
    throw new Error('LLM API key not configured');
  }

  try {
    const systemPrompt = `You are a chemistry expert assistant. Convert natural language queries about molecules into PubChem-searchable identifiers.

Return ONLY a valid JSON object in this exact format:
{
  "moleculeName": "English chemical name or English common name, never Chinese",
  "smiles": "valid SMILES string only if you are absolutely confident, otherwise empty string",
  "formula": "molecular formula only if you are absolutely confident, otherwise empty string"
}

Rules:
- If the user asks in Chinese, translate the molecule name into English before returning JSON.
- Prefer a correct common English name.
- Leave SMILES and formula empty when unsure.
- Do not include Markdown code fences or extra explanation.

Examples:
- Query: "显示水分子" -> {"moleculeName":"water","smiles":"","formula":"H2O"}
- Query: "绘制乙醇结构" -> {"moleculeName":"ethanol","smiles":"","formula":"C2H6O"}
- Query: "Visualize caffeine" -> {"moleculeName":"caffeine","smiles":"","formula":"C8H10N4O2"}
- Query: "显示阿莫西林" -> {"moleculeName":"amoxicillin","smiles":"","formula":"C16H19N3O5S"}`;

    const response = await axios.post(
      `${apiBase.replace(/\/$/, '')}/chat/completions`,
      {
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query },
        ],
        temperature: 0.1,
        max_tokens: 200,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    if (response.data?.choices?.[0]?.message?.content) {
      const content = response.data.choices[0].message.content.trim();

      try {
        const parsed = parseLLMJson(content);
        return {
          success: true,
          data: parsed,
        };
      } catch (e) {
        return {
          success: true,
          data: {
            moleculeName: extractMoleculeName(content),
            smiles: '',
            formula: '',
          },
        };
      }
    }

    throw new Error('Invalid LLM response format');
  } catch (error) {
    throw new Error(`LLM API call failed: ${error.message}`);
  }
};

export const parseNaturalLanguage = async (query) => {
  try {
    const localResult = parseLocalNaturalLanguage(query);

    if (!isLLMConfigured()) {
      if (localResult) return localResult;
      throw new Error('LLM API not configured');
    }

    let llmResult = null;
    try {
      llmResult = await callLLM(query);
    } catch (error) {
      if (localResult) return localResult;
      throw error;
    }

    if (llmResult.success) {
      const moleculeName = llmResult.data.moleculeName || localResult?.moleculeName || '';
      const smiles = llmResult.data.smiles || '';
      const formula = llmResult.data.formula || localResult?.formula || '';
      const candidates = [
        moleculeName,
        localResult?.moleculeName,
        smiles,
        formula,
        ...(localResult?.candidates || []),
        extractMoleculeName(query),
        query,
      ].filter(Boolean);

      return {
        success: true,
        source: localResult ? 'local+llm' : 'llm',
        moleculeName,
        smiles,
        formula,
        candidates: [...new Set(candidates)],
      };
    }

    if (localResult) return localResult;
    throw new Error('Failed to parse query');
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const batchParseNaturalLanguage = async (queries) => {
  try {
    const results = await Promise.all(
      queries.map(query => parseNaturalLanguage(query))
    );
    return results;
  } catch (error) {
    throw new Error(`Batch parsing failed: ${error.message}`);
  }
};

export const validateParsedData = (data) => {
  return (
    data &&
    typeof data === 'object' &&
    (data.moleculeName || data.smiles || data.formula || data.candidates?.length)
  );
};