/**
 * PubChem API Integration
 * Fetches molecular structure data from PubChem PUG REST API.
 * Supports chemical names, molecular formulas, SMILES strings, and a few common Chinese names.
 */

import axios from 'axios';

const PUBCHEM_BASE = import.meta.env.VITE_PUBCHEM_API_BASE || 'https://pubchem.ncbi.nlm.nih.gov/rest/pug';

const pubchemClient = axios.create({
  baseURL: PUBCHEM_BASE.replace(/\/$/, ''),
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});

const ATOMIC_NUMBER_TO_SYMBOL = {
  1: 'H',
  2: 'He',
  3: 'Li',
  4: 'Be',
  5: 'B',
  6: 'C',
  7: 'N',
  8: 'O',
  9: 'F',
  10: 'Ne',
  11: 'Na',
  12: 'Mg',
  13: 'Al',
  14: 'Si',
  15: 'P',
  16: 'S',
  17: 'Cl',
  18: 'Ar',
  19: 'K',
  20: 'Ca',
  26: 'Fe',
  29: 'Cu',
  30: 'Zn',
  35: 'Br',
  53: 'I',
};

const COMMON_CHINESE_NAMES = {
  水: 'water',
  水分子: 'water',
  乙醇: 'ethanol',
  酒精: 'ethanol',
  甲醇: 'methanol',
  咖啡因: 'caffeine',
  阿司匹林: 'aspirin',
  阿莫西林: 'amoxicillin',
  葡萄糖: 'glucose',
  苯: 'benzene',
  甲烷: 'methane',
  乙酸: 'acetic acid',
  醋酸: 'acetic acid',
};

const normalizeQuery = (query) => {
  const trimmed = String(query || '').trim();
  return COMMON_CHINESE_NAMES[trimmed] || trimmed;
};

const getAxiosErrorDetail = (error) => {
  const status = error.response?.status;
  const pubchemMessage =
    error.response?.data?.Fault?.Details?.[0] ||
    error.response?.data?.Fault?.Message ||
    error.response?.data?.message;

  if (status && pubchemMessage) {
    return `HTTP ${status}: ${pubchemMessage}`;
  }
  if (status) {
    return `HTTP ${status}`;
  }
  return error.message;
};

const extractFirstCID = (data) => {
  return data?.IdentifierList?.CID?.[0] || data?.PC_Compounds?.[0]?.id?.id?.cid || null;
};

/**
 * Search for compound by name, formula, or SMILES and return a PubChem-like object with CID.
 * @param {string} query - Chemical name, formula, or SMILES string
 * @param {string} searchType - 'name', 'formula', or 'smiles'
 * @returns {Promise<Object>} Compound data with CID
 */
export const searchCompound = async (query, searchType = 'name') => {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    throw new Error('Failed to search compound: empty query');
  }

  const encodedQuery = encodeURIComponent(normalizedQuery);
  const candidatePaths = [];

  if (searchType === 'smiles') {
    candidatePaths.push(`/compound/smiles/${encodedQuery}/cids/JSON`);
  } else if (searchType === 'formula') {
    // fastformula returns CIDs more reliably than requesting a full compound record directly.
    candidatePaths.push(`/compound/fastformula/${encodedQuery}/cids/JSON`);
    candidatePaths.push(`/compound/name/${encodedQuery}/cids/JSON`);
  } else {
    candidatePaths.push(`/compound/name/${encodedQuery}/cids/JSON`);
  }

  let lastError = null;

  for (const path of candidatePaths) {
    try {
      const response = await pubchemClient.get(path);
      const cid = extractFirstCID(response.data);

      if (cid) {
        return {
          id: {
            id: {
              cid,
            },
          },
        };
      }

      lastError = new Error(`No compound found for: ${normalizedQuery}`);
    } catch (error) {
      lastError = error;
    }
  }

  const detail = lastError?.response ? getAxiosErrorDetail(lastError) : lastError?.message;
  throw new Error(`Failed to search compound: ${detail || normalizedQuery}`);
};

/**
 * Get compound structure data. Prefer a 3D record and fall back to a 2D record if PubChem has no 3D conformer.
 * @param {number|string} cid - Compound ID
 * @returns {Promise<Object>} structure data with atoms, bonds, and PubChem coords/conformers
 */
export const getCompound3DStructure = async (cid) => {
  const candidatePaths = [
    `/compound/cid/${cid}/record/JSON?record_type=3d`,
    `/compound/cid/${cid}/record/JSON?record_type=2d`,
    `/compound/cid/${cid}/JSON`,
  ];

  let lastError = null;

  for (const path of candidatePaths) {
    try {
      const response = await pubchemClient.get(path);
      const compound = response.data?.PC_Compounds?.[0];
      if (compound) {
        return compound;
      }
      lastError = new Error(`No structure found for CID: ${cid}`);
    } catch (error) {
      lastError = error;
    }
  }

  const detail = lastError?.response ? getAxiosErrorDetail(lastError) : lastError?.message;
  throw new Error(`Failed to get 3D structure: ${detail || cid}`);
};

const toElementSymbol = (elementValue) => {
  if (typeof elementValue === 'number') {
    return ATOMIC_NUMBER_TO_SYMBOL[elementValue] || String(elementValue);
  }
  return elementValue || 'C';
};

