/* Main program */

import { CharacterManager } from './characterManager.js';
import { CombatSystem } from './combatSystem.js';
import { ViewManager } from './viewManager.js';
import { AIService } from './aiService.js';

export class GameApp {
  constructor() {
    this.characterManager = new CharacterManager();
    this.aiService = new AIService();

    console.log('AI Initialized: ', this.aiService);  // Log AI initialization
    console.log('Character Manager Initialized');

    this.gameInProgress = false;
    this.loadingIndicator = null;
    
    // Initialize 
    this.initializeEventListeners();
    this.setupUI();
  }

  setupUI() {
    // Check if this is the main game page
    if (document.getElementById('game-container')) {
      this.initializeGame();
    }
  }
  
  initializeGame() {
    this.gameInProgress = true;
    this.characterManager.initializeCharacter();

    console.log('character initialized: ', this.characterManager.character);  // Log character initialization
    
    // Initialize the AI with the character information
    ViewManager.showLoading('Starting adventure...');
    this.aiService.initializeGameState(this.characterManager.character)
      .then(response => {
        ViewManager.hideLoading();
        if (response) {
          const aiMessage = response.choices[0].message.content;
          ViewManager.appendMessage('Dungeon Master', aiMessage);
          
          // Process any combat in the initial message
          const attackValue = CombatSystem.parseAttackValue(aiMessage);
          if (attackValue) {
            this.handleCombat(attackValue, aiMessage);
          }
        }
      })
      .catch(error => {
        ViewManager.hideLoading();
        ViewManager.appendMessage('System', 'Failed to start adventure. Please try again.');
        console.error('Game initialization error:', error);
      });
  }

