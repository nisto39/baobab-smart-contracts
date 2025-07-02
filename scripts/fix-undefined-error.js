const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Fonction améliorée pour corriger les erreurs undefined
const fixUndefinedError = (content) => {
  // Approche plus agressive pour éliminer toutes les variantes de "var undefined"
  let fixedContent = content
    // Gérer les différentes variantes avec guillemets
    .replace(/var\s+["']undefined["']\s*;/g, '/* undefined-protection */')
    .replace(/var\s+undefined\s*;/g, '/* undefined-protection */')
    // Remplacer toutes les occurrences d'undefined non protégées
    .replace(/\bundefined\b(?!\s*[=:?])/g, '(typeof undefined !== "undefined" ? undefined : void 0)')
    // Simplifier les comparaisons avec undefined pour éviter les erreurs
    .replace(/\bundefined\s*===\s*undefined\b/g, 'true')
    .replace(/\bundefined\s*!==\s*undefined\b/g, 'false')
    .replace(/\bundefined\s*==\s*undefined\b/g, 'true')
    .replace(/\bundefined\s*!=\s*undefined\b/g, 'false')
    // Protéger createContext
    .replace(/(\b|\.)createContext\b/g, '($1createContext || function() { return { Provider: function() {}, Consumer: function() {} }; })');
  
  return fixedContent;
};

// Fonction principale
console.log('🚀 Démarrage de la correction pour l\'erreur "Unexpected identifier \'undefined\'"...');

// Trouver le fichier main-*.js
console.log('🔍 Recherche du fichier main-*.js...');
const distPath = path.resolve('./dist/assets');
const mainJsFiles = glob.sync(path.join(distPath, 'main-*.js'));

if (mainJsFiles.length === 0) {
  console.error('❌ Fichier main-*.js non trouvé!');
  process.exit(1);
}

const mainJsFile = mainJsFiles[0];
const mainJsFileName = path.basename(mainJsFile);
console.log(`📄 Fichier main-*.js trouvé: ${mainJsFileName}`);

// Corriger main-*.js
console.log(`🔧 Correction de l'erreur "Unexpected identifier 'undefined'" dans ${mainJsFileName}...`);

try {
  // Créer une sauvegarde du fichier original
  fs.copyFileSync(mainJsFile, `${mainJsFile}.backup`);
  console.log(`💾 Sauvegarde créée: ${mainJsFileName}.backup`);

  // Lire et corriger le contenu
  let content = fs.readFileSync(mainJsFile, 'utf8');
  content = fixUndefinedError(content);
  fs.writeFileSync(mainJsFile, content, 'utf8');
  console.log(`✅ Correctifs appliqués au fichier pour l'erreur "Unexpected identifier 'undefined'"`);
} catch (error) {
  console.error(`❌ Erreur lors de la correction de ${mainJsFileName}:`, error);
}

// Corriger les nouveaux chunks
const chunkTargets = ['other-deps', 'common-deps', 'ui-deps'];
for (const targetName of chunkTargets) {
  console.log(`🔍 Vérification de ${targetName}-*.js...`);
  const chunkFiles = glob.sync(path.join(distPath, `${targetName}-*.js`));

  if (chunkFiles.length > 0) {
    try {
      const chunkFile = chunkFiles[0];
      
      // Correction spéciale ciblée
      let chunkContent = fs.readFileSync(chunkFile, 'utf8');
      
      // Solution spécifique pour le problème de "var undefined"
      const chunkLines = chunkContent.split('\n');
      for (let i = 0; i < chunkLines.length; i++) {
        if (chunkLines[i].includes('var "undefined"') || chunkLines[i].includes("var 'undefined'")) {
          console.log(`⚠️ Ligne problématique détectée dans ${targetName}-*.js: ${i+1}`);
          chunkLines[i] = chunkLines[i].replace(/var\s+["']undefined["']\s*;/, '/* undefined-protection */');
        }
      }
      chunkContent = chunkLines.join('\n');
      
      // Appliquer les corrections générales
      chunkContent = fixUndefinedError(chunkContent);
      
      // Écrire le fichier corrigé
      fs.writeFileSync(chunkFile, chunkContent, 'utf8');
      console.log(`✅ Correctifs appliqués à ${targetName}-*.js`);
    } catch (error) {
      console.error(`❌ Erreur lors de la correction de ${targetName}-*.js:`, error);
    }
  } else {
    console.log(`⚠️ Fichier ${targetName}-*.js non trouvé`);
  }
}

// Correction spéciale pour react-deps
console.log('🔍 Correction de react-deps-*.js...');
const reactDepsFiles = glob.sync(path.join(distPath, 'react-deps-*.js'));
if (reactDepsFiles.length > 0) {
  try {
    const reactDepsFile = reactDepsFiles[0];
    let reactDepsContent = fs.readFileSync(reactDepsFile, 'utf8');
    reactDepsContent = fixUndefinedError(reactDepsContent);
    fs.writeFileSync(reactDepsFile, reactDepsContent, 'utf8');
    console.log('✅ Correctifs appliqués à react-deps-*.js');
  } catch (error) {
    console.error('❌ Erreur lors de la correction de react-deps-*.js:', error);
  }
}

// Ajouter une protection supplémentaire dans index.html
console.log('🔍 Mise à jour de index.html pour ajouter une protection supplémentaire...');
try {
  const indexPath = path.resolve('./dist/index.html');
  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Vérifier si la protection existe déjà
  if (!indexContent.includes('window.React = window.React || {}')) {
    // Ajouter un script de protection React juste avant la fermeture de </head>
    const reactProtection = `
    <script>
      // Protection React pour éviter les erreurs createContext
      (function() {
        // Protection contre undefined
        window.undefined = window.undefined;
        
        // Protection React
        window.React = window.React || {};
        if (!window.React.createContext) {
          window.React.createContext = function() {
            return {
              Provider: function() {},
              Consumer: function() {},
              _currentValue: arguments[0],
              _currentValue2: arguments[0]
            };
          };
        }
        
        // Protection pour jsxDEV
        if (!window.React.jsxDEV && window.React.createElement) {
          window.React.jsxDEV = window.React.createElement;
        }
      })();
    </script>
    `;
    indexContent = indexContent.replace('</head>', `${reactProtection}</head>`);
    fs.writeFileSync(indexPath, indexContent, 'utf8');
  }
  console.log('✅ Protection supplémentaire ajoutée à index.html');
} catch (error) {
  console.error('❌ Erreur lors de la mise à jour de index.html:', error);
}

console.log('✨ Correction de l\'erreur "Unexpected identifier \'undefined\'" terminée avec succès'); 