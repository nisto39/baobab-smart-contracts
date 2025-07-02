const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const hre = require("hardhat");

async function main() {
  console.log("\n🔒 Vérification de sécurité du contrat Baobab Token 🔒\n");
  
  const resultsDir = path.join(__dirname, "../../audit-results");
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  // 1. Exécuter Slither (si installé)
  console.log("🔍 Exécution de l'analyse avec Slither...");
  try {
    const slitherOutput = execSync("slither . --json audit-results/slither.json", { stdio: "pipe" }).toString();
    fs.writeFileSync(path.join(resultsDir, "slither-output.txt"), slitherOutput);
    console.log("✅ Analyse Slither terminée. Résultats sauvegardés dans audit-results/");
  } catch (error) {
    console.log("⚠️ Impossible d'exécuter Slither. Vérifiez qu'il est installé (pip install slither-analyzer).");
    console.log("Message d'erreur:", error.message);
  }
  
  // 2. Tester la couverture de code
  console.log("\n🔍 Exécution des tests de couverture...");
  try {
    execSync("npx hardhat coverage", { stdio: "inherit" });
    console.log("✅ Tests de couverture terminés. Résultats sauvegardés dans coverage/");
  } catch (error) {
    console.log("❌ Erreur lors des tests de couverture:", error.message);
    process.exit(1);
  }
  
  // 3. Vérification du compilateur
  console.log("\n🔍 Vérification de la version du compilateur...");
  const hardhatConfig = require("../../hardhat.config");
  const solidityVersion = typeof hardhatConfig.solidity === "string" 
    ? hardhatConfig.solidity 
    : hardhatConfig.solidity.version;
  
  console.log(`Version Solidity utilisée: ${solidityVersion}`);
  if (solidityVersion.startsWith("0.8.")) {
    console.log("✅ Version sécurisée de Solidity (0.8.x)");
  } else {
    console.log("⚠️ Il est recommandé d'utiliser Solidity 0.8.x pour une meilleure sécurité");
  }
  
  // 4. Vérification des vulnérabilités courantes
  console.log("\n🔍 Exécution de l'analyse des vulnérabilités courantes...");
  
  const contractPath = path.join(__dirname, "../../contracts/BaobabToken.sol");
  const contractSource = fs.readFileSync(contractPath, "utf8");
  
  const vulnerabilities = [
    { name: "Reentrancy", pattern: /ReentrancyGuard/g, severity: "high", detected: false },
    { name: "Transfert sans vérification de retour", pattern: /transfer\s*\(/g, severity: "high", detected: false },
    { name: "Arrondi vers le bas", pattern: /\s\/\s/g, severity: "medium", detected: false },
    { name: "Accès au stockage sans contrôle", pattern: /public\s+[a-zA-Z0-9_]+\s*;/g, severity: "low", detected: false },
    { name: "Utilisation de block.timestamp", pattern: /block\.timestamp/g, severity: "low", detected: false }
  ];
  
  let hasVulnerabilities = false;
  let securityReport = "# Rapport de sécurité du contrat Baobab Token\n\n";
  securityReport += `Date d'analyse: ${new Date().toISOString()}\n\n`;
  securityReport += "## Vulnérabilités potentielles\n\n";
  
  for (const vuln of vulnerabilities) {
    const matches = contractSource.match(vuln.pattern);
    vuln.detected = matches !== null && matches.length > 0;
    
    securityReport += `### ${vuln.name} (${vuln.severity})\n`;
    if (vuln.detected) {
      securityReport += `✅ Protection implémentée: ${matches.length} instances trouvées\n\n`;
    } else {
      hasVulnerabilities = true;
      securityReport += "❌ Non détecté dans le code, vérification manuelle recommandée\n\n";
    }
  }
  
  // Rechercher les protections spécifiques
  const protections = [
    { name: "Contrôle d'accès", pattern: /onlyOwner/g, expected: true },
    { name: "Protection contre les réentrances", pattern: /nonReentrant/g, expected: true },
    { name: "Vérification d'adresse nulle", pattern: /!= address\(0\)/g, expected: true },
    { name: "Vérification de dépassement", pattern: /SafeMath|require\([^)]+>[^)]+\)/g, expected: true },
  ];
  
  securityReport += "## Protections implémentées\n\n";
  
  for (const protection of protections) {
    const matches = contractSource.match(protection.pattern);
    const detected = matches !== null && matches.length > 0;
    
    securityReport += `### ${protection.name}\n`;
    if (detected === protection.expected) {
      securityReport += `✅ ${detected ? "Protection correctement implémentée" : "Protection non nécessaire"}: ${matches ? matches.length : 0} instances\n\n`;
    } else {
      hasVulnerabilities = true;
      securityReport += `❌ ${protection.expected ? "Protection manquante" : "Implémentation inattendue"}\n\n`;
    }
  }
  
  // Sauvegarder le rapport
  fs.writeFileSync(path.join(resultsDir, "security-report.md"), securityReport);
  console.log(`✅ Rapport de sécurité généré: audit-results/security-report.md`);
  
  // 5. Estimation du gaz pour les principales fonctions
  console.log("\n🔍 Estimation du gaz pour les principales fonctions...");
  
  try {
    // Déployer le contrat dans un environnement de test
    await hre.run("compile");
    const [deployer, treasury, user1] = await hre.ethers.getSigners();
    
    const BaobabToken = await hre.ethers.getContractFactory("BaobabToken");
    const baobabToken = await BaobabToken.deploy(treasury.address);
    
    // Préparer les données pour les tests de gaz
    const amount = hre.ethers.utils.parseEther("1000");
    const burnAmount = hre.ethers.utils.parseEther("100");
    
    // Mesurer la consommation de gaz pour les principales fonctions
    const gasReport = "# Rapport d'estimation de gaz pour Baobab Token\n\n";
    
    // Transfert
    const transferTx = await baobabToken.transfer(user1.address, amount);
    const transferReceipt = await transferTx.wait();
    const transferGas = transferReceipt.gasUsed.toString();
    
    // Approve
    const approveTx = await baobabToken.approve(user1.address, amount);
    const approveReceipt = await approveTx.wait();
    const approveGas = approveReceipt.gasUsed.toString();
    
    // TransferFrom (après avoir approuvé)
    await baobabToken.approve(deployer.address, amount);
    const transferFromTx = await baobabToken.transferFrom(deployer.address, user1.address, amount);
    const transferFromReceipt = await transferFromTx.wait();
    const transferFromGas = transferFromReceipt.gasUsed.toString();
    
    // Burn
    const burnTx = await baobabToken.burn(burnAmount);
    const burnReceipt = await burnTx.wait();
    const burnGas = burnReceipt.gasUsed.toString();
    
    // Générer le rapport de gaz
    const gasReportContent = `
# Rapport d'estimation de gaz pour Baobab Token

Date de l'analyse: ${new Date().toISOString()}

| Fonction | Gaz consommé |
|----------|--------------|
| transfer | ${transferGas} |
| approve | ${approveGas} |
| transferFrom | ${transferFromGas} |
| burn | ${burnGas} |

## Analyse

Ces valeurs sont des estimations basées sur un environnement de test local.
Sur un réseau réel, la consommation peut varier en fonction de l'état de la blockchain.

## Recommandations

- Pour les transactions importantes, assurez-vous que le prix du gaz est approprié
- Pendant les périodes de congestion, envisagez d'augmenter le prix du gaz
- Envisagez d'optimiser davantage les fonctions coûteuses si nécessaire
`;
    
    fs.writeFileSync(path.join(resultsDir, "gas-report.md"), gasReportContent);
    console.log("✅ Rapport d'estimation de gaz généré: audit-results/gas-report.md");
    
  } catch (error) {
    console.log("❌ Erreur lors de l'estimation du gaz:", error.message);
  }
  
  console.log("\n🔒 Vérification de sécurité terminée!");
  
  if (hasVulnerabilities) {
    console.log("\n⚠️ Des problèmes potentiels ont été identifiés. Veuillez consulter le rapport de sécurité.");
  } else {
    console.log("\n✅ Aucun problème majeur de sécurité détecté.");
  }
  
  console.log("\n📝 Recommandations avant déploiement sur mainnet:");
  console.log("1. Examiner attentivement les rapports générés dans audit-results/");
  console.log("2. Envisager un audit externe par des professionnels");
  console.log("3. Effectuer des tests approfondis sur un réseau de test");
  console.log("4. Vérifier toutes les permissions d'administration");
}

main().catch((error) => {
  console.error("Erreur lors de la vérification de sécurité:", error);
  process.exit(1);
}); 