  initializeEventListeners() {
    // Check if we're on a page with the game UI
    const sendButton = document.getElementById('send-button');
    const inputBox = document.getElementById('input-box');

    // Log the buttons
    console.log('Send Button: ', sendButton);
    console.log('Input Box: ', inputBox);
    
    if (sendButton && inputBox) {
      sendButton.addEventListener('click', () => this.handleUserInput());
      inputBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') this.handleUserInput();
      });
    }
    
    // Add other event listeners as needed
    const startButton = document.getElementById('start-adventure');
    if (startButton) {
      startButton.addEventListener('click', () => this.navigateToGame());
    }
    
    // Add event listener for healing potion button
    const healButton = document.getElementById('heal-button');
    if (healButton) {
      healButton.addEventListener('click', () => this.useHealingPotion());
    }
  }
  
  navigateToGame() {
    window.location.href = 'main-page.html';
  }
  
  // TODO: Add button for this and other common actions
  useHealingPotion() {
    const currentCharacter = this.characterManager.character;
    
    if (currentCharacter.currentHP < currentCharacter.maxHP) {
      const healAmount = Math.min(10, currentCharacter.maxHP - currentCharacter.currentHP);
      this.characterManager.updateCharacter({
        currentHP: currentCharacter.currentHP + healAmount
      });
      
      ViewManager.appendMessage('System', `You drink a healing potion and recover ${healAmount} HP.`);
      
      // Also inform the AI about this action
      this.aiService.getAIResponse(`I drink a healing potion and recover ${healAmount} HP.`)
        .then(response => {
          if (response) {
            const aiMessage = response.choices[0].message.content;
            ViewManager.appendMessage('Dungeon Master', aiMessage);
          }
        });
    } else {
      ViewManager.appendMessage('System', 'You are already at full health.');
    }
  }

  async handleUserInput() {
    const inputBox = document.getElementById('input-box');
    const userMessage = inputBox.value.trim();
    
    if (!userMessage) return;

    ViewManager.appendMessage('You', userMessage);
    ViewManager.clearInput();
    ViewManager.showLoading();

    try {
      const response = await this.aiService.getAIResponse(userMessage);
      ViewManager.hideLoading();
      
      if (!response) {
        ViewManager.appendMessage('System', 'Failed to get a response from the Dungeon Master');
        return;
      }

      const aiMessage = response.choices[0].message.content;
      
      // Process combat if an attack roll is present
      const attackValue = CombatSystem.parseAttackValue(aiMessage);
      if (attackValue) {
        this.handleCombat(attackValue, aiMessage);
      } else {
        ViewManager.appendMessage('Dungeon Master', aiMessage);
      }

      // Handle damage mentioned by AI
      const damageInfo = CombatSystem.parseDamageInfo(aiMessage);
      if (damageInfo.damage || damageInfo.currentHP) {
        // If there is an explicit HP value, use it
        if (damageInfo.currentHP !== null) {
          this.characterManager.updateCharacter({
            currentHP: damageInfo.currentHP,
            status: this.getStatusFromHP(damageInfo.currentHP, this.characterManager.character.maxHP)
          });
        } 
        // Otherwise, apply the damage amount
        else if (damageInfo.damage !== null) {
          const currentCharacter = this.characterManager.character;
          const newHP = Math.max(0, currentCharacter.currentHP - damageInfo.damage);
          this.characterManager.updateCharacter({
            currentHP: newHP,
            status: this.getStatusFromHP(newHP, currentCharacter.maxHP)
          });
        }
      }
      
      // Check for game state changes
      this.checkGameState();
    } catch (error) {
      ViewManager.hideLoading();
      ViewManager.appendMessage('System', 'Error processing your action');
      console.error('Application Error:', error);
    }
  }
  
  handleCombat(attackValue, aiMessage) {
    const currentCharacter = this.characterManager.character;
    const combatResult = CombatSystem.resolveAttack(attackValue, currentCharacter);
    
    // Display combat results
    ViewManager.addCombatFeedback(CombatSystem.generateCombatMessage(combatResult));
    
    // Apply damage if hit
    if (combatResult.success) {
      const newHP = Math.max(0, currentCharacter.currentHP - combatResult.damage);
      this.characterManager.updateCharacter({
        currentHP: newHP,
        // Update status based on HP percentage
        status: this.getStatusFromHP(newHP, currentCharacter.maxHP)
      });
      
      // Check for player death
      if (newHP === 0) {
        this.handlePlayerDeath();
      }
    }
    
    // Show the cleaned message without the attack roll
    const cleanMessage = aiMessage.replace(/\(Attack:\s*\d+\)/i, '').trim();
    ViewManager.appendMessage('Dungeon Master', cleanMessage);
  }

  getStatusFromHP(currentHP, maxHP) {
    const hpPercentage = (currentHP / maxHP) * 100;
    if (currentHP === 0) return "Unconscious";
    if (hpPercentage <= 25) return "Critical";
    if (hpPercentage <= 50) return "Wounded";
    if (hpPercentage <= 75) return "Injured";
    return "Healthy";
  }
  
  handlePlayerDeath() {
    ViewManager.appendSystemMessage('You have fallen unconscious!');
    
    // Inform the AI about the player's death
    this.aiService.getAIResponse("I've fallen unconscious at 0 HP.")
      .then(response => {
        if (response) {
          const aiMessage = response.choices[0].message.content;
          ViewManager.appendMessage('Dungeon Master', aiMessage);
          
          // Add a restart option
          ViewManager.showRestartOption(() => this.restartGame());
        }
      });
  }
  
  // TODO: Add button for this and other common actions
  restartGame() {
    // Reset character to default state
    this.characterManager.resetCharacter();
    
    // Clear the conversation history
    this.aiService.conversationHistory = [];
    
    // Clear the output area
    ViewManager.clearOutput();
    
    // Start a new adventure
    this.initializeGame();
  }
  
  checkGameState() {
    // Check for any changes in the game state that require UI updates
    const gameState = this.aiService.gameState;
    
    // Update enemy list if changed
    if (gameState.enemiesPresent.length > 0) {
      ViewManager.updateEnemiesList(gameState.enemiesPresent);
    } else {
      ViewManager.clearEnemiesList();
    }
    // Update NPC list if changed
    if (gameState.npcPresent.length > 0) {
      ViewManager.updateNPCList(gameState.npcPresent);
    }
    
    // Update location display
    ViewManager.updateLocation(gameState.environment);
    
    // Update quest log if needed
    if (gameState.quests.length > 0) {
      ViewManager.updateQuestLog(gameState.quests);
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const app = new GameApp();

});