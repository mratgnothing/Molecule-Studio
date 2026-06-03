import React, { useState } from 'react';

const KNOWN_MOLECULE_SUMMARIES = {
  water: '水是最常见的极性小分子，由两个氢原子和一个氧原子组成，常用于展示简单的 V 形分子结构。',
  ethanol: '乙醇是一种常见醇类分子，含有羟基，适合观察 C-C-O 骨架和极性官能团。',
  caffeine: '咖啡因是一种含氮杂环化合物，常见于咖啡、茶和能量饮料中，结构中含多个氮原子和羰基。',
  aspirin: '阿司匹林是一种常见解热镇痛药，结构中含苯环、羧基和酯基，是有机官能团识别的经典示例。',
  amoxicillin: '阿莫西林是一种 β-内酰胺类抗生素，结构较复杂，含有多个含氮、含氧和含硫官能团。',
  glucose: '葡萄糖是重要的单糖分子，是生物体能量代谢中的基础化合物。',
  benzene: '苯是典型芳香烃分子，具有平面环状结构，是学习芳香性和共轭体系的经典示例。',
  methane: '甲烷是最简单的烷烃，具有四面体构型，常用于展示基本的 sp3 杂化结构。',
  'acetic acid': '乙酸是一种常见羧酸，含有羧基，是理解酸性有机官能团的简单示例。',
};

const getMoleculeSummary = (moleculeData) => {
  const name = String(moleculeData.iupacName || moleculeData.name || '').toLowerCase();
  const formula = moleculeData.molecularFormula || '未知分子式';

  for (const [keyword, summary] of Object.entries(KNOWN_MOLECULE_SUMMARIES)) {
    if (name.includes(keyword) || String(moleculeData.smiles || '').toLowerCase().includes(keyword)) {
      return summary;
    }
  }

  const structuralHints = [];
  const elements = new Set((moleculeData.atoms || []).map((atom) => atom.element));

  if (elements.has('N')) structuralHints.push('含氮原子');
  if (elements.has('O')) structuralHints.push('含氧原子');
  if (elements.has('S')) structuralHints.push('含硫原子');
  if (elements.has('P')) structuralHints.push('含磷原子');
  if (elements.has('Cl') || elements.has('Br') || elements.has('F') || elements.has('I')) structuralHints.push('含卤素原子');

  const hintText = structuralHints.length ? `，${structuralHints.join('、')}` : '';
  return `该分子分子式为 ${formula}${hintText}。可通过左侧三维模型观察其原子空间分布、键连接关系和整体构型。`;
};

/**
 * InfoPanel Component
 * 显示分子信息、结构摘要、显示控制和选中原子的详细信息。
 */
