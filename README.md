# 🧬 Molecule Studio

**AI-driven 3D Chemical Molecular Visualization & Modeling Tool**

Molecule Studio is a powerful web-based application for visualizing and analyzing chemical molecules in 3D. It combines cutting-edge web technologies with AI capabilities to provide an intuitive interface for chemists, students, and researchers.

## ✨ Features

### Core Functionality

- **Multiple Input Formats**: Search molecules by chemical name, molecular formula, or SMILES string
- **High-Fidelity 3D Visualization**: CPK color scheme with accurate atomic radii and bond representations
- **Interactive Controls**: Rotate, zoom, and pan to explore molecular structures from any angle
- **Atom Information**: Click any atom to view detailed element properties (atomic number, mass, coordinates)
- **Real-time Molecular Data**: Displays molecular formula, atom count, bond count, and molecular weight

### AI-Powered Features

- **Natural Language Processing**: Describe molecules in plain English (e.g., "Show me caffeine molecule")
- **Intelligent Query Parsing**: AI converts natural language to searchable molecule identifiers
- **LLM Integration**: Powered by SiliconFlow API with support for multiple LLM models

### Technical Excellence

- **React 18 + Vite**: Modern, fast development experience with HMR
- **Three.js Rendering**: High-performance 3D graphics with WebGL
- **Tailwind CSS**: Clean, professional, responsive UI design
- **PubChem Integration**: Access to millions of chemical compounds
- **Error Handling**: Graceful error messages and loading states

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ and npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Molecule-Studio.git
   cd Molecule-Studio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to `http://localhost:5173`

### Build for Production

```bash
npm run build
npm run preview
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the project root with the following variables:

```env
# SiliconFlow API Configuration (for AI features)
VITE_SILICON_API_KEY=your_api_key_here
VITE_SILICON_API_BASE=https://api.siliconflow.cn/v1

# PubChem API (no key required - public API)
VITE_PUBCHEM_API_BASE=https://pubchem.ncbi.nlm.nih.gov/rest/pug

