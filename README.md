# 🌳 Baobab Token (BBT) Smart Contract

Le contrat Baobab Token (BBT) est un token BEP20 sécurisé conçu pour la plateforme Baobab Exchange, permettant les transferts d'argent entre la Russie et l'Afrique.

## Caractéristiques du token

- **Nom**: Baobab Token
- **Symbole**: BBT
- **Décimales**: 18
- **Supply Total**: 500 000 000 BBT
- **Distribution Initiale**: 
  - 30% au Trésor (Treasury)
  - 70% au propriétaire (Owner)

## Fonctionnalités de sécurité

- Protection contre la réentrance
- Contrôle d'accès basé sur les rôles
- Mécanisme de pause d'urgence
- Liste blanche pour les contrats autorisés
- Délai minimal entre les changements de trésorerie
- Limitation des montants de burn

## Prérequis

- Node.js v16+ et npm
- Git

## Installation et configuration

1. Cloner le repository et installer les dépendances:

```bash
git clone https://github.com/votrepseudo/baobab-exchange.git
cd baobab-exchange
npm install
```

2. Configurez votre fichier `.env` pour le déploiement. Utilisez le script de préparation:

```bash
node contracts/scripts/prepare-deploy.js
```

Ce script interactif vous guidera pour configurer les variables nécessaires.

## Tests

Exécutez les tests complets avant tout déploiement:

```bash
# Exécution de tous les tests
node contracts/scripts/run-tests.js

# Vérification de sécurité supplémentaire
node contracts/scripts/audit/security-check.js
```

## Déploiement

### Déploiement sur le réseau de test

```bash
# BSC Testnet
npx hardhat run contracts/scripts/deploy.js --network bsctestnet

# Sepolia (Ethereum Testnet)
npx hardhat run contracts/scripts/deploy.js --network sepolia
```

### Déploiement sur le Mainnet

⚠️ **ATTENTION**: Le déploiement sur le mainnet est irréversible et implique de vrais actifs financiers.

Avant de déployer sur le mainnet:
1. Assurez-vous d'avoir effectué tous les tests sur les réseaux de test
2. Vérifiez que vous avez suffisamment de fonds pour couvrir les frais de gaz
3. Configurez la variable `CONFIRM_MAINNET_DEPLOY=OUI_JE_SAIS_CE_QUE_JE_FAIS` dans votre `.env`

```bash
# BSC Mainnet
npx hardhat run contracts/scripts/deploy.js --network bsc

# Ethereum Mainnet
npx hardhat run contracts/scripts/deploy.js --network mainnet
```

## Interaction avec le contrat

Une fois déployé, vous pouvez interagir avec le contrat via:

- Le frontend de Baobab Exchange
- Un outil comme Remix ou Hardhat Console
- Des scripts personnalisés

### Exemples d'interactions courantes

```javascript
// Obtenir le solde d'un utilisateur
const balance = await baobabToken.balanceOf(userAddress);

// Transférer des tokens
await baobabToken.transfer(recipientAddress, amount);

// Approuver un spender
await baobabToken.approve(spenderAddress, amount);

// Distribuer des récompenses (owner uniquement)
await baobabToken.distributeRewards([address1, address2], [amount1, amount2]);
```

## Audit et sécurité

Le contrat a été soumis à plusieurs niveaux de vérification:

1. Tests unitaires complets (>90% de couverture)
2. Analyse statique de code avec Slither
3. Vérification manuelle des meilleures pratiques
4. Implémentation des contrôles de sécurité recommandés

Pour exécuter votre propre audit:

```bash
node contracts/scripts/audit/security-check.js
```

## Licence

Ce contrat est sous licence MIT. Consultez le fichier LICENSE pour plus de détails.

## Support

Pour toute question ou assistance, contactez l'équipe Baobab Exchange via:
- Email: support@baobabexchange.com
- Discord: [Baobab Exchange Community](https://discord.gg/baobabexchange) # Repository Supprimé

Ce repository a été nettoyé. Tous les commits précédents ont été supprimés. 