const InfoPanel = ({
  moleculeData,
  selectedAtom,
  displayOptions,
  onDisplayOptionsChange,
  onAtomDeselect,
}) => {
  const [expandedSection, setExpandedSection] = useState('molecule');

  if (!moleculeData) {
    return (
      <div className="w-full bg-white rounded-lg shadow-md p-6">
        <div className="text-center text-gray-500">
          <p className="text-lg font-semibold">尚未加载分子</p>
          <p className="text-sm mt-2">请先搜索一个分子以查看详细信息</p>
        </div>
      </div>
    );
  }

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const updateDisplayOption = (key) => {
    onDisplayOptionsChange?.({
      ...displayOptions,
      [key]: !displayOptions?.[key],
    });
  };

  const pubchemUrl = moleculeData.cid
    ? `https://pubchem.ncbi.nlm.nih.gov/compound/${moleculeData.cid}`
    : null;

  return (
    <div className="w-full bg-white rounded-lg shadow-md overflow-hidden">
      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection('molecule')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-800">分子信息</h3>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform ${
              expandedSection === 'molecule' ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>

        {expandedSection === 'molecule' && (
          <div className="px-6 py-4 bg-gray-50 space-y-4">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-2">
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold uppercase">分子式</p>
                <p className="text-lg font-bold text-blue-600 mt-1 break-words">
                  {moleculeData.molecularFormula || 'N/A'}
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold uppercase">分子量</p>
                <p className="text-lg font-bold text-purple-600 mt-1">
                  {moleculeData.molecularWeight ? `${moleculeData.molecularWeight.toFixed(2)} g/mol` : 'N/A'}
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold uppercase">原子总数</p>
                <p className="text-lg font-bold text-green-600 mt-1">{moleculeData.totalAtoms || 0}</p>
              </div>

              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold uppercase">化学键总数</p>
                <p className="text-lg font-bold text-orange-600 mt-1">{moleculeData.totalBonds || 0}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-600 font-semibold uppercase mb-2">结构摘要</p>
              <p className="text-sm text-gray-700 leading-relaxed">{getMoleculeSummary(moleculeData)}</p>
            </div>

            <div className="bg-white p-4 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-600 font-semibold uppercase mb-2">数据来源</p>
              <div className="space-y-2 text-sm text-gray-700">
                <p>PubChem CID：<span className="font-mono">{moleculeData.cid || 'N/A'}</span></p>
                {moleculeData.iupacName && <p>IUPAC：{moleculeData.iupacName}</p>}
                {pubchemUrl && (
                  <a
                    href={pubchemUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline font-medium"
                  >
                    查看 PubChem 原始页面 ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-b border-gray-200">
        <button
          onClick={() => toggleSection('display')}
          className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <h3 className="text-lg font-semibold text-gray-800">显示控制</h3>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform ${
              expandedSection === 'display' ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>

        {expandedSection === 'display' && (
          <div className="px-6 py-4 bg-gray-50 space-y-3">
            <label className="flex items-center justify-between bg-white px-4 py-3 rounded-lg cursor-pointer">
              <span className="text-sm font-medium text-gray-700">显示元素标签</span>
              <input
                type="checkbox"
                checked={Boolean(displayOptions?.showElementLabels)}
                onChange={() => updateDisplayOption('showElementLabels')}
                className="h-4 w-4"
              />
            </label>
            <label className="flex items-center justify-between bg-white px-4 py-3 rounded-lg cursor-pointer">
              <span className="text-sm font-medium text-gray-700">显示原子编号</span>
              <input
                type="checkbox"
                checked={Boolean(displayOptions?.showAtomIds)}
                onChange={() => updateDisplayOption('showAtomIds')}
                className="h-4 w-4"
              />
            </label>
            <p className="text-xs text-gray-500 leading-relaxed">
              标签较多时会影响画面整洁度，建议在小分子或教学讲解时开启。
            </p>
          </div>
        )}
      </div>

      {selectedAtom && (
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('atom')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-800">选中原子详情</h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAtomDeselect();
              }}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="取消选择原子"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </button>

          {expandedSection === 'atom' && (
            <div className="px-6 py-4 bg-blue-50 grid grid-cols-2 gap-4 md:grid-cols-2">
              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold uppercase">元素符号</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{selectedAtom.element}</p>
              </div>

              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold uppercase">原子序数</p>
                <p className="text-lg font-bold text-green-600 mt-1">{selectedAtom.atomicNumber || 'N/A'}</p>
              </div>

              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold uppercase">原子质量</p>
                <p className="text-lg font-bold text-orange-600 mt-1">
                  {selectedAtom.mass ? selectedAtom.mass.toFixed(3) : 'N/A'}
                </p>
              </div>

              <div className="bg-white p-3 rounded-lg">
                <p className="text-xs text-gray-600 font-semibold uppercase">原子 ID</p>
                <p className="text-lg font-bold text-purple-600 mt-1">{selectedAtom.id}</p>
              </div>

              {selectedAtom.charge !== 0 && selectedAtom.charge !== undefined && (
                <div className="bg-white p-3 rounded-lg col-span-2">
                  <p className="text-xs text-gray-600 font-semibold uppercase">电荷</p>
                  <p className="text-lg font-bold text-red-600 mt-1">
                    {selectedAtom.charge > 0 ? '+' : ''}{selectedAtom.charge}
                  </p>
                </div>
              )}

              {selectedAtom.x !== undefined && selectedAtom.y !== undefined && selectedAtom.z !== undefined && (
                <div className="bg-white p-3 rounded-lg col-span-2">
                  <p className="text-xs text-gray-600 font-semibold uppercase">坐标（Å）</p>
                  <p className="text-sm font-mono text-gray-700 mt-1">
                    X: {selectedAtom.x.toFixed(3)}, Y: {selectedAtom.y.toFixed(3)}, Z: {selectedAtom.z.toFixed(3)}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {moleculeData.smiles && (
        <div className="border-b border-gray-200">
          <button
            onClick={() => toggleSection('smiles')}
            className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-800">SMILES 字符串</h3>
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform ${
                expandedSection === 'smiles' ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>

          {expandedSection === 'smiles' && (
            <div className="px-6 py-4 bg-gray-50">
              <p className="text-sm font-mono bg-white p-3 rounded-lg break-all text-gray-700">
                {moleculeData.smiles}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InfoPanel;