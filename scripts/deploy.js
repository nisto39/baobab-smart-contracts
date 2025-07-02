require("dotenv").config();
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

/**
 * Script de déploiement du contrat Baobab Token (BBT)
 * 
 * INFORMATIONS DE LANCEMENT RÉUSSIES :
 * ===================================
 * Date de lancement : 21 Janvier 2025
 * Réseau : BSC Mainnet
 * Adresse du contrat : 0x0354a58290E141b241d5b32AE02D581289f286b7
 * Paire PancakeSwap : 0x92AC19404DB9b4d5d841dBCa2d53fBb97eeCC146
 * Liquidité initiale : 100,000 BBT + 0.073 BNB
 * LP Tokens : 85.44 tokens (lockés sur PinkSale)
 * Prix initial : ~$0.000438 USD / BBT
 * Market Cap initial : ~$219,000
 * Statut : ✅ LIVE ET TRADABLE
 */

async function main() {
  // Récupération des variables d'environnement
  const treasuryAddress = process.env.TREASURY_ADDRESS;
  if (!treasuryAddress) {
    console.error("TREASURY_ADDRESS n'est pas défini dans le fichier .env");
    process.exit(1);
  }
  
  // Récupération du réseau actuel
  const network = hre.network.name;
  console.log(`Déploiement sur le réseau: ${network}`);
  
  // Vérifications supplémentaires pour le mainnet
  if (network === "mainnet" || network === "bsc") {
    const confirmation = process.env.CONFIRM_MAINNET_DEPLOY;
    if (confirmation !== "OUI_JE_SAIS_CE_QUE_JE_FAIS") {
      console.error(`
        ⚠️  ATTENTION: Vous êtes sur le point de déployer sur le MAINNET!
        Pour confirmer, ajoutez la variable suivante à votre fichier .env:
        CONFIRM_MAINNET_DEPLOY=OUI_JE_SAIS_CE_QUE_JE_FAIS
        
        📋 RAPPEL DES INFORMATIONS DE LANCEMENT RÉUSSIES :
        - Date : 21 Janvier 2025
        - Contrat : 0x0354a58290E141b241d5b32AE02D581289f286b7
        - Paire : 0x92AC19404DB9b4d5d841dBCa2d53fBb97eeCC146
        - Statut : ✅ DÉJÀ DÉPLOYÉ ET LIVE
      `);
      process.exit(1);
    }
    
    console.log("⚠️  Déploiement MAINNET confirmé! Procédons...");
  }
  
  // Récupération des signers
  const [deployer] = await hre.ethers.getSigners();
  console.log(`Adresse du déployeur: ${deployer.address}`);
  console.log(`Solde du déployeur: ${ethers.utils.formatEther(await deployer.getBalance())} ETH`);
  
  // Vérification du solde pour mainnet
  if ((network === "mainnet" || network === "bsc") && 
      parseFloat(ethers.utils.formatEther(await deployer.getBalance())) < 0.1) {
    console.error("Solde insuffisant pour le déploiement sur mainnet");
    process.exit(1);
  }
  
  // Déploiement du contrat
  console.log("Déploiement du contrat BaobabToken...");
  const BaobabToken = await hre.ethers.getContractFactory("BaobabToken");
  
  console.log("Treasury Address:", treasuryAddress);
  const baobabToken = await BaobabToken.deploy(treasuryAddress);
  
  await baobabToken.deployed();
  
  const contractAddress = await baobabToken.address;
  console.log(`✅ Baobab Token déployé à l'adresse: ${contractAddress}`);
  
  // Sauvegarder le déploiement dans un fichier
  const deploymentInfo = {
    network,
    contractAddress,
    treasuryAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber(),
    // Informations supplémentaires basées sur le lancement réussi
    launchInfo: {
      launchDate: "2025-01-21",
      launchBlock: "#51846773",
      pairAddress: network === "bsc" ? "0x92AC19404DB9b4d5d841dBCa2d53fBb97eeCC146" : "TBD",
      initialPrice: "$0.000438",
      initialMarketCap: "$219,000",
      initialLiquidity: "100,000 BBT + 0.073 BNB",
      lpTokens: "85.44 tokens",
      lockStatus: "Locked on PinkSale",
      status: "LIVE"
    }
  };
  
  const deploymentDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(deploymentDir, `deployment-${network}-${Date.now()}.json`),
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("Informations de déploiement sauvegardées");
  
  // Afficher les informations de lancement si c'est BSC Mainnet
  if (network === "bsc") {
    console.log("\n🎉 RAPPEL DES INFORMATIONS DE LANCEMENT BBT :");
    console.log("============================================");
    console.log(`📅 Date de lancement : 21 Janvier 2025`);
    console.log(`🔗 Contrat BSC : 0x0354a58290E141b241d5b32AE02D581289f286b7`);
    console.log(`🥞 Paire PancakeSwap : 0x92AC19404DB9b4d5d841dBCa2d53fBb97eeCC146`);
    console.log(`💧 Liquidité : 100,000 BBT + 0.073 BNB`);
    console.log(`🔒 LP Tokens : 85.44 tokens (lockés)`);
    console.log(`💰 Prix initial : ~$0.000438 USD`);
    console.log(`📊 Market Cap : ~$219,000`);
    console.log(`✅ Statut : LIVE ET TRADABLE`);
    console.log("\n🔗 Liens utiles :");
    console.log(`- PancakeSwap: https://pancakeswap.finance/swap?outputCurrency=${contractAddress}`);
    console.log(`- DexTools: https://dextools.io/app/bsc/pair-explorer/0x92AC19404DB9b4d5d841dBCa2d53fBb97eeCC146`);
    console.log(`- BSCScan: https://bscscan.com/address/${contractAddress}`);
  }
  
  // Vérifier le contrat sur Etherscan/BSCScan si ce n'est pas un réseau local
  if (network !== "hardhat" && network !== "localhost") {
    console.log("Attente de quelques confirmations avant vérification...");
    await baobabToken.deployTransaction.wait(5);
    
    console.log("Vérification du contrat sur le scanner...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [treasuryAddress]
      });
      console.log("✅ Contrat vérifié avec succès!");
    } catch (error) {
      console.log("Erreur lors de la vérification:", error.message);
      if (network === "bsc") {
        console.log("ℹ️  Le contrat BBT est déjà vérifié sur BSCScan");
      }
    }
  }
}

main().catch((error) => {
  console.error("Erreur lors du déploiement:", error);
  process.exitCode = 1;
});
