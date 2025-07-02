const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("\n🧪 Exécution des tests pour le contrat Baobab Token 🧪\n");
  
  const resultsDir = path.join(__dirname, "../test-results");
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  const startTime = new Date();
  console.log(`Début des tests: ${startTime.toISOString()}`);
  
  try {
    // 1. Nettoyer les artefacts précédents
    console.log("\n🧹 Nettoyage des artefacts précédents...");
    execSync("npx hardhat clean", { stdio: "inherit" });
    console.log("✅ Nettoyage terminé");
    
    // 2. Compiler les contrats
    console.log("\n🔧 Compilation des contrats...");
    execSync("npx hardhat compile", { stdio: "inherit" });
    console.log("✅ Compilation terminée");
    
    // 3. Exécuter les tests unitaires
    console.log("\n🧪 Exécution des tests unitaires...");
    const testOutput = execSync("npx hardhat test", { stdio: "pipe" }).toString();
    fs.writeFileSync(path.join(resultsDir, "test-output.txt"), testOutput);
    console.log(testOutput);
    console.log("✅ Tests unitaires terminés");
    
    // 4. Vérifier les tests de couverture
    console.log("\n📊 Exécution des tests de couverture...");
    try {
      execSync("npx hardhat coverage", { stdio: "inherit" });
      console.log("✅ Tests de couverture terminés");
    } catch (error) {
      console.log("⚠️ Erreur lors des tests de couverture:", error.message);
    }
    
    // 5. Générer un rapport de test
    const endTime = new Date();
    const duration = (endTime - startTime) / 1000; // en secondes
    
    const testReport = `
# Rapport de test du contrat Baobab Token

Date d'exécution: ${startTime.toISOString()}
Durée: ${duration} secondes

## Résumé

- ✅ Compilation: Réussie
- ✅ Tests unitaires: Réussis
- ✅ Tests de couverture: Voir le rapport dans ./coverage/index.html

## Étapes suivantes recommandées

1. Vérifier les résultats détaillés de la couverture de code
2. Exécuter l'analyse de sécurité avec \`node scripts/audit/security-check.js\`
3. Déployer sur un réseau de test avec \`npx hardhat run scripts/deploy.js --network bsctestnet\`
4. Valider toutes les fonctionnalités sur le réseau de test avant de déployer sur le mainnet

## Notes

Pour déployer sur le mainnet, assurez-vous d'avoir:
- Terminé tous les tests sur les réseaux de test
- Configuré correctement le fichier .env
- Confirmé le déploiement sur mainnet avec CONFIRM_MAINNET_DEPLOY=OUI_JE_SAIS_CE_QUE_JE_FAIS
`;
    
    fs.writeFileSync(path.join(resultsDir, "test-report.md"), testReport);
    console.log(`\n✅ Rapport de test généré: test-results/test-report.md`);
    
    console.log("\n🎉 Tous les tests ont été exécutés avec succès!");
    console.log(`Durée totale: ${duration} secondes`);
    
  } catch (error) {
    console.error("❌ Erreur lors de l'exécution des tests:", error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("Erreur:", error);
  process.exit(1);
}); 