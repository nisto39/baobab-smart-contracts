/**
 * BBT Launch Information Script
 * ============================
 * 
 * Ce script affiche toutes les informations officielles du lancement
 * du Baobab Token (BBT) sur BSC Mainnet.
 * 
 * Date de création : 21 Janvier 2025
 * Statut : LIVE ET TRADABLE
 */

const BBT_LAUNCH_INFO = {
  // Informations générales
  tokenName: "Baobab Token",
  symbol: "BBT",
  network: "Binance Smart Chain (BSC)",
  standard: "BEP-20",
  decimals: 18,
  totalSupply: "500,000,000 BBT",
  
  // Dates importantes
  launchDate: "2025-01-21",
  launchTime: "16:59 UTC",
  launchBlock: "#51846773",
  
  // Adresses contractuelles
  contractAddress: "0x0354a58290E141b241d5b32AE02D581289f286b7",
  pairAddress: "0x92AC19404DB9b4d5d841dBCa2d53fBb97eeCC146",
  treasuryAddress: "0x15499bF2Cd5CC671B72b3814fB1FfB5374cC155F",
  
  // Informations de liquidité
  initialLiquidity: {
    bbt: "100,000 BBT",
    bnb: "0.073 BNB",
    lpTokens: "85.44 tokens",
    lpHolder: "0x44E93b0B8f05fAb759C49573c8DA324Db0a8a9b7"
  },
  
  // Informations de prix
  pricing: {
    initialPriceUSD: "$0.000438",
    initialPriceBNB: "0.00000073 BNB/BBT",
    initialMarketCap: "$219,000",
    ratio: "1 BNB = 1,369,863 BBT"
  },
  
  // Sécurité
  security: {
    lpTokensLocked: true,
    lockPlatform: "PinkSale",
    lockTxHash: "0x207d...2fe315",
    contractVerified: true,
    auditStatus: "Tests complets passés (50/50)"
  },
  
  // Liens officiels
  links: {
    pancakeSwap: "https://pancakeswap.finance/swap?outputCurrency=0x0354a58290E141b241d5b32AE02D581289f286b7",
    dexTools: "https://dextools.io/app/bsc/pair-explorer/0x92AC19404DB9b4d5d841dBCa2d53fBb97eeCC146",
    bscScanContract: "https://bscscan.com/address/0x0354a58290E141b241d5b32AE02D581289f286b7",
    bscScanPair: "https://bscscan.com/address/0x92AC19404DB9b4d5d841dBCa2d53fBb97eeCC146",
    website: "https://baobabexchange.com",
    telegram: "https://t.me/baobabexchange",
    twitter: "https://twitter.com/baobabexchange"
  },
  
  // Tokenomics
  tokenomics: {
    publicSale: "40% (200,000,000 BBT)",
    teamAdvisors: "20% (100,000,000 BBT)",
    marketing: "15% (75,000,000 BBT)",
    reserve: "15% (75,000,000 BBT)",
    rewards: "10% (50,000,000 BBT)"
  },
  
  // Phase information
  currentPhase: {
    name: "Phase 0",
    description: "Micro-liquidité de lancement",
    status: "LIVE",
    features: [
      "Early bird advantage",
      "Liquidité limitée = Potentiel de pump élevé", 
      "Premiers acheteurs privilégiés",
      "Community-driven growth"
    ],
    warnings: [
      "Liquidité Phase 0 = Volatilité élevée",
      "DYOR avant d'investir",
      "Slippage élevé pour gros montants"
    ]
  },
  
  // Prochaines phases
  roadmap: {
    phase1: {
      name: "Expansion Liquidité",
      timeline: "1-4 semaines",
      objectives: ["Ajouter 1-5 BNB de liquidité", "Participation communautaire"]
    },
    phase2: {
      name: "Marketing & Adoption", 
      timeline: "1-3 mois",
      objectives: ["Listings autres DEX", "Partenariats stratégiques", "Campagnes marketing"]
    },
    phase3: {
      name: "Écosystème",
      timeline: "3-6 mois", 
      objectives: ["Applications BBT", "Staking et farming", "Gouvernance décentralisée"]
    }
  }
};

