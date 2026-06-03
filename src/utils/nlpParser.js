/**
 * Natural Language Processing Parser
 * Converts natural language queries to molecule identifiers using LLM
 * Supports SiliconFlow API for LLM inference
 */

import axios from 'axios';

const SILICON_API_KEY = import.meta.env.VITE_SILICON_API_KEY;
const SILICON_API_BASE = import.meta.env.VITE_SILICON_API_BASE || 'https://api.siliconflow.cn/v1';
const LLM_MODEL = import.meta.env.VITE_LLM_MODEL || 'Qwen/Qwen2.5-7B-Instruct';

/**
 * Check if LLM API is configured
 * @returns {boolean} True if API key is available
 */
export const isLLMConfigured = () => {
  return !!SILICON_API_KEY;
};

/**
 * Call LLM API to parse natural language query
 * @param {string} query - Natural language query
 * @returns {Promise<Object>} LLM response with parsed molecule identifier
 */
export const callLLM = async (query) => {
  if (!SILICON_API_KEY) {
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
      `${SILICON_API_BASE}/chat/completions`,
      {
        model: LLM_MODEL,
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
          'Authorization': `Bearer ${SILICON_API_KEY}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    if (response.data?.choices?.[0]?.message?.content) {
      const content = response.data.choices[0].message.content.trim();
      
      // Try to parse JSON response
      try {
        const parsed = JSON.parse(content);
        return {
          success: true,
          data: parsed,
        };
      } catch (e) {
        // If JSON parsing fails, try to extract molecule name from response
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
 * Parse natural language query to molecule identifier
 * @param {string} query - Natural language query
 * @returns {Promise<Object>} Parsed molecule identifier
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

/**
 * Extract molecule name from various query formats
 * @param {string} query - User query
 * @returns {string} Extracted molecule name
 */
export const extractMoleculeName = (query) => {
  // Remove common phrases
  let cleaned = query
    .replace(/^(show|draw|visualize|display|render)\s+/i, '')
    .replace(/\s+(molecule|structure|model|compound)$/i, '')
    .replace(/\s+(of|the)\s+/i, ' ')
    .trim();

  return cleaned;
};

/**
 * Batch parse multiple natural language queries
 * @param {Array<string>} queries - Array of natural language queries
 * @returns {Promise<Array>} Array of parsed results
 */
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

/**
 * Validate parsed molecule data
 * @param {Object} data - Parsed molecule data
 * @returns {boolean} True if data is valid
 */
export const validateParsedData = (data) => {
  return (
    data &&
    typeof data === 'object' &&
    (data.moleculeName || data.smiles || data.formula)
  );
};
