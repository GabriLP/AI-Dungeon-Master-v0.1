/* AI manager module */

import { AI_CONFIG } from './config.js';

export class AIService {
  constructor() {
    this.apiEndpoint = AI_CONFIG.ENDPOINT;
    this.apiKey = AI_CONFIG.API_KEY;
    this.conversationHistory = [];
    this.gameState = {
      environment: "tavern",  // TODO: Dynamically change the environment
      npcPresent: [],
      enemiesPresent: [],
      quests: [],
      inventory: []
    };
  }

  initializeGameState(character) {
    // Add character information to the game state
    this.gameState.character = {
      name: character.name || "Adventurer",
      class: character.class || "Fighter",
      race: character.race || "Human",
      level: character.level || 1,
      ac: character.ac,
      maxHP: character.maxHP,
      currentHP: character.currentHP
    };
    
    // Initialize a new conversation with the character setup
    this.conversationHistory = [];
    
    // Return the initial DM response
    return this.startAdventure();
  }

  async startAdventure() {
    const initialPrompt = `You are a Dungeon Master in a fantasy roleplaying game. 
    The player character is a ${this.gameState.character.race} ${this.gameState.character.class} named ${this.gameState.character.name}.
    
    Start the adventure in a tavern. Describe the scene and introduce a simple quest or adventure hook.
    
    Keep your responses concise (3-5 sentences). When describing combat, include attack rolls in the format (Attack: X) where X is a number between 1-20.`;
    
    return this.getAIResponse(initialPrompt, true);
  }

  async getAIResponse(userMessage, isSystemMessage = false) {
    try {
      // Prepare the messages array for the API call
      let messages = [
        { 
          role: "system", 
          content: `You are an experienced Dungeon Master running a fantasy roleplaying game. 
          
          IMPORTANT GAME MECHANICS:
          - The player character is a ${this.gameState.character?.race || "Human"} ${this.gameState.character?.class || "Fighter"} named ${this.gameState.character?.name || "Adventurer"}.
          - Player AC: ${this.gameState.character?.ac || 14}
          - Player HP: ${this.gameState.character?.currentHP || 30}/${this.gameState.character?.maxHP || 30}
          
          YOUR ROLE AS DM:
          - Narrate the game world and NPCs' actions/dialogue in a descriptive, engaging style.
          - Create an immersive fantasy world with interesting characters and scenarios.
          - Balance combat, exploration, and social interaction.
          - Only respond as the DM, not as the player character.
          
          FORMATTING RULES:
          - Keep responses concise (3-5 sentences).
          - When monsters or NPCs attack, include attack rolls in the format (Attack: X) where X is a number between 1-20.
          - Describe the environment and NPCs' reactions to the player's actions.
          - Parse dice rolls in the format (1d20+3) and provide the result.
          
          GAMEPLAY TIPS:
          - Introduce challenges appropriate for a level ${this.gameState.character?.level || 1} character.
          - Reward creative problem-solving.
          - Maintain a consistent tone and world logic.
          - Provide clear consequences for player actions.
          
          Current game state: The player is in ${this.gameState.environment}.
          Player health: ${this.gameState.character?.currentHP || 30}/${this.gameState.character?.maxHP || 30}`
        }
      ];
      
      // Conversation history to maintain context
      if (this.conversationHistory.length > 0) {
        messages = [...messages, ...this.conversationHistory];
      }
      
      // Add the current user message
      if (!isSystemMessage) {
        this.conversationHistory.push({ role: "user", content: userMessage });
        messages.push({ role: "user", content: userMessage });
      } else {
        messages.push({ role: "system", content: userMessage });
      }
      
      // Limit the conversation history to prevent token limit issues,
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }

      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: AI_CONFIG.MODEL,
          messages: messages
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const responseData = await response.json();
      const aiMessage = responseData.choices[0].message.content;
      
      // Add the AI response to the conversation history
      this.conversationHistory.push({ role: "assistant", content: aiMessage });
      
      // Update game state based on AI response
      this.updateGameState(aiMessage);
      
      return responseData;
    } catch (error) {
      console.error('AI Service Error:', error);
      return { 
        choices: [{ 
          message: { 
            content: "The Dungeon Master seems to be taking a short break. Please try again in a moment." 
          } 
        }] 
      };
    }
  }
  
  updateGameState(aiMessage) {
    // Parse the AI message for key information to update the game state
    // We can expand this with the help of AI
    
    // Check for environment changes
    const environmentRegex = /you (?:are|find yourself) (?:in|at) the (\w+)/i;
    const environmentMatch = aiMessage.match(environmentRegex);
    if (environmentMatch) {
      this.gameState.environment = environmentMatch[1].toLowerCase();
    }
    
    // Check for NPC introductions
    const npcRegex = /(\w+) (?:approaches|enters|appears|greets)/i;
    const npcMatch = aiMessage.match(npcRegex);
    if (npcMatch && !this.gameState.npcPresent.includes(npcMatch[1])) {
      this.gameState.npcPresent.push(npcMatch[1]);
    }
    
    // Check for enemy introductions
    const enemyRegex = /(?:a|an) (\w+ \w+|\w+) attacks|(?:a|an) (\w+ \w+|\w+) appears/i;
    const enemyMatch = aiMessage.match(enemyRegex);
    if (enemyMatch) {
      const enemy = enemyMatch[1] || enemyMatch[2];
      if (enemy && !this.gameState.enemiesPresent.includes(enemy)) {
        this.gameState.enemiesPresent.push(enemy);
      }
    }
    
    // Check for quest offers
    const questRegex = /(?:quest|mission|task).*?to (\w+.*?)(\.|\?)/i;
    const questMatch = aiMessage.match(questRegex);
    if (questMatch && !this.gameState.quests.some(q => q.includes(questMatch[1]))) {
      this.gameState.quests.push(questMatch[1]);
    }
  }
}