// Fonction pour afficher les informations
function displayLaunchInfo() {
  console.log("\n🚀 BAOBAB TOKEN (BBT) - INFORMATIONS DE LANCEMENT");
  console.log("=".repeat(60));
  
  console.log(`\n📋 INFORMATIONS GÉNÉRALES`);
  console.log(`Token: ${BBT_LAUNCH_INFO.tokenName} (${BBT_LAUNCH_INFO.symbol})`);
  console.log(`Réseau: ${BBT_LAUNCH_INFO.network}`);
  console.log(`Standard: ${BBT_LAUNCH_INFO.standard}`);
  console.log(`Supply: ${BBT_LAUNCH_INFO.totalSupply}`);
  
  console.log(`\n📅 DATES IMPORTANTES`);
  console.log(`Date de lancement: ${BBT_LAUNCH_INFO.launchDate}`);
  console.log(`Heure: ${BBT_LAUNCH_INFO.launchTime}`);
  console.log(`Block: ${BBT_LAUNCH_INFO.launchBlock}`);
  
  console.log(`\n🔗 ADRESSES CONTRACTUELLES`);
  console.log(`Contrat BBT: ${BBT_LAUNCH_INFO.contractAddress}`);
  console.log(`Paire BBT/BNB: ${BBT_LAUNCH_INFO.pairAddress}`);
  console.log(`Trésorerie: ${BBT_LAUNCH_INFO.treasuryAddress}`);
  
  console.log(`\n💧 LIQUIDITÉ INITIALE`);
  console.log(`BBT: ${BBT_LAUNCH_INFO.initialLiquidity.bbt}`);
  console.log(`BNB: ${BBT_LAUNCH_INFO.initialLiquidity.bnb}`);
  console.log(`LP Tokens: ${BBT_LAUNCH_INFO.initialLiquidity.lpTokens}`);
  
  console.log(`\n💰 INFORMATIONS DE PRIX`);
  console.log(`Prix initial (USD): ${BBT_LAUNCH_INFO.pricing.initialPriceUSD}`);
  console.log(`Prix initial (BNB): ${BBT_LAUNCH_INFO.pricing.initialPriceBNB}`);
  console.log(`Market Cap: ${BBT_LAUNCH_INFO.pricing.initialMarketCap}`);
  console.log(`Ratio: ${BBT_LAUNCH_INFO.pricing.ratio}`);
  
  console.log(`\n🔒 SÉCURITÉ`);
  console.log(`LP Tokens lockés: ${BBT_LAUNCH_INFO.security.lpTokensLocked ? '✅ OUI' : '❌ NON'}`);
  console.log(`Plateforme de lock: ${BBT_LAUNCH_INFO.security.lockPlatform}`);
  console.log(`Contrat vérifié: ${BBT_LAUNCH_INFO.security.contractVerified ? '✅ OUI' : '❌ NON'}`);
  console.log(`Audit: ${BBT_LAUNCH_INFO.security.auditStatus}`);
  
  console.log(`\n🔗 LIENS OFFICIELS`);
  console.log(`PancakeSwap: ${BBT_LAUNCH_INFO.links.pancakeSwap}`);
  console.log(`DexTools: ${BBT_LAUNCH_INFO.links.dexTools}`);
  console.log(`BSCScan: ${BBT_LAUNCH_INFO.links.bscScanContract}`);
  console.log(`Site web: ${BBT_LAUNCH_INFO.links.website}`);
  
  console.log(`\n📊 TOKENOMICS`);
  Object.entries(BBT_LAUNCH_INFO.tokenomics).forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
  
  console.log(`\n🎯 PHASE ACTUELLE: ${BBT_LAUNCH_INFO.currentPhase.name}`);
  console.log(`Description: ${BBT_LAUNCH_INFO.currentPhase.description}`);
  console.log(`Statut: ${BBT_LAUNCH_INFO.currentPhase.status}`);
  
  console.log(`\n✅ Avantages:`);
  BBT_LAUNCH_INFO.currentPhase.features.forEach(feature => {
    console.log(`  • ${feature}`);
  });
  
  console.log(`\n⚠️  Avertissements:`);
  BBT_LAUNCH_INFO.currentPhase.warnings.forEach(warning => {
    console.log(`  • ${warning}`);
  });
  
  console.log(`\n🗺️  ROADMAP`);
  Object.entries(BBT_LAUNCH_INFO.roadmap).forEach(([phase, info]) => {
    console.log(`${info.name} (${info.timeline}):`);
    info.objectives.forEach(obj => console.log(`  • ${obj}`));
  });
  
  console.log("\n" + "=".repeat(60));
  console.log("🎉 BBT EST MAINTENANT LIVE ET TRADABLE ! 🎉");
  console.log("=".repeat(60));
}

// Fonction pour générer le message de lancement
function generateLaunchMessage() {
  return `🔥 BAOBAB TOKEN (BBT) EST MAINTENANT LIVE SUR PANCAKESWAP! 🔥

✅ Contrat vérifié: ${BBT_LAUNCH_INFO.contractAddress}
✅ Paire BBT/BNB: ${BBT_LAUNCH_INFO.pairAddress}
✅ Liquidité initiale bloquée
⚡ Phase 0: Micro-liquidité de lancement

🎯 EARLY BIRD ADVANTAGE:
• Liquidité limitée = Potentiel de pump élevé
• Premiers acheteurs privilégiés
• Community-driven growth

🔗 LIENS RAPIDES:
• Swap: ${BBT_LAUNCH_INFO.links.pancakeSwap}
• Chart: ${BBT_LAUNCH_INFO.links.dexTools}
• Contract: ${BBT_LAUNCH_INFO.links.bscScanContract}

⚠️ DYOR - Liquidité Phase 0 = Volatilité élevée
🚀 Next Phase: Plus de liquidité arrive bientôt!

#BBT #BaobabToken #PancakeSwap #BSC #DeFi #GEM`;
}

// Exportation pour utilisation dans d'autres scripts
module.exports = {
  BBT_LAUNCH_INFO,
  displayLaunchInfo,
  generateLaunchMessage
};

// Exécuter si appelé directement
if (require.main === module) {
  displayLaunchInfo();
  
  console.log("\n📢 MESSAGE DE LANCEMENT PRÊT À PARTAGER:");
  console.log("-".repeat(50));
  console.log(generateLaunchMessage());
}