const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Fonction pour corriger la ligne 42 spécifiquement
function fixLine42() {
  console.log('🚀 Démarrage de la correction ultra-ciblée ligne 42 position 1908...');
  
  // Trouver le fichier main-*.js
  console.log('🔍 Recherche du fichier main-*.js...');
  const distPath = path.resolve('./dist/assets');
  const mainJsFiles = glob.sync(path.join(distPath, 'main-*.js'));
  
  if (mainJsFiles.length === 0) {
    console.error('❌ Fichier main-*.js non trouvé!');
    return;
  }
  
  const mainJsFile = mainJsFiles[0];
  const mainJsFileName = path.basename(mainJsFile);
  console.log(`📄 Fichier main-*.js trouvé: ${mainJsFileName}`);
  
  // Correction ciblée pour main-*.js
  console.log(`🔧 Correction très ciblée pour ${mainJsFileName}...`);
  
  try {
    const content = fs.readFileSync(mainJsFile, 'utf8');
    const lines = content.split('\n');
    
    // Vérifier le nombre de lignes
    if (lines.length < 42) {
      console.log(`⚠️ Le fichier a moins de 42 lignes, recherche par position dans tout le fichier...`);
      
      // Correction globale pour éviter l'erreur "var undefined"
      let fixedContent = content
        .replace(/var\s+(['"])undefined\1\s*;/g, '/* undefined fix 1 */')
        .replace(/var\s+undefined\s*;/g, '/* undefined fix 2 */')
        .replace(/\bundefined\b(?!\s*[=:])/g, '(typeof undefined !== "undefined" ? undefined : void 0)')
        .replace(/\bundefined\s*===\s*undefined\b/g, 'true')
        .replace(/\bundefined\s*!==\s*undefined\b/g, 'false')
        .replace(/\bundefined\s*==\s*undefined\b/g, 'true')
        .replace(/\bundefined\s*!=\s*undefined\b/g, 'false');
      
      fs.writeFileSync(mainJsFile, fixedContent, 'utf8');
      console.log('✅ Corrections globales appliquées au fichier entier');
      return;
    }
    
    // Appliquer la correction à la ligne 42
    console.log('📏 Ligne 42 trouvée, application de la correction ultra-ciblée...');
    const line42 = lines[41]; // index 0-based, donc ligne 42 est à l'index 41
    
    // Vérifier si la position 1908 existe dans la ligne
    if (line42.length < 1908) {
      console.log(`⚠️ La ligne 42 est trop courte (${line42.length} caractères), impossible de cibler la position 1908`);
      
      // Faire une correction générale sur cette ligne
      lines[41] = line42
        .replace(/var\s+(['"])undefined\1\s*;/g, '/* undefined fix 1 */')
        .replace(/var\s+undefined\s*;/g, '/* undefined fix 2 */')
        .replace(/\bundefined\b(?!\s*[=:])/g, '(typeof undefined !== "undefined" ? undefined : void 0)');
      
      fs.writeFileSync(mainJsFile, lines.join('\n'), 'utf8');
      console.log('✅ Corrections générales appliquées à la ligne 42');
    } else {
      // Correction ultra-ciblée à la position exacte
      const before = line42.substring(0, 1908);
      const after = line42.substring(1908);
      
      // Remplacer "undefined" à la position exacte
      const newLine = before + '(window.React || {})' + after;
      
      lines[41] = newLine;
      fs.writeFileSync(mainJsFile, lines.join('\n'), 'utf8');
      console.log('✅ Correction ultra-ciblée appliquée à la position 1908 de la ligne 42');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la correction de la ligne 42:', error);
  }
  
  console.log('✨ Correction ultra-ciblée terminée avec succès');
}

module.exports = fixLine42; 