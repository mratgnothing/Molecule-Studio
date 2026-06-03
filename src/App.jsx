import React, { useState, useCallback } from 'react';
import SearchBar from './components/SearchBar';
import MoleculeViewer from './components/MoleculeViewer';
import InfoPanel from './components/InfoPanel';
import NLPInput from './components/NLPInput';
import AIConfigPanel from './components/AIConfigPanel';
import { smartSearch } from './utils/pubchemApi';
import { parseNaturalLanguage } from './utils/nlpParser';
import './App.css';

/**
 * Molecule Studio - AI 驱动的 3D 化学分子可视化与建模工具
 */
function App() {
  const [moleculeData, setMoleculeData] = useState(null);
  const [selectedAtom, setSelectedAtom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const toChineseError = (message) => {
    if (!message) return '发生未知错误';
    return message
      .replace('Failed to parse natural language query', '自然语言查询解析失败')
      .replace('Failed to fetch molecule data', '获取分子数据失败')
      .replace('No compound found for:', '未找到对应化合物：')
      .replace('Failed to search compound:', '搜索化合物失败：')
      .replace('Failed to get 3D structure:', '获取 3D 结构失败：')
      .replace('Failed to parse compound structure:', '解析分子结构失败：')
      .replace('No atoms found in PubChem structure record', 'PubChem 结构记录中没有可用原子数据')
      .replace('Could not find compound CID', '未找到化合物 CID')
      .replace('LLM API not configured', '尚未配置大模型服务')
      .replace('LLM API key not configured', '尚未配置大模型服务')
      .replace('Failed to parse query', '解析查询失败')
      .replace('An error occurred', '发生错误');
  };

  const getBestSearchQuery = (parsedResult, fallbackQuery) => {
    // PubChem is most reliable with SMILES, then English names.
    // Formula search may return many isomers, so keep it after the name unless no name is available.
    return (
      parsedResult?.smiles ||
      parsedResult?.moleculeName ||
      parsedResult?.formula ||
      fallbackQuery
    );
  };

  const handleSearch = useCallback(async (query, inputMode = 'standard') => {
    setIsLoading(true);
    setError(null);
    setSelectedAtom(null);

    try {
      let searchQuery = query;

      if (inputMode === 'nlp') {
        const parseResult = await parseNaturalLanguage(query);
        if (!parseResult.success) {
          throw new Error(parseResult.error || '自然语言查询解析失败');
        }
        searchQuery = getBestSearchQuery(parseResult, query);
      }

      const result = await smartSearch(searchQuery);

      if (!result.success) {
        throw new Error(result.error || '获取分子数据失败');
      }

      setMoleculeData(result.data);
    } catch (err) {
      setError(toChineseError(err.message));
      setMoleculeData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleNLPParsed = useCallback((parsedResult) => {
    const searchQuery = getBestSearchQuery(parsedResult, '');
    if (searchQuery) {
      handleSearch(searchQuery, 'standard');
    }
  }, [handleSearch]);

  const handleAtomSelect = useCallback((atomData) => {
    setSelectedAtom(atomData);
  }, []);

  const handleAtomDeselect = useCallback(() => {
    setSelectedAtom(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🧬</div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Molecule Studio 分子工作室</h1>
              <p className="text-gray-600 text-sm">AI 驱动的 3D 化学分子可视化与建模工具</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <AIConfigPanel />
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          <NLPInput onParsed={handleNLPParsed} isLoading={isLoading} />
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg mb-6">
            <p className="text-red-700 font-semibold">错误</p>
            <p className="text-red-600 text-sm mt-1">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-96 lg:h-[600px]">
                {moleculeData ? (
                  <MoleculeViewer
                    moleculeData={moleculeData}
                    onAtomSelect={handleAtomSelect}
                    onAtomDeselect={handleAtomDeselect}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                    <div className="text-center px-6">
                      <div className="text-6xl mb-4">🔍</div>
                      <p className="text-gray-600 font-semibold">搜索一个分子，开始 3D 可视化</p>
                      <p className="text-gray-500 text-sm mt-2">
                        示例：Amoxicillin、Caffeine、H2O，也可以使用自然语言描述
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <InfoPanel
              moleculeData={moleculeData}
              selectedAtom={selectedAtom}
              onAtomDeselect={handleAtomDeselect}
            />
          </div>
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📖 使用说明</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">标准搜索</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>输入英文化学名称，例如 Amoxicillin、Caffeine、Aspirin</li>
                <li>输入常见中文名，例如 阿莫西林、咖啡因、阿司匹林</li>
                <li>输入分子式，例如 C16H19N3O5S、H2O</li>
                <li>高级用户可以直接输入 SMILES 字符串</li>
                <li>点击“可视化”生成 3D 分子模型</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-2">自然语言搜索（AI）</h3>
              <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                <li>先在“AI 配置”中填写自己的 API Key，并选择模型</li>
                <li>用自然语言描述分子，例如“显示水分子”</li>
                <li>AI 会把描述转换为可搜索的英文名称或 SMILES</li>
                <li>配置只保存在当前浏览器，不会提交到代码仓库</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200">
            <h3 className="font-semibold text-gray-700 mb-2">交互控制</h3>
            <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
              <li><strong>鼠标左键拖动：</strong>旋转分子</li>
              <li><strong>鼠标右键拖动：</strong>平移视图</li>
              <li><strong>鼠标滚轮：</strong>放大或缩小</li>
              <li><strong>点击原子：</strong>查看元素详情</li>
            </ul>
          </div>
        </div>

        <footer className="mt-8 text-center text-gray-600 text-sm">
          <p>Molecule Studio © 2026 | 基于 React、Three.js 与 PubChem API 构建</p>
          <p className="mt-2">
            数据来源：{' '}
            <a href="https://pubchem.ncbi.nlm.nih.gov/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              PubChem 数据库
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;