import React, { useEffect, useState } from 'react';
import {
  clearAIConfig,
  getAIConfig,
  MODEL_OPTIONS,
  saveAIConfig,
} from '../utils/nlpParser';

const AIConfigPanel = () => {
  const [apiKey, setApiKey] = useState('');
  const [apiBase, setApiBase] = useState('');
  const [model, setModel] = useState('');
  const [customModel, setCustomModel] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const loadConfig = () => {
    const config = getAIConfig();
    setApiKey(config.apiKey || '');
    setApiBase(config.apiBase || '');

    if (MODEL_OPTIONS.includes(config.model)) {
      setModel(config.model);
      setCustomModel('');
    } else {
      setModel('custom');
      setCustomModel(config.model || '');
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = () => {
    const selectedModel = model === 'custom' ? customModel : model;
    saveAIConfig({
      apiKey,
      apiBase,
      model: selectedModel,
    });
    setSavedMessage('配置已保存到本浏览器。现在可以使用自然语言搜索。');
    setTimeout(() => setSavedMessage(''), 3500);
  };

  const handleReset = () => {
    clearAIConfig();
    loadConfig();
    setSavedMessage('已清除本地配置。');
    setTimeout(() => setSavedMessage(''), 3500);
  };

  const selectedModel = model === 'custom' ? customModel : model;
  const isReady = Boolean(apiKey.trim() && apiBase.trim() && selectedModel.trim());

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">⚙️ AI 配置</h3>
          <p className="text-sm text-gray-600 mt-1">
            填入自己的 OpenAI 兼容接口 Key，并选择用于自然语言解析的模型。
          </p>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors text-sm font-medium"
        >
          {isExpanded ? '收起配置' : '展开配置'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-5 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              API Key
            </label>
            <div className="flex gap-2">
              <input
                type={showSecret ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="请输入你自己的 API Key"
                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="px-4 py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {showSecret ? '隐藏' : '显示'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Key 只会保存在当前浏览器 localStorage 中，不会提交到 GitHub 仓库。
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              API Base
            </label>
            <input
              type="text"
              value={apiBase}
              onChange={(e) => setApiBase(e.target.value)}
              placeholder="https://api.siliconflow.cn/v1"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              模型
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors bg-white"
            >
              {MODEL_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
              <option value="custom">自定义模型名称...</option>
            </select>
          </div>

          {model === 'custom' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                自定义模型名称
              </label>
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="例如：Qwen/Qwen2.5-72B-Instruct"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={!isReady}
              className="px-5 py-3 rounded-lg bg-blue-500 text-white font-semibold hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              保存配置
            </button>
            <button
              onClick={handleReset}
              className="px-5 py-3 rounded-lg bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 transition-colors"
            >
              清除本地配置
            </button>
            <span className={`text-sm ${isReady ? 'text-green-600' : 'text-yellow-700'}`}>
              {isReady ? '当前 AI 配置可用' : '请填写完整配置'}
            </span>
          </div>

          {savedMessage && (
            <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
              {savedMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIConfigPanel;