const getCoordinateMap = (compoundData) => {
  const coordBlock = compoundData.coords?.[0];
  const conformer = coordBlock?.conformers?.[0];
  const coordAids = coordBlock?.aid || compoundData.atoms?.aid || [];
  const coordMap = new Map();

  if (!conformer || !coordAids.length) {
    return coordMap;
  }

  coordAids.forEach((aid, index) => {
    coordMap.set(aid, {
      x: Number(conformer.x?.[index] ?? 0),
      y: Number(conformer.y?.[index] ?? 0),
      z: Number(conformer.z?.[index] ?? 0),
    });
  });

  return coordMap;
};

const extractMetadata = (compoundData) => {
  const props = compoundData.props || [];
  let molecularFormula = '';
  let molecularWeight = 0;
  let smiles = '';
  let iupacName = '';

  for (const prop of props) {
    const label = prop.urn?.label || '';
    const name = prop.urn?.name || '';
    const value = prop.value?.sval ?? prop.value?.fval ?? '';

    if (label === 'Molecular Formula') {
      molecularFormula = String(value);
    }
    if (label === 'Molecular Weight') {
      molecularWeight = Number(value) || 0;
    }
    if (label === 'SMILES' && !smiles) {
      smiles = String(value);
    }
    if (label === 'IUPAC Name' && (name === 'Preferred' || !iupacName)) {
      iupacName = String(value);
    }
  }

  return {
    molecularFormula,
    molecularWeight,
    smiles,
    iupacName,
  };
};

/**
 * Parse compound data to extract atoms and bonds.
 * PubChem stores coordinates under compoundData.coords[*].conformers[*], not under compoundData.atoms.
 * @param {Object} compoundData - Raw compound data from PubChem
 * @returns {Object} Parsed structure with atoms, bonds, and metadata
 */
export const parseCompoundStructure = (compoundData) => {
  try {
    const atoms = [];
    const bonds = [];
    const atomData = compoundData.atoms || {};
    const atomIds = atomData.aid || [];
    const coordMap = getCoordinateMap(compoundData);

    for (let i = 0; i < atomIds.length; i++) {
      const aid = atomIds[i];
      const coords = coordMap.get(aid) || { x: 0, y: 0, z: 0 };

      atoms.push({
        id: aid,
        element: toElementSymbol(atomData.element?.[i]),
        atomicNumber: typeof atomData.element?.[i] === 'number' ? atomData.element[i] : 0,
        x: coords.x,
        y: coords.y,
        z: coords.z,
        charge: atomData.charge?.[i] || 0,
      });
    }

    const bondData = compoundData.bonds || {};
    if (bondData.aid1 && bondData.aid2) {
      for (let i = 0; i < bondData.aid1.length; i++) {
        bonds.push({
          from: bondData.aid1[i],
          to: bondData.aid2[i],
          type: bondData.order?.[i] || bondData.type?.[i] || 1,
          stereo: bondData.stereo?.[i] || 0,
        });
      }
    }

    const metadata = extractMetadata(compoundData);

    return {
      atoms,
      bonds,
      totalAtoms: atoms.length,
      totalBonds: bonds.length,
      ...metadata,
      cid: compoundData.id?.id?.cid,
      has3D: atoms.some((atom) => Math.abs(atom.z) > 1e-6),
    };
  } catch (error) {
    throw new Error(`Failed to parse compound structure: ${error.message}`);
  }
};

/**
 * Fetch and parse complete molecule data.
 * @param {string} query - Chemical name, formula, or SMILES
 * @param {string} searchType - 'name', 'formula', or 'smiles'
 * @returns {Promise<Object>} Complete parsed molecule data
 */
export const fetchMoleculeData = async (query, searchType = 'name') => {
  try {
    const searchResult = await searchCompound(query, searchType);
    const cid = searchResult.id?.id?.cid;

    if (!cid) {
      throw new Error('Could not find compound CID');
    }

    const structureData = await getCompound3DStructure(cid);
    const parsedData = parseCompoundStructure(structureData);

    if (!parsedData.atoms.length) {
      throw new Error('No atoms found in PubChem structure record');
    }

    return {
      success: true,
      data: parsedData,
      cid,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Validate SMILES string format.
 * @param {string} smiles - SMILES string
 * @returns {boolean} True if valid SMILES format
 */
export const isValidSMILES = (smiles) => {
  const smilesRegex = /^[A-Za-z0-9\[\]()=@#\-+\\\/.%]+$/;
  return smilesRegex.test(smiles);
};

/**
 * Detect input type.
 * @param {string} input - User input
 * @returns {string} Detected type: 'name', 'formula', or 'smiles'
 */
export const detectInputType = (input) => {
  const normalizedInput = normalizeQuery(input);

  if (/[=@#\[\]()\\\/+]/.test(normalizedInput)) {
    return 'smiles';
  }

  // General molecular formula pattern, e.g. H2O, C16H19N3O5S, NaCl.
  if (/^([A-Z][a-z]?\d*)+$/.test(normalizedInput)) {
    return 'formula';
  }

  return 'name';
};

/**
 * Smart search - automatically detect input type and search.
 * @param {string} query - User input
 * @returns {Promise<Object>} Molecule data
 */
export const smartSearch = async (query) => {
  const normalizedQuery = normalizeQuery(query);
  const searchType = detectInputType(normalizedQuery);
  return fetchMoleculeData(normalizedQuery, searchType);
};