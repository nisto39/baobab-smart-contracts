// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

// Custom Errors
error InvalidTreasuryAddress();
error TreasuryChangeTooSoon();
error TransfersToContractsRestricted();
error InsufficientBalance();
error AllowanceExceeded();
error BurnAmountExceedsLimitOrIsZero();
error TotalBurnLimitExceeded();
error TransactionsArePaused();
error ArraysLengthMismatch();
error RecipientsListIsEmpty();
error InvalidRewardAmount();
error RewardsToContractsNotAllowed();
error AddressIsNotAContract();
error MaxBurnAmountMustBePositive();
error MaxBurnAmountTooHigh();
error CannotWithdrawSelfToken();
error InvalidTokenAddress();
error InvalidRecipientAddress();

/**
 * @title BaobabToken
 * @dev Implémentation du token Baobab (BBT) avec fonctionnalités de sécurité
 * et mécanismes de gestion des récompenses.
 */
contract BaobabToken is IERC20, ReentrancyGuard, Ownable {
    using Address for address;

    // Métadonnées du token
    string public name = "Baobab Token";
    string public symbol = "BBT";
    uint8 public decimals = 18;
    uint256 private _totalSupply;
    uint256 public maxBurnAmount = 50000 * 10 ** uint256(decimals);
    uint256 public totalBurned;
    uint256 public immutable INITIAL_TOTAL_SUPPLY;

    // Adresse du trésor
    address public treasury;
    
    // Liste blanche pour les contrats autorisés à recevoir des tokens
    mapping(address => bool) public whitelistedContracts;
    
    // Indicateur de pause des transactions (pour situations d'urgence)
    bool public paused;
    
    // Délai de protection entre les changements de trésorerie (en secondes)
    uint256 public constant TREASURY_CHANGE_DELAY = 2 days;
    uint256 public lastTreasuryChangeTime;

    // Mappings principaux
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    // Événements
    event RewardSent(address indexed to, uint256 amount);
    event TreasuryUpdated(address indexed newTreasury);
    event TokensBurned(address indexed from, uint256 amount);
    event OwnershipRenounced();
    event ContractWhitelisted(address indexed contractAddress, bool status);
    event TransfersPaused(bool paused);
    event MaxBurnAmountUpdated(uint256 newMaxBurnAmount);

    /**
     * @dev Empêche les transactions si le contrat est en pause
     */
    modifier whenNotPaused() {
        if (paused) revert TransactionsArePaused();
        _;
    }

    /**
     * @dev Constructeur du contrat
     * @param _treasury L'adresse du trésor initial
     */
    constructor(address _treasury) {
        if (_treasury == address(0)) revert InvalidTreasuryAddress();

        _transferOwnership(msg.sender);
        
        uint256 localTotalSupply = 500000000 * 10 ** uint256(decimals);
        _totalSupply = localTotalSupply;
        INITIAL_TOTAL_SUPPLY = localTotalSupply;

        treasury = _treasury;
        lastTreasuryChangeTime = block.timestamp;

        uint256 treasuryAmount = (_totalSupply * 30) / 100;
        _balances[treasury] = treasuryAmount;
        _balances[msg.sender] = _totalSupply - treasuryAmount;

        emit Transfer(address(0), treasury, treasuryAmount);
        emit Transfer(address(0), msg.sender, _totalSupply - treasuryAmount);
    }

    /**
     * @dev Retourne le montant total de tokens en circulation
     */
    function totalSupply() external view override returns (uint256) {
        return _totalSupply;
    }

    /**
     * @dev Retourne le solde de tokens d'un compte
     * @param account L'adresse du compte à vérifier
     */
    function balanceOf(address account) external view override returns (uint256) {
        return _balances[account];
    }

    /**
     * @dev Transfère un montant de tokens à un destinataire
     * @param recipient L'adresse du destinataire
     * @param amount Le montant à transférer
     */
    function transfer(address recipient, uint256 amount) external override nonReentrant whenNotPaused returns (bool) {
        if (_balances[msg.sender] < amount) revert InsufficientBalance();
        if (recipient.isContract() && !whitelistedContracts[recipient]) revert TransfersToContractsRestricted();

        _balances[msg.sender] -= amount;
        _balances[recipient] += amount;
        emit Transfer(msg.sender, recipient, amount);
        return true;
    }

    /**
     * @dev Retourne le montant que le spender est autorisé à dépenser au nom du owner
     * @param _owner L'adresse du propriétaire
     * @param spender L'adresse du spender
     */
    function allowance(address _owner, address spender) external view override returns (uint256) {
        return _allowances[_owner][spender];
    }

    /**
     * @dev Approuve un spender à dépenser un montant au nom du sender
     * @param spender L'adresse du spender
     * @param amount Le montant approuvé
     */
    function approve(address spender, uint256 amount) external override nonReentrant whenNotPaused returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    /**
     * @dev Transfère des tokens d'un sender à un recipient en utilisant le mécanisme d'approbation
     * @param sender L'adresse source
     * @param recipient L'adresse destination
     * @param amount Le montant à transférer
     */
    function transferFrom(address sender, address recipient, uint256 amount) external override nonReentrant whenNotPaused returns (bool) {
        if (_balances[sender] < amount) revert InsufficientBalance();
        if (_allowances[sender][msg.sender] < amount) revert AllowanceExceeded();
        if (recipient.isContract() && !whitelistedContracts[recipient]) revert TransfersToContractsRestricted();

        _balances[sender] -= amount;
        _balances[recipient] += amount;
        _allowances[sender][msg.sender] -= amount;

        emit Transfer(sender, recipient, amount);
        return true;
    }

    /**
     * @dev Brûle des tokens du sender
     * @param amount Le montant à brûler
     */
    function burn(uint256 amount) external nonReentrant whenNotPaused {
        if (amount == 0 || amount > maxBurnAmount) revert BurnAmountExceedsLimitOrIsZero();
        if (_balances[msg.sender] < amount) revert InsufficientBalance();
        if (totalBurned + amount > INITIAL_TOTAL_SUPPLY / 2) revert TotalBurnLimitExceeded();

        _balances[msg.sender] -= amount;
        _totalSupply -= amount;
        totalBurned += amount;

        emit TokensBurned(msg.sender, amount);
        emit Transfer(msg.sender, address(0), amount);
    }

    /**
     * @dev Met à jour l'adresse du trésor
     * @param _newTreasury La nouvelle adresse du trésor
     */
    function updateTreasury(address _newTreasury) external onlyOwner {
        if (_newTreasury == address(0)) revert InvalidTreasuryAddress();
        if (block.timestamp < lastTreasuryChangeTime + TREASURY_CHANGE_DELAY) revert TreasuryChangeTooSoon();

        treasury = _newTreasury;
        lastTreasuryChangeTime = block.timestamp;
        emit TreasuryUpdated(_newTreasury);
    }

    /**
     * @dev Distribue des récompenses à des adresses multiples
     * @param recipients Tableau des adresses destinataires
     * @param amounts Tableau des montants correspondants
     */
    function distributeRewards(address[] calldata recipients, uint256[] calldata amounts) external onlyOwner nonReentrant whenNotPaused {
        if (recipients.length != amounts.length) revert ArraysLengthMismatch();
        if (recipients.length == 0) revert RecipientsListIsEmpty();

        uint256 totalAmount = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            if (amounts[i] == 0) revert InvalidRewardAmount();
            if (recipients[i].isContract() && !whitelistedContracts[recipients[i]]) revert RewardsToContractsNotAllowed();
            totalAmount += amounts[i];
        }
        if (_balances[treasury] < totalAmount) revert InsufficientBalance();

        for (uint256 i = 0; i < recipients.length; i++) {
            _balances[treasury] -= amounts[i];
            _balances[recipients[i]] += amounts[i];

            emit RewardSent(recipients[i], amounts[i]);
            emit Transfer(treasury, recipients[i], amounts[i]);
        }
    }

    /**
     * @dev Renonce à la propriété
     */
    function renounceOwnership() public virtual override onlyOwner {
        _transferOwnership(address(0));
        emit OwnershipRenounced();
    }
    
    /**
     * @dev Ajoute ou supprime un contrat de la liste blanche
     * @param contractAddr L'adresse du contrat
     * @param status Statut d'autorisation
     */
    function setContractWhitelist(address contractAddr, bool status) external onlyOwner {
        if (!contractAddr.isContract()) revert AddressIsNotAContract();
        whitelistedContracts[contractAddr] = status;
        emit ContractWhitelisted(contractAddr, status);
    }
    
    /**
     * @dev Met en pause ou reprend les transactions
     * @param _paused Nouvel état de pause
     */
    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit TransfersPaused(_paused);
    }
    
    /**
     * @dev Met à jour le montant maximal de tokens pouvant être brûlés en une seule transaction.
     *      Permet également de définir la limite initiale lors du déploiement si nécessaire.
     * @param newMaxBurnAmount Le nouveau montant maximal pour le burn.
     */
    function setMaxBurnAmount(uint256 newMaxBurnAmount) external onlyOwner {
        if (newMaxBurnAmount == 0) revert MaxBurnAmountMustBePositive();
        if (newMaxBurnAmount * 10 > INITIAL_TOTAL_SUPPLY) revert MaxBurnAmountTooHigh(); 
        maxBurnAmount = newMaxBurnAmount;
        emit MaxBurnAmountUpdated(newMaxBurnAmount);
    }

    /**
     * @dev Allows the owner to withdraw other ERC20 tokens sent to this contract by mistake.
     * @param tokenContract The address of the ERC20 token to withdraw.
     * @param to The address to send the withdrawn tokens to.
     * @param amount The amount of tokens to withdraw.
     */
    function emergencyWithdrawERC20(address tokenContract, address to, uint256 amount) external onlyOwner {
        if (tokenContract == address(this)) revert CannotWithdrawSelfToken();
        if (tokenContract == address(0)) revert InvalidTokenAddress();
        if (to == address(0)) revert InvalidRecipientAddress();
        
        uint256 balance = IERC20(tokenContract).balanceOf(address(this));
        if (amount > balance) revert InsufficientBalance();
        if (amount == 0) revert InvalidRewardAmount(); // Reuse of error, amount must be > 0
        
        IERC20(tokenContract).transfer(to, amount);
    }
}
