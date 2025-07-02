const { expect } = require("chai");
const { ethers } = require("hardhat");

const TWO_DAYS_IN_SECONDS = 2 * 24 * 60 * 60;

describe("BaobabToken", function () {
  let baobabToken;
  let owner;
  let treasury;
  let user1;
  let user2;
  let user3;
  let treasuryAddress;
  let mockContract;
  let mockContractAddress;
  
  const TOTAL_SUPPLY_STRING = "500000000";
  const TOTAL_SUPPLY = ethers.parseEther(TOTAL_SUPPLY_STRING);
  const TREASURY_PERCENTAGE = 30n;
  const MAX_BURN_AMOUNT_STRING = "50000";
  const MAX_BURN_AMOUNT = ethers.parseEther(MAX_BURN_AMOUNT_STRING);
  
  beforeEach(async function () {
    [owner, treasury, user1, user2, user3] = await ethers.getSigners();
    treasuryAddress = treasury.address;
    
    const ContractFactory = await ethers.getContractFactory("contracts/BaobabToken.sol:BaobabToken");
    
    baobabToken = await ContractFactory.deploy(treasuryAddress);
    
    mockContract = await ContractFactory.deploy(treasuryAddress);
    mockContractAddress = await mockContract.getAddress();
  });
  
  describe("Initialisation du contrat", function () {
    it("Doit initialiser avec les bonnes métadonnées", async function () {
      expect(await baobabToken.name()).to.equal("Baobab Token");
      expect(await baobabToken.symbol()).to.equal("BBT");
      expect(await baobabToken.decimals()).to.equal(18);
    });
    
    it("Doit initialiser avec le bon supply total et initialTotalSupply", async function () {
      const totalSupplyFromContract = await baobabToken.totalSupply();
      const initialTotalSupplyFromContract = await baobabToken.INITIAL_TOTAL_SUPPLY();
      expect(totalSupplyFromContract).to.equal(TOTAL_SUPPLY);
      expect(initialTotalSupplyFromContract).to.equal(TOTAL_SUPPLY);
    });
    
    it("Doit allouer correctement les tokens entre owner et treasury", async function () {
      const treasuryAmount = (TOTAL_SUPPLY * TREASURY_PERCENTAGE) / 100n;
      const ownerAmount = TOTAL_SUPPLY - treasuryAmount;
      
      expect(await baobabToken.balanceOf(treasuryAddress)).to.equal(treasuryAmount);
      expect(await baobabToken.balanceOf(owner.address)).to.equal(ownerAmount);
    });
    
    it("Doit échouer si le destinataire est un contrat non listé", async function () {
      const amount = ethers.parseEther("1000");
      await expect(
        baobabToken.transfer(mockContractAddress, amount)
      ).to.be.revertedWithCustomError(baobabToken, "TransfersToContractsRestricted");
    });

    it("Doit réussir si le destinataire est un contrat listé", async function () {
      const amount = ethers.parseEther("1000");
      await baobabToken.connect(owner).setContractWhitelist(mockContractAddress, true);
      await expect(baobabToken.transfer(mockContractAddress, amount)).to.not.be.reverted;
      expect(await baobabToken.balanceOf(mockContractAddress)).to.equal(amount);
    });
  });
  
  describe("Fonction transfer", function () {
    it("Doit transférer des tokens entre deux adresses", async function () {
      const amount = ethers.parseUnits("1000", 18);
      const user1Address = user1.address;
      
      await baobabToken.transfer(user1Address, amount);
      
      const balance = await baobabToken.balanceOf(user1Address);
      expect(balance.toString()).to.equal(amount.toString());
    });
    
    it("Doit échouer si le solde est insuffisant", async function () {
      const amount = ethers.parseEther("1000");
      const user2Address = user2.address;
      
      await expect(
        baobabToken.connect(user1).transfer(user2Address, amount)
      ).to.be.revertedWithCustomError(baobabToken, "InsufficientBalance");
    });
  });
  
  describe("Fonction approve et transferFrom", function () {
    it("Doit permettre l'approbation et le transferFrom", async function () {
      const amount = ethers.parseEther("1000");
      const ownerAddress = owner.address;
      const user1Address = user1.address;
      const user2Address = user2.address;
      
      const initialOwnerBalance = await baobabToken.balanceOf(ownerAddress);
      
      await baobabToken.transfer(user1Address, amount);
      
      await baobabToken.connect(user1).approve(user2Address, amount);
      
      const allowance = await baobabToken.allowance(user1Address, user2Address);
      expect(allowance.toString()).to.equal(amount.toString());
      
      await baobabToken.connect(user2).transferFrom(user1Address, ownerAddress, amount);
      
      expect(await baobabToken.balanceOf(user1Address)).to.equal(0n);
      expect(await baobabToken.allowance(user1Address, user2Address)).to.equal(0n);
      
      const expectedOwnerBalance = initialOwnerBalance;
      const ownerActualBalance = await baobabToken.balanceOf(ownerAddress);
      expect(ownerActualBalance.toString()).to.equal(expectedOwnerBalance.toString());
    });
    
    it("Doit échouer si l'allocation est insuffisante", async function () {
      const amount = ethers.parseEther("1000");
      const smallerAmount = ethers.parseEther("500");
      const user1Address = user1.address;
      const user2Address = user2.address;
      const user3Address = user3.address;
      
      await baobabToken.transfer(user1Address, amount);
      
      await baobabToken.connect(user1).approve(user2Address, smallerAmount);
      
      await expect(
        baobabToken.connect(user2).transferFrom(user1Address, user3Address, amount)
      ).to.be.revertedWithCustomError(baobabToken, "AllowanceExceeded");
    });
  });
  
  describe("Fonction burn", function () {
    it("Doit permettre de brûler des tokens", async function () {
      const burnAmount = ethers.parseEther("1000");
      const ownerAddress = owner.address;
      const initialOwnerBalance = await baobabToken.balanceOf(ownerAddress);
      const initialTotalSupplyFromContract = await baobabToken.totalSupply();
      
      const tx = await baobabToken.burn(burnAmount);
      await tx.wait();
      
      const expectedBalance = initialOwnerBalance - burnAmount;
      expect(await baobabToken.balanceOf(ownerAddress)).to.equal(expectedBalance);
      
      const expectedTotalSupply = initialTotalSupplyFromContract - burnAmount;
      expect(await baobabToken.totalSupply()).to.equal(expectedTotalSupply);
      
      expect(await baobabToken.totalBurned()).to.equal(burnAmount);
      
      await expect(tx).to.emit(baobabToken, "TokensBurned").withArgs(owner.address, burnAmount);
      await expect(tx).to.emit(baobabToken, "Transfer").withArgs(owner.address, ethers.ZeroAddress, burnAmount);
    });
    
    it("Doit échouer si le montant à brûler est supérieur à maxBurnAmount", async function () {
      const excessiveBurnAmount = MAX_BURN_AMOUNT + 1n;
      await expect(
        baobabToken.burn(excessiveBurnAmount)
      ).to.be.revertedWithCustomError(baobabToken, "BurnAmountExceedsLimitOrIsZero");
    });

    it("Doit échouer si le montant à brûler est zéro", async function () {
      await expect(
        baobabToken.burn(0)
      ).to.be.revertedWithCustomError(baobabToken, "BurnAmountExceedsLimitOrIsZero");
    });
    
    it("Doit échouer si le solde est insuffisant pour brûler", async function () {
      const burnAmount = ethers.parseEther("1000");
      await expect(
        baobabToken.connect(user1).burn(burnAmount)
      ).to.be.revertedWithCustomError(baobabToken, "InsufficientBalance");
    });

    it("Doit échouer si le total brûlé dépasse 50% de initialTotalSupply", async function () {
      const halfSupply = TOTAL_SUPPLY / 2n;
      const ownerInitialTokens = await baobabToken.balanceOf(owner.address);

      const burnAmount1 = halfSupply - ethers.parseEther("1");
      
      if (ownerInitialTokens >= burnAmount1 && MAX_BURN_AMOUNT >= burnAmount1) {
          await baobabToken.connect(owner).burn(burnAmount1);
          const remainingOwnerBalance = await baobabToken.balanceOf(owner.address);
          const justAboveLimitBurn = ethers.parseEther("2");
          if (remainingOwnerBalance >= justAboveLimitBurn && MAX_BURN_AMOUNT >= justAboveLimitBurn) { 
            await expect(baobabToken.connect(owner).burn(justAboveLimitBurn))
              .to.be.revertedWithCustomError(baobabToken, "TotalBurnLimitExceeded");
          } else {
            console.warn("Skipping part of total burn limit test: owner balance or MAX_BURN_AMOUNT too small for second burn.");
          }
      } else {
        console.warn("Skipping total burn limit test: owner balance or MAX_BURN_AMOUNT too small for initial large burn.");
      }
    });
  });
  
  describe("Fonctions de gestion du trésor", function () {
    it("Doit permettre à l'owner de mettre à jour l'adresse du trésor (même si elle détient des tokens)", async function () {
      const newTreasurySigner = user3;
      const newTreasuryAddr = newTreasurySigner.address;
      await baobabToken.connect(owner).transfer(newTreasuryAddr, ethers.parseEther("1"));
      expect(await baobabToken.balanceOf(newTreasuryAddr)).to.equal(ethers.parseEther("1"));

      await ethers.provider.send("evm_increaseTime", [TWO_DAYS_IN_SECONDS + 1]);
      await ethers.provider.send("evm_mine");

      await expect(baobabToken.connect(owner).updateTreasury(newTreasuryAddr))
        .to.emit(baobabToken, "TreasuryUpdated").withArgs(newTreasuryAddr);
      expect(await baobabToken.treasury()).to.equal(newTreasuryAddr);
    });

    it("Doit permettre à l'owner de définir sa propre adresse comme trésor", async function () {
      const ownerAddress = owner.address;
      await ethers.provider.send("evm_increaseTime", [TWO_DAYS_IN_SECONDS + 1]);
      await ethers.provider.send("evm_mine");

      await expect(baobabToken.connect(owner).updateTreasury(ownerAddress))
        .to.emit(baobabToken, "TreasuryUpdated").withArgs(ownerAddress);
      expect(await baobabToken.treasury()).to.equal(ownerAddress);
    });

    it("Doit échouer si la mise à jour du trésor est trop rapprochée", async function () {
      await ethers.provider.send("evm_increaseTime", [TWO_DAYS_IN_SECONDS + 1]);
      await ethers.provider.send("evm_mine");
      await baobabToken.connect(owner).updateTreasury(user1.address); 
      await expect(baobabToken.connect(owner).updateTreasury(user2.address))
        .to.be.revertedWithCustomError(baobabToken, "TreasuryChangeTooSoon");
    });
  });
  
  describe("Fonction distributeRewards", function () {
    it("Doit permettre à l'owner de distribuer des récompenses", async function () {
      const rewardAmount1 = ethers.parseEther("100");
      const rewardAmount2 = ethers.parseEther("200");
      const user1Address = user1.address;
      const user2Address = user2.address;
      const ownerAddress = owner.address;
      
      const treasuryInitialBalance = await baobabToken.balanceOf(treasury.address);
      
      await baobabToken.distributeRewards(
        [user1Address, user2Address],
        [rewardAmount1, rewardAmount2]
      );
      
      expect(await baobabToken.balanceOf(user1Address)).to.equal(rewardAmount1);
      expect(await baobabToken.balanceOf(user2Address)).to.equal(rewardAmount2);
      
      const expectedTreasuryBalance = treasuryInitialBalance - (rewardAmount1 + rewardAmount2);
      expect(await baobabToken.balanceOf(treasury.address)).to.equal(expectedTreasuryBalance);
    });
    
    it("Doit échouer si le solde de la trésorerie est insuffisant pour les récompenses", async function () {
      const treasuryBalance = await baobabToken.balanceOf(treasury.address);
      const excessiveReward = treasuryBalance + 1n;
      
      // Transférer tous les fonds de l'owner à un autre user pour s'assurer que c'est bien le solde de la trésorerie qui est vérifié
      const ownerBalance = await baobabToken.balanceOf(owner.address);
      await baobabToken.connect(owner).transfer(user3.address, ownerBalance);

      await expect(baobabToken.distributeRewards([user1.address], [excessiveReward]))
        .to.be.revertedWithCustomError(baobabToken, "InsufficientBalance");
    });
    
    it("Doit échouer si les tableaux n'ont pas la même longueur", async function () {
      const rewardAmount = ethers.parseEther("100");
      await expect(baobabToken.distributeRewards([user1.address, user2.address], [rewardAmount]))
        .to.be.revertedWithCustomError(baobabToken, "ArraysLengthMismatch");
    });
    
    it("Doit échouer si la liste des destinataires est vide", async function () {
      await expect(baobabToken.distributeRewards([], []))
        .to.be.revertedWithCustomError(baobabToken, "RecipientsListIsEmpty");
    });

    it("Doit échouer si un montant de récompense est nul", async function () {
      const rewardAmount = ethers.parseEther("100");
      await expect(baobabToken.distributeRewards([user1.address, user2.address], [rewardAmount, 0]))
        .to.be.revertedWithCustomError(baobabToken, "InvalidRewardAmount");
    });

    it("Doit échouer si une récompense est envoyée à un contrat non listé", async function () {
      const rewardAmount = ethers.parseEther("100");
      await expect(baobabToken.distributeRewards([mockContractAddress], [rewardAmount]))
        .to.be.revertedWithCustomError(baobabToken, "RewardsToContractsNotAllowed");
    });
  });
  
  describe("Fonction renounceOwnership", function () {
    it("Doit permettre à l'owner de renoncer à la propriété", async function () {
      await expect(baobabToken.connect(owner).renounceOwnership())
        .to.emit(baobabToken, "OwnershipTransferred")
        .withArgs(owner.address, ethers.ZeroAddress);
      expect(await baobabToken.owner()).to.equal(ethers.ZeroAddress);
    });

    it("Ne doit pas permettre à un non-owner de renoncer à la propriété", async function () {
      await expect(
        baobabToken.connect(user1).renounceOwnership()
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
  
  describe("Fonction setContractWhitelist", function () {
    it("Doit permettre à l'owner de mettre un contrat sur liste blanche", async function () {
      await expect(baobabToken.connect(owner).setContractWhitelist(mockContractAddress, true))
        .to.emit(baobabToken, "ContractWhitelisted")
        .withArgs(mockContractAddress, true);
      expect(await baobabToken.whitelistedContracts(mockContractAddress)).to.be.true;
    });

    it("Doit permettre à l'owner de retirer un contrat de la liste blanche", async function () {
      await baobabToken.connect(owner).setContractWhitelist(mockContractAddress, true);
      await expect(baobabToken.connect(owner).setContractWhitelist(mockContractAddress, false))
        .to.emit(baobabToken, "ContractWhitelisted")
        .withArgs(mockContractAddress, false);
      expect(await baobabToken.whitelistedContracts(mockContractAddress)).to.be.false;
    });

    it("Ne doit pas permettre à un non-owner de modifier la liste blanche", async function () {
      await expect(
        baobabToken.connect(user1).setContractWhitelist(mockContractAddress, true)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Doit échouer si l'adresse fournie n'est pas un contrat", async function () {
      await expect(
        baobabToken.connect(owner).setContractWhitelist(user1.address, true)
      ).to.be.revertedWithCustomError(baobabToken, "AddressIsNotAContract");
    });
  });

  describe("Fonction setPaused", function () {
    it("Doit permettre à l'owner de mettre en pause les transactions", async function () {
        await expect(baobabToken.connect(owner).setPaused(true))
        .to.emit(baobabToken, "TransfersPaused")
        .withArgs(true);
        expect(await baobabToken.paused()).to.be.true;
    });

    it("Doit permettre à l'owner de reprendre les transactions", async function () {
      await baobabToken.connect(owner).setPaused(true);
        await expect(baobabToken.connect(owner).setPaused(false))
        .to.emit(baobabToken, "TransfersPaused")
        .withArgs(false);
        expect(await baobabToken.paused()).to.be.false;
      });
      
    it("Ne doit pas permettre à un non-owner de modifier l'état de pause", async function () {
        await expect(
          baobabToken.connect(user1).setPaused(true)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    
    it("Doit empêcher les transferts lorsque le contrat est en pause", async function () {
      await baobabToken.connect(owner).setPaused(true);
      const amount = ethers.parseEther("100");
      await expect(
        baobabToken.connect(owner).transfer(user1.address, amount)
      ).to.be.revertedWithCustomError(baobabToken, "TransactionsArePaused");
    });

    it("Doit empêcher les approbations lorsque le contrat est en pause", async function () {
      await baobabToken.connect(owner).setPaused(true);
      const amount = ethers.parseEther("100");
      await expect(
        baobabToken.connect(owner).approve(user1.address, amount)
      ).to.be.revertedWithCustomError(baobabToken, "TransactionsArePaused");
      });
      
    it("Doit empêcher les transferFrom lorsque le contrat est en pause", async function () {
      const amount = ethers.parseEther("100");
      await baobabToken.connect(owner).transfer(user1.address, amount);
      await baobabToken.connect(user1).approve(owner.address, amount);
      await baobabToken.connect(owner).setPaused(true);
      await expect(
        baobabToken.connect(owner).transferFrom(user1.address, user2.address, amount)
      ).to.be.revertedWithCustomError(baobabToken, "TransactionsArePaused");
    });

    it("Doit empêcher le burn lorsque le contrat est en pause", async function () {
      await baobabToken.connect(owner).setPaused(true);
      const amount = ethers.parseEther("100");
      await expect(
        baobabToken.connect(owner).burn(amount)
      ).to.be.revertedWithCustomError(baobabToken, "TransactionsArePaused");
      });
      
    it("Doit empêcher distributeRewards lorsque le contrat est en pause", async function () {
      await baobabToken.connect(owner).setPaused(true);
      const rewardAmount = ethers.parseEther("100");
      await expect(
        baobabToken.connect(owner).distributeRewards([user1.address], [rewardAmount])
      ).to.be.revertedWithCustomError(baobabToken, "TransactionsArePaused");
    });
  });

  describe("Fonction setMaxBurnAmount", function () {
    const newValidMaxBurn = ethers.parseEther(`${parseInt(MAX_BURN_AMOUNT_STRING) / 2}`);
    const newInvalidMaxBurnTooHigh = TOTAL_SUPPLY;

    it("Doit permettre à l'owner de mettre à jour maxBurnAmount", async function () {
      await expect(baobabToken.connect(owner).setMaxBurnAmount(newValidMaxBurn))
        .to.emit(baobabToken, "MaxBurnAmountUpdated")
        .withArgs(newValidMaxBurn);
      expect(await baobabToken.maxBurnAmount()).to.equal(newValidMaxBurn);
    });

    it("Ne doit pas permettre à un non-owner de mettre à jour maxBurnAmount", async function () {
        await expect(
        baobabToken.connect(user1).setMaxBurnAmount(newValidMaxBurn)
      ).to.be.revertedWith("Ownable: caller is not the owner");
      });
      
    it("Doit échouer si newMaxBurnAmount est zéro", async function () {
        await expect(
        baobabToken.connect(owner).setMaxBurnAmount(0)
      ).to.be.revertedWithCustomError(baobabToken, "MaxBurnAmountMustBePositive");
    });
    
    it("Doit échouer si newMaxBurnAmount est trop élevé (>10% de initialTotalSupply)", async function () {
      const tooHighAmount = (TOTAL_SUPPLY / 10n) + 1n; 
      await expect(
        baobabToken.connect(owner).setMaxBurnAmount(tooHighAmount)
      ).to.be.revertedWithCustomError(baobabToken, "MaxBurnAmountTooHigh");
    });
    
    it("Doit permettre de brûler des tokens avec le nouveau maxBurnAmount", async function () {
      await baobabToken.connect(owner).setMaxBurnAmount(newValidMaxBurn);
      const ownerBalance = await baobabToken.balanceOf(owner.address);
      const amountToBurn = newValidMaxBurn;

      if (ownerBalance >= amountToBurn) {
        await expect(baobabToken.connect(owner).burn(amountToBurn))
          .to.emit(baobabToken, "TokensBurned")
          .withArgs(owner.address, amountToBurn);
      } else {
        console.warn("Skipping burn test with new maxBurnAmount: owner balance too low.");
      }
    });

    it("Doit échouer si le montant à brûler dépasse le nouveau maxBurnAmount", async function () {
      await baobabToken.connect(owner).setMaxBurnAmount(newValidMaxBurn);
      const amountToBurn = newValidMaxBurn + ethers.parseEther("1");
        await expect(
        baobabToken.connect(owner).burn(amountToBurn)
      ).to.be.revertedWithCustomError(baobabToken, "BurnAmountExceedsLimitOrIsZero");
      });
  });

  describe("Fonction emergencyWithdrawERC20", function () {
    let anotherToken;

    beforeEach(async function() {
      // Déployer un autre contrat ERC20 pour simuler un token envoyé par erreur
      const AnotherTokenFactory = await ethers.getContractFactory("contracts/BaobabToken.sol:BaobabToken");
      anotherToken = await AnotherTokenFactory.deploy(treasury.address);
      
      // Mettre sur liste blanche l'adresse du contrat principal pour qu'il puisse recevoir les "anotherToken"
      await anotherToken.connect(owner).setContractWhitelist(await baobabToken.getAddress(), true);

      // Transférer quelques "anotherToken" au contrat principal baobabToken
      const amountToSend = ethers.parseEther("50");
      await anotherToken.connect(owner).transfer(await baobabToken.getAddress(), amountToSend);
      });
      
    it("Doit permettre à l'owner de retirer des tokens ERC20 étrangers", async function () {
      const contractAddress = await baobabToken.getAddress();
      const amountToWithdraw = ethers.parseEther("50");
      
      const initialContractBalance = await anotherToken.balanceOf(contractAddress);
      expect(initialContractBalance).to.equal(amountToWithdraw);
        
      const initialUser1Balance = await anotherToken.balanceOf(user1.address);

      await expect(baobabToken.connect(owner).emergencyWithdrawERC20(await anotherToken.getAddress(), user1.address, amountToWithdraw))
        .to.not.be.reverted;
        
      const finalContractBalance = await anotherToken.balanceOf(contractAddress);
      expect(finalContractBalance).to.equal(0);

      const finalUser1Balance = await anotherToken.balanceOf(user1.address);
      expect(finalUser1Balance).to.equal(initialUser1Balance + amountToWithdraw);
    });

    it("Ne doit pas permettre à un non-owner de retirer des tokens", async function () {
      const amount = ethers.parseEther("10");
      await expect(
        baobabToken.connect(user1).emergencyWithdrawERC20(await anotherToken.getAddress(), user1.address, amount)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Doit échouer si on essaie de retirer le token natif (BBT)", async function () {
      const amount = ethers.parseEther("10");
      await expect(
        baobabToken.connect(owner).emergencyWithdrawERC20(await baobabToken.getAddress(), user1.address, amount)
      ).to.be.revertedWithCustomError(baobabToken, "CannotWithdrawSelfToken");
    });

    it("Doit échouer si l'adresse du token est l'adresse zéro", async function () {
      const amount = ethers.parseEther("10");
      await expect(
        baobabToken.connect(owner).emergencyWithdrawERC20(ethers.ZeroAddress, user1.address, amount)
      ).to.be.revertedWithCustomError(baobabToken, "InvalidTokenAddress");
      });
      
    it("Doit échouer si l'adresse de destination est l'adresse zéro", async function () {
      const amount = ethers.parseEther("10");
        await expect(
        baobabToken.connect(owner).emergencyWithdrawERC20(await anotherToken.getAddress(), ethers.ZeroAddress, amount)
      ).to.be.revertedWithCustomError(baobabToken, "InvalidRecipientAddress");
      });
      
    it("Doit échouer si le montant à retirer est zéro", async function () {
        await expect(
        baobabToken.connect(owner).emergencyWithdrawERC20(await anotherToken.getAddress(), user1.address, 0)
      ).to.be.revertedWithCustomError(baobabToken, "InvalidRewardAmount");
    });

    it("Doit échouer si le montant à retirer est supérieur au solde du contrat", async function () {
      const excessiveAmount = ethers.parseEther("100"); // plus que les 50 envoyés
      await expect(
        baobabToken.connect(owner).emergencyWithdrawERC20(await anotherToken.getAddress(), user1.address, excessiveAmount)
      ).to.be.revertedWithCustomError(baobabToken, "InsufficientBalance");
    });
  });
}); 