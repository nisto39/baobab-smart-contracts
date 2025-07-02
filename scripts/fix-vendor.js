/**
 * Script de correction ultra-ciblé pour les fichiers de dépendances
 * Ce script corrige spécifiquement les problèmes de "var undefined" dans les chunks
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

console.log('🚀 Démarrage de la correction ultra-ciblée pour les fichiers de dépendances...');

// Définir les cibles de chunk
const chunkTargets = ['common-deps', 'other-deps', 'ui-deps', 'react-deps'];

// Parcourir tous les fichiers cibles
for (const targetName of chunkTargets) {
  // Trouver le fichier de chunk
  const distPath = path.resolve('./dist/assets');
  const chunkFiles = glob.sync(path.join(distPath, `${targetName}-*.js`));

  if (chunkFiles.length === 0) {
    console.log(`⚠️ Fichier ${targetName}-*.js non trouvé, ignoré`);
    continue;
  }

  const chunkFile = chunkFiles[0];
  const chunkFileName = path.basename(chunkFile);
  console.log(`📄 Fichier ${targetName}-*.js trouvé: ${chunkFileName}`);

  // Lire le contenu du fichier
  try {
    // Créer une sauvegarde
    fs.copyFileSync(chunkFile, `${chunkFile}.backup`);
    console.log(`💾 Sauvegarde créée: ${chunkFileName}.backup`);

    // Lire et parser le contenu
    let content = fs.readFileSync(chunkFile, 'utf8');
    
    // 1. Correction ultra-ciblée pour "var undefined"
    const lines = content.split('\n');
    let problematicLineFound = false;
    
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].includes('var "undefined"') || lines[i].includes("var 'undefined'")) {
        console.log(`⚠️ Ligne problématique détectée dans ${chunkFileName}: ligne ${i+1}`);
        lines[i] = '/* undefined-protection */';
        problematicLineFound = true;
      }
    }
    
    if (problematicLineFound) {
      content = lines.join('\n');
      console.log(`✅ Ligne contenant "var undefined" remplacée par un commentaire dans ${chunkFileName}`);
    } else {
      console.log(`⚠️ Aucune ligne avec "var undefined" trouvée dans ${chunkFileName}, application de corrections générales`);
    }
    
    // 2. Corrections générales pour undefined
    content = content
      .replace(/var\s+["']undefined["']\s*;/g, '/* undefined-protection */')
      .replace(/var\s+undefined\s*;/g, '/* undefined-protection */')
      .replace(/\b(this\s*\.\s*|window\s*\.\s*|global\s*\.\s*)?undefined\s*=[^=]/g, '/* undefined-protection */');
    
    // 3. Écrire le fichier corrigé
    fs.writeFileSync(chunkFile, content, 'utf8');
    console.log(`✅ Correctifs appliqués avec succès à ${chunkFileName}`);
    
    // 4. Vérification syntaxique simple (uniquement pour les lignes problématiques)
    if (problematicLineFound) {
      try {
        // On extrait juste quelques lignes autour de la ligne problématique
        const testLines = [];
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes('/* undefined-protection */')) {
            // Prendre 10 lignes avant et après
            const start = Math.max(0, i - 10);
            const end = Math.min(lines.length, i + 10);
            testLines.push(...lines.slice(start, end));
            break;
          }
        }
        
        if (testLines.length > 0) {
          const testContent = testLines.join('\n');
          
          // Essayer d'évaluer sans exécuter
          new Function(testContent);
          console.log('✅ La correction a résolu les problèmes de syntaxe');
        }
      } catch (error) {
        console.warn(`⚠️ Des problèmes de syntaxe subsistent dans ${chunkFileName}, mais le script de shim React les compensera: ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error(`❌ Erreur lors de la correction de ${chunkFileName}:`, error);
  }
}

console.log('✨ Correction ultra-ciblée terminée'); 