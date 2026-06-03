import React, { useEffect, useState } from 'react';
import { isLLMConfigured } from '../utils/nlpParser';

/**
 * SearchBar Component
 * 支持化学名称、分子式、SMILES 与自然语言查询。
 */
const SearchBar = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [inputMode, setInputMode] = useState('standard');
  const [hasLLM, setHasLLM] = useState(isLLMConfigured());

  useEffect(() => {
    const refreshConfigState = () => {
      setHasLLM(isLLMConfigured());
      if (!isLLMConfigured()) {
        setInputMode('standard');
      }
    };

    window.addEventListener('ai-config-updated', refreshConfigState);
    return () => window.removeEventListener('ai-config-updated', refreshConfigState);
  }, []);

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query, inputMode);
      setQuery('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleSearch();
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col gap-4">
        {hasLLM ? (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setInputMode('standard')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                inputMode === 'standard'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              标准输入
            </button>
            <button
              onClick={() => setInputMode('nlp')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                inputMode === 'nlp'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              自然语言
            </button>
          </div>
        ) : (
          <div className="rounded-md bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-800">
            如需使用自然语言搜索，请先在下方“AI 配置”中填写自己的 API Key 并选择模型。
          </div>
        )}

        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              inputMode === 'nlp'
                ? '例如：“显示水分子”或“绘制乙醇结构”'
                : '例如：Amoxicillin、C16H19N3O5S，或 SMILES：CC(C)CC1=CC=C(C=C1)C(C)C'
            }
            disabled={isLoading}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors"
          />
          <button
            onClick={handleSearch}
            disabled={isLoading || !query.trim()}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                加载中...
              </span>
            ) : (
              '可视化'
            )}
          </button>
        </div>

        <div className="text-sm text-gray-600">
          {inputMode === 'nlp' ? (
            <p>💡 用自然语言描述分子，AI 会自动转换为可搜索的化学标识。</p>
          ) : (
            <p>💡 支持格式：化学名称、分子式或 SMILES 字符串。</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
