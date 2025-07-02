# Scripts Baobab Token (BBT) 

Ce répertoire contient tous les scripts utiles pour le déploiement, la gestion et la maintenance du contrat Baobab Token (BBT).

## 📋 Informations de Lancement BBT

- **Date de lancement** : 21 Janvier 2025
- **Contrat BBT** : `0x0354a58290E141b241d5b32AE02D581289f286b7`
- **Paire BBT/BNB** : `0x92AC19404DB9b4d5d841dBCa2d53fBb97eeCC146`
- **Statut** : ✅ LIVE ET TRADABLE sur PancakeSwap
- **Réseau** : BSC Mainnet
- **LP Tokens** : Lockés sur PinkSale

## 📁 Scripts Disponibles

### 🚀 Scripts de Déploiement

#### `deploy.js`
Script principal de déploiement du contrat BBT.
```bash
npx hardhat run scripts/deploy.js --network bsc
```
**Fonctionnalités** :
- Déploiement du contrat BaobabToken
- Vérification automatique sur BSCScan
- Sauvegarde des informations de déploiement
- Affichage des informations de lancement pour BSC Mainnet

#### `prepare-deploy.js`
Script de préparation et vérification avant déploiement.
```bash
node scripts/prepare-deploy.js
```
**Fonctionnalités** :
- Configuration interactive des variables d'environnement
- Vérification des prérequis
- Création des fichiers .env et .env.example
- Validation des adresses et paramètres

### 📊 Scripts d'Information

#### `bbt-launch-info.js` ⭐ NOUVEAU
Script d'affichage complet des informations de lancement BBT.
```bash
node scripts/bbt-launch-info.js
```
**Fonctionnalités** :
- Informations complètes du token BBT
- Adresses contractuelles et de liquidité
- Données de prix et market cap
- Tokenomics et roadmap
- Message de lancement prêt à partager
- Liens officiels (PancakeSwap, DexTools, BSCScan)

### 🧪 Scripts de Test et Vérification

#### `run-tests.js`
Exécution des tests automatisés du contrat.
```bash
node scripts/run-tests.js
```

#### `verify-build.js`
Vérification de la construction et des correctifs appliqués.
```bash
node scripts/verify-build.js
```

### 🔧 Scripts de Correctifs

#### `fix-line-42.js`
Correctif pour les erreurs de ligne 42.

#### `fix-undefined-error.js`
Correctif pour les erreurs "undefined".

#### `fix-vendor.js`
Correctif pour les fichiers vendor.

#### `enhanced-jsx-shim.js`
Amélioration du shim JSX.

## 📋 Variables d'Environnement Requises

Créez un fichier `.env` avec les variables suivantes :

```env
# Clés privées
PRIVATE_KEY=votre_clé_privée_testnet
MAINNET_PRIVATE_KEY=votre_clé_privée_mainnet

# Adresses
TREASURY_ADDRESS=0x15499bF2Cd5CC671B72b3814fB1FfB5374cC155F

# API Keys
BSCSCAN_API_KEY=votre_clé_api_bscscan
ETHERSCAN_API_KEY=votre_clé_api_etherscan

# Confirmation pour mainnet
CONFIRM_MAINNET_DEPLOY=OUI_JE_SAIS_CE_QUE_JE_FAIS

# Optionnel
REPORT_GAS=true
COINMARKETCAP_API_KEY=votre_clé_coinmarketcap
```

## 🌐 Réseaux Supportés

### BSC Mainnet (LIVE)
```bash
npx hardhat run scripts/deploy.js --network bsc
```

### BSC Testnet
```bash
npx hardhat run scripts/deploy.js --network bsctestnet
```

### Localhost
```bash
npx hardhat run scripts/deploy.js --network localhost
```

## 🔗 Liens Utiles

### Trading
- **PancakeSwap** : https://pancakeswap.finance/swap?outputCurrency=0x0354a58290E141b241d5b32AE02D581289f286b7
- **DexTools** : https://dextools.io/app/bsc/pair-explorer/0x92AC19404DB9b4d5d841dBCa2d53fBb97eeCC146

### Vérification
- **BSCScan Contrat** : https://bscscan.com/address/0x0354a58290E141b241d5b32AE02D581289f286b7
- **BSCScan Paire** : https://bscscan.com/address/0x92AC19404DB9b4d5d841dBCa2d53fBb97eeCC146

### Projet
- **Site web** : https://baobabexchange.com
- **Telegram** : https://t.me/baobabexchange
- **Twitter** : https://twitter.com/baobabexchange

## 📊 Informations Techniques

### Token BBT
- **Nom** : Baobab Token
- **Symbole** : BBT
- **Décimales** : 18
- **Supply Total** : 500,000,000 BBT
- **Standard** : BEP-20

### Liquidité Phase 0
- **BBT dans la paire** : 100,000 BBT
- **BNB dans la paire** : 0.073 BNB
- **LP Tokens** : 85.44 tokens (lockés)
- **Prix initial** : ~$0.000438 USD/BBT

### Sécurité
- ✅ Contrat vérifié sur BSCScan
- ✅ LP Tokens lockés sur PinkSale
- ✅ Audit complet passé (50/50 tests)
- ✅ Aucun risque de rug pull

## 🚨 Notes Importantes

1. **BBT est déjà déployé et LIVE** sur BSC Mainnet depuis le 21 janvier 2025
2. Les scripts de déploiement sont conservés à des fins de référence et de test
3. Toujours vérifier les adresses avant toute transaction
4. Le token est en Phase 0 (micro-liquidité) - volatilité élevée attendue
5. DYOR (Do Your Own Research) avant tout investissement

## 🆘 Support

Pour toute question technique ou problème avec les scripts :
- Consulter la documentation Hardhat
- Vérifier les variables d'environnement
- Tester sur BSC Testnet en premier
- Contacter l'équipe sur Telegram : https://t.me/baobabexchange

---

**Dernière mise à jour** : 21 Janvier 2025  
**Statut BBT** : 🟢 LIVE ET TRADABLE