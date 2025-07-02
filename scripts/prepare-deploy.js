require("dotenv").config();
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Variables requises pour le déploiement
const requiredEnvVars = {
  PRIVATE_KEY: "Clé privée pour les réseaux de test",
  TREASURY_ADDRESS: "Adresse du trésor qui recevra 30% des tokens",
};

// Variables requises supplémentaires pour mainnet
const mainnetEnvVars = {
  MAINNET_PRIVATE_KEY: "Clé privée pour les réseaux principaux",
  CONFIRM_MAINNET_DEPLOY: "Confirmation pour le déploiement mainnet (OUI_JE_SAIS_CE_QUE_JE_FAIS)",
  ETHERSCAN_API_KEY: "Clé API Etherscan pour vérifier le contrat",
  BSCSCAN_API_KEY: "Clé API BSCScan pour vérifier le contrat",
};

// Variables optionnelles
const optionalEnvVars = {
  REPORT_GAS: "Activer les rapports de gaz (true/false)",
  COINMARKETCAP_API_KEY: "Clé API CoinMarketCap pour obtenir les prix du gaz en USD",
};

// Chemins des fichiers clés
const envFilePath = path.join(__dirname, "../../.env");
const envExampleFilePath = path.join(__dirname, "../../.env.example");

async function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log("\n🌳 Préparation du déploiement du contrat Baobab Token 🌳\n");
  console.log("📋 RAPPEL : BBT EST DÉJÀ DÉPLOYÉ SUR BSC MAINNET");
  console.log("Date de lancement : 21 Janvier 2025");
  console.log("Contrat : 0x0354a58290E141b241d5b32AE02D581289f286b7");
  console.log("Paire : 0x92AC19404DB9b4d5d841dBCa2d53fBb97eeCC146");
  console.log("Statut : ✅ LIVE ET TRADABLE\n");
  
  // Vérifier si le fichier .env existe
  if (!fs.existsSync(envFilePath)) {
    console.log("🔍 Fichier .env non trouvé, création d'un nouveau fichier...");
    // Créer un fichier .env vide
    fs.writeFileSync(envFilePath, "");
  }
  
  // Lire le fichier .env existant
  let envContent = fs.readFileSync(envFilePath, "utf8");
  const envVars = {};
  
  // Analyser les variables d'environnement existantes
  envContent.split("\n").forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match && match[1] && match[2]) {
      envVars[match[1].trim()] = match[2].trim();
    }
  });
  
  console.log("📋 Vérification des variables d'environnement requises...\n");
  
  // Demander les variables manquantes
  let isChanged = false;
  
  // Vérifier le réseau de déploiement
  const network = await askQuestion("🌐 Réseau de déploiement (testnet/mainnet/bsc/bsctestnet/sepolia): ");
  const isMainnet = network === "mainnet" || network === "bsc";
  
  // Vérifier les variables requises
  const varsToCheck = isMainnet 
    ? { ...requiredEnvVars, ...mainnetEnvVars } 
    : requiredEnvVars;
  
  for (const [key, description] of Object.entries(varsToCheck)) {
    if (!envVars[key]) {
      console.log(`❓ ${description} (${key}):`);
      const value = await askQuestion(`  Entrez la valeur pour ${key}: `);
      envVars[key] = value;
      isChanged = true;
    }
  }
  
  // Vérifier les variables optionnelles
  console.log("\n📋 Vérification des variables d'environnement optionnelles...\n");
  for (const [key, description] of Object.entries(optionalEnvVars)) {
    if (!envVars[key]) {
      const setOptional = await askQuestion(`❓ Voulez-vous définir ${description} (${key})? (o/n): `);
      if (setOptional.toLowerCase() === "o") {
        const value = await askQuestion(`  Entrez la valeur pour ${key}: `);
        envVars[key] = value;
        isChanged = true;
      }
    }
  }
  
  // Mettre à jour le fichier .env si nécessaire
  if (isChanged) {
    let newEnvContent = "";
    for (const [key, value] of Object.entries(envVars)) {
      newEnvContent += `${key}=${value}\n`;
    }
    fs.writeFileSync(envFilePath, newEnvContent);
    console.log("\n✅ Fichier .env mis à jour avec succès!");
    
    // Créer un fichier .env.example si inexistant
    if (!fs.existsSync(envExampleFilePath)) {
      let exampleContent = "";
      for (const key of Object.keys(requiredEnvVars)) {
        exampleContent += `${key}=\n`;
      }
      for (const key of Object.keys(mainnetEnvVars)) {
        exampleContent += `${key}=\n`;
      }
      for (const key of Object.keys(optionalEnvVars)) {
        exampleContent += `${key}=\n`;
      }
      fs.writeFileSync(envExampleFilePath, exampleContent);
      console.log("✅ Fichier .env.example créé avec succès!");
    }
  }
  
  console.log("\n🔍 Vérification de la configuration pour le déploiement...");
  
  // Vérification du réseau
  console.log(`\n🌐 Réseau de déploiement: ${network}`);
  if (isMainnet) {
    console.log("\n⚠️  ATTENTION: Vous allez déployer sur un réseau MAINNET!");
    if (envVars.CONFIRM_MAINNET_DEPLOY !== "OUI_JE_SAIS_CE_QUE_JE_FAIS") {
      console.log("❌ La confirmation pour le déploiement mainnet est incorrecte ou manquante.");
      console.log("   Définissez CONFIRM_MAINNET_DEPLOY=OUI_JE_SAIS_CE_QUE_JE_FAIS dans .env");
      process.exit(1);
    } else {
      console.log("✅ Confirmation mainnet vérifiée.");
    }
    
    if (!envVars.MAINNET_PRIVATE_KEY) {
      console.log("❌ MAINNET_PRIVATE_KEY est manquante pour le déploiement mainnet.");
      process.exit(1);
    }
  }
  
  // Vérification de l'adresse du trésor
  if (!envVars.TREASURY_ADDRESS || !envVars.TREASURY_ADDRESS.startsWith("0x")) {
    console.log("❌ L'adresse du trésor est invalide ou manquante.");
    process.exit(1);
  } else {
    console.log("✅ Adresse du trésor validée:", envVars.TREASURY_ADDRESS);
  }
  
  console.log("\n✅ Configuration vérifiée avec succès!");
  console.log("\n🚀 Pour déployer le contrat, exécutez:");
  console.log(`npx hardhat run scripts/deploy.js --network ${network}`);
  
  rl.close();
}

main().catch((error) => {
  console.error("Erreur:", error);
  process.exit(1);
}); 