# LLM Model Selection
VITE_LLM_MODEL=Qwen/Qwen2.5-7B-Instruct
```

### API Keys

#### SiliconFlow API (Optional - for Natural Language Features)

1. Sign up at [SiliconFlow](https://siliconflow.cn)
2. Generate an API key from your dashboard
3. Add the key to `.env` file as `VITE_SILICON_API_KEY`

#### PubChem API (No Key Required)

- Public API, no authentication needed
- Automatically configured in the application

## 📖 Usage Guide

### Standard Search

1. **By Chemical Name**
   - Enter: `Amoxicillin`, `Caffeine`, `Aspirin`
   - Click "Visualize"

2. **By Molecular Formula**
   - Enter: `C16H19N3O5S`, `H2O`, `C8H10N4O2`
   - Click "Visualize"

3. **By SMILES String**
   - Enter: `CC(C)CC1=CC=C(C=C1)C(C)C` (for ibuprofen)
   - Click "Visualize"

### Natural Language Search (AI)

1. Switch to "Natural Language" mode
2. Describe the molecule naturally:
   - "Show me water molecule"
   - "Draw the structure of caffeine"
   - "Visualize aspirin"
3. Click "Parse" to convert to searchable format
4. AI will display the parsed molecule name and SMILES
5. Click "Visualize" to render the 3D model

### Interaction Controls

| Control | Action |
|---------|--------|
| **Left Mouse Drag** | Rotate molecule |
| **Right Mouse Drag** | Pan view |
| **Mouse Wheel** | Zoom in/out |
| **Click Atom** | View element details |

### Information Panel

The right panel displays:
- **Molecular Information**: Formula, atom count, bond count, molecular weight
- **Selected Atom Details**: Element symbol, atomic number, mass, coordinates
- **SMILES String**: Full SMILES representation of the molecule

## 🏗️ Project Structure

```
Molecule-Studio/
├── src/
│   ├── components/
│   │   ├── SearchBar.jsx        # Search input and Visualize button
│   │   ├── MoleculeViewer.jsx   # 3D rendering core (Three.js)
│   │   ├── InfoPanel.jsx        # Molecular information display
│   │   └── NLPInput.jsx         # Natural language input component
│   ├── utils/
│   │   ├── pubchemApi.js        # PubChem API integration
│   │   ├── nlpParser.js         # LLM API and NLP processing
│   │   └── elementColors.js     # CPK color scheme and element config
│   ├── App.jsx                  # Main application component
│   ├── main.jsx                 # React entry point
│   └── index.css                # Global styles
├── public/                      # Static assets
├── .env                         # Environment variables (local)
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
├── package.json                 # Dependencies and scripts
├── vite.config.js               # Vite configuration
├── tailwind.config.js           # Tailwind CSS config
├── postcss.config.js            # PostCSS config
└── README.md                    # This file
```

## 🛠️ Technology Stack

### Frontend Framework
- **React 18**: Modern UI library with hooks
- **Vite**: Next-generation build tool with HMR
- **TypeScript-ready**: Supports TypeScript for type safety

### 3D Graphics
- **Three.js**: WebGL 3D graphics library
- **React Three Fiber**: React renderer for Three.js
- **React Three Drei**: Useful helpers for React Three Fiber

### Styling
- **Tailwind CSS v3**: Utility-first CSS framework
- **PostCSS**: CSS transformation tool

### Data & APIs
- **Axios**: HTTP client for API requests
- **PubChem REST API**: Chemical compound database
- **SiliconFlow API**: LLM inference service

### Development
- **ESLint**: Code quality and linting
- **Vite Plugins**: React Fast Refresh support

## 📊 Data Sources

### PubChem Database
- **URL**: https://pubchem.ncbi.nlm.nih.gov
- **Coverage**: 100+ million chemical compounds
- **Data**: Structure, properties, synonyms, and more
- **License**: Public domain

### LLM Models (via SiliconFlow)
- **Qwen/Qwen2.5-7B-Instruct**: Default model for NLP
- **Alternative models**: Claude, GPT-4, and more
- **Purpose**: Convert natural language to molecule identifiers

## 🔬 Supported Elements

The application includes CPK color scheme for the following elements:

| Element | Color | Atomic # |
|---------|-------|----------|
| Hydrogen (H) | White | 1 |
| Carbon (C) | Black | 6 |
| Nitrogen (N) | Blue | 7 |
| Oxygen (O) | Red | 8 |
| Fluorine (F) | Green | 9 |
| Phosphorus (P) | Orange | 15 |
| Sulfur (S) | Yellow | 16 |
| Chlorine (Cl) | Green | 17 |
| Bromine (Br) | Brown | 35 |
| Iodine (I) | Purple | 53 |

Additional elements can be easily added to `src/utils/elementColors.js`.

## 🐛 Troubleshooting

### Issue: "No compound found"
- **Solution**: Check spelling, try alternative names, or use SMILES string

### Issue: "LLM API not configured"
- **Solution**: Add `VITE_SILICON_API_KEY` to `.env` file

### Issue: 3D viewer not loading
- **Solution**: Check browser WebGL support, try a different browser

### Issue: Slow performance with large molecules
- **Solution**: Application automatically optimizes rendering for molecules with 100+ atoms

## 🚀 Future Enhancements

- [ ] Molecular property prediction (LogP, HOMO-LUMO, etc.)
- [ ] Reaction simulation and visualization
- [ ] Molecular editing and drawing tools
- [ ] Export 3D models (GLB, STL formats)
- [ ] Export high-resolution images (PNG, SVG)
- [ ] Molecular dynamics simulation
- [ ] Protein structure visualization
- [ ] Multi-molecule comparison
- [ ] Dark mode support
- [ ] Mobile app version (React Native)

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact & Support

For questions, bug reports, or feature requests, please open an issue on GitHub.

---

**Molecule Studio** - Making molecular visualization accessible to everyone 🧪✨
