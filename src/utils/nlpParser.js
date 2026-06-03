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

/**
 * Check if LLM API is configured.
 * @returns {boolean} True if API key is available.
 */
export const isLLMConfigured = () => {
  return !!getAIConfig().apiKey;
};

/**
 * Call LLM API to parse natural language query.
 * @param {string} query - Natural language query.
 * @returns {Promise<Object>} LLM response with parsed molecule identifier.
 */
export const callLLM = async (query) => {
  const { apiKey, apiBase, model } = getAIConfig();

  if (!apiKey) {
    throw new Error('LLM API key not configured');
  }

  try {
    const systemPrompt = `You are a chemistry expert assistant. Your task is to convert natural language queries about molecules into chemical identifiers.

When given a query about a molecule, respond with ONLY a JSON object in this exact format:
{
  "moleculeName": "the chemical name or common name",
  "smiles": "SMILES string if available",
  "formula": "molecular formula if known"
}

Examples:
- Query: "Show me water molecule" → {"moleculeName": "water", "smiles": "O", "formula": "H2O"}
- Query: "Draw ethanol structure" → {"moleculeName": "ethanol", "smiles": "CCO", "formula": "C2H6O"}
- Query: "Visualize caffeine" → {"moleculeName": "caffeine", "smiles": "CN1C=NC2=C1C(=O)N(C(=O)N2C)C", "formula": "C8H10N4O2"}

Always respond with valid JSON only, no additional text.`;

    const response = await axios.post(
      `${apiBase.replace(/\/$/, '')}/chat/completions`,
      {
        model,
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: query,
          },
        ],
        temperature: 0.3,
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
        const parsed = JSON.parse(content);
        return {
          success: true,
          data: parsed,
        };
      } catch (e) {
        return {
          success: true,
          data: {
            moleculeName: content,
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

/**
 * Parse natural language query to molecule identifier.
 * @param {string} query - Natural language query.
 * @returns {Promise<Object>} Parsed molecule identifier.
 */
export const parseNaturalLanguage = async (query) => {
  try {
    if (!isLLMConfigured()) {
      throw new Error('LLM API not configured');
    }

    const result = await callLLM(query);

    if (result.success) {
      return {
        success: true,
        moleculeName: result.data.moleculeName || '',
        smiles: result.data.smiles || '',
        formula: result.data.formula || '',
      };
    }

    throw new Error('Failed to parse query');
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

export const extractMoleculeName = (query) => {
  let cleaned = query
    .replace(/^(show|draw|visualize|display|render)\s+/i, '')
    .replace(/\s+(molecule|structure|model|compound)$/i, '')
    .replace(/\s+(of|the)\s+/i, ' ')
    .trim();

  return cleaned;
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
    (data.moleculeName || data.smiles || data.formula)
  );
};
