import React, { useState } from 'react';

const EXAMPLE_MOLECULES = [
  { label: '水', query: 'water' },
  { label: '乙醇', query: 'ethanol' },
  { label: '咖啡因', query: 'caffeine' },
  { label: '阿司匹林', query: 'aspirin' },
  { label: '阿莫西林', query: 'amoxicillin' },
  { label: '葡萄糖', query: 'glucose' },
  { label: '苯', query: 'benzene' },
];

/**
 * SearchBar Component
 * 标准搜索：支持化学名称、分子式与 SMILES。
 * 自然语言查询由独立的 NLPInput 组件负责，避免界面重复。
 */
const SearchBar = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      onSearch(trimmedQuery, 'standard');
      setQuery('');
    }
  };

  const handleExampleSearch = (exampleQuery) => {
    if (!isLoading) {
      onSearch(exampleQuery, 'standard');
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
        <div>
          <h3 className="text-lg font-semibold text-gray-800">🔎 标准搜索</h3>
          <p className="text-sm text-gray-600 mt-1">
            直接输入英文化学名称、常见中文名、分子式或 SMILES 字符串生成分子结构。
          </p>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="例如：Amoxicillin、阿莫西林、C16H19N3O5S，或 SMILES：CCO"
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

        <div className="rounded-md bg-blue-50 border border-blue-100 px-4 py-3">
          <p className="text-sm font-semibold text-gray-700 mb-2">⚡ 示例分子快捷入口</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_MOLECULES.map((item) => (
              <button
                key={item.query}
                type="button"
                onClick={() => handleExampleSearch(item.query)}
                disabled={isLoading}
                className="px-3 py-1.5 rounded-full bg-white border border-blue-200 text-blue-700 text-sm hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="text-sm text-gray-600 bg-gray-50 border border-gray-100 rounded-md px-4 py-3">
          💡 标准搜索适合已知分子名称或结构标识；想用“显示某某分子”这类描述时，请使用下方自然语言查询。
        </div>
      </div>
    </div>
  );
};

export default SearchBar;