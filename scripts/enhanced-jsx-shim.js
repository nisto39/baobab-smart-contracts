/**
 * Enhanced JSX Shim
 * Ce script résout les problèmes liés à jsxDEV et autres fonctions React manquantes
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Démarrage de l\'application du shim JSX amélioré...');

// Script de shim React complet
const enhancedReactShim = `
// Enhanced React JSX Shim v1.2.0
(function() {
  // Ne pas exécuter dans les workers ou autres contextes sans window
  if (typeof window === 'undefined') return;

  // 1. Protection de base
  window.React = window.React || {};
  
  // 2. Protection createElement (base de tout JSX)
  if (!window.React.createElement) {
    window.React.createElement = function(type, props, ...children) {
      return { type, props, children };
    };
  }
  
  // 3. Protection jsx/jsxs/jsxDEV
  if (!window.React.jsx && window.React.createElement) {
    window.React.jsx = window.React.createElement;
  }
  
  if (!window.React.jsxs && window.React.createElement) {
    window.React.jsxs = window.React.createElement;
  }
  
  if (!window.React.jsxDEV && window.React.createElement) {
    window.React.jsxDEV = window.React.createElement;
  }
  
  // 4. Protection Fragment
  if (!window.React.Fragment) {
    window.React.Fragment = 'div';
  }
  
  // 5. Protection createContext
  if (!window.React.createContext) {
    window.React.createContext = function(defaultValue) {
      return {
        Provider: function() { return null; },
        Consumer: function() { return null; },
        displayName: '',
        _currentValue: defaultValue,
        _currentValue2: defaultValue,
        _threadCount: 0
      };
    };
  }
  
  // 6. Protection useState/useEffect/useContext
  const noop = function() { return [null, function() {}]; };
  if (!window.React.useState) window.React.useState = noop;
  if (!window.React.useEffect) window.React.useEffect = function() {};
  if (!window.React.useContext) window.React.useContext = function() { return {}; };
  
  // 7. Protection pour undefined
  window.undefined = void 0;
  
  // 8. Surveillance de l'état React (en cas de remplacement dynamique)
  if (!window._reactMonitor) {
    window._reactMonitor = setInterval(function() {
      // Ne vérifier que si React existe mais qu'il manque des méthodes essentielles
      if (window.React && !window.React.createElement) {
        console.warn('[ReactShim] React détecté sans createElement, restauration...');
        window.React.createElement = function(type, props, ...children) {
          return { type, props, children };
        };
        window.React.jsx = window.React.jsxs = window.React.jsxDEV = window.React.createElement;
      }
    }, 1000);
  }
})();
`;

// Ajouter le shim à index.html
try {
  const indexPath = path.resolve('./dist/index.html');
  if (!fs.existsSync(indexPath)) {
    console.error('❌ Fichier index.html non trouvé!');
    process.exit(1);
  }

  let indexContent = fs.readFileSync(indexPath, 'utf8');
  
  // Vérifier si le shim existe déjà
  if (!indexContent.includes('Enhanced React JSX Shim')) {
    // Injecter le script au début du head
    indexContent = indexContent.replace('<head>', `<head>\n  <script>${enhancedReactShim}</script>`);
    fs.writeFileSync(indexPath, indexContent, 'utf8');
    console.log('✅ Shim JSX amélioré injecté dans index.html');
  } else {
    console.log('⚠️ Le shim JSX amélioré est déjà présent dans index.html');
  }
  
} catch (error) {
  console.error('❌ Erreur lors de l\'injection du shim JSX:', error);
}

// Créer un fichier JS séparé pour le shim (pour référence)
try {
  const shimPath = path.resolve('./dist/enhanced-jsx-shim.js');
  fs.writeFileSync(shimPath, enhancedReactShim, 'utf8');
  console.log('✅ Fichier enhanced-jsx-shim.js créé pour référence');
} catch (error) {
  console.error('❌ Erreur lors de la création du fichier de shim:', error);
}

console.log('✨ Application du shim JSX amélioré terminée'); 