/* AI manager module */

import { AI_CONFIG } from "./config.js";

export class AIService {
  constructor() {
    this.apiEndpoint = AI_CONFIG.ENDPOINT;
    this.apiKey = null;
    this.conversationHistory = [];
    this.gameState = {
      environment: "tavern", // TODO: Dynamically change the environment
      npcPresent: [],
      enemiesPresent: [],
      quests: [],
      inventory: [],
    };

    this.initialize();
  }

  async initialize() {
    try {
      // Use the API key from environment or config
      this.apiKey = AI_CONFIG.API_KEY || import.meta.env.API_KEY;

      if (!this.apiKey) {
        console.error("API key is not configured");
        throw new Error("Missing API key");
      }

      console.log("API configuration loaded");
    } catch (error) {
      console.error("Failed to load API configuration:", error);
    }
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
      currentHP: character.currentHP,
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

  /* 
  // getAIResponse is set up for Gemini AI.
  // For other AIs a different configuration may be required.
  */

  async getAIResponse(userMessage, isSystemMessage = false) {
    if (!this.apiKey) {
      try {
        console.log("API key not loaded yet, initializing...");
        await this.initialize();
        if (!this.apiKey) {
          console.error("API key still not available after initialization");
          throw new Error("Failed to load API key");
        }
      } catch (error) {
        console.error("API key initialization failed:", error);
        return {
          choices: [
            {
              message: {
                content:
                  "Could not connect to the Dungeon Master. Please check your API configuration.",
              },
            },
          ],
        };
      }
    }
    try {
      // Format the system message and conversation history
      let systemPrompt = `You are an experienced Dungeon Master running a fantasy roleplaying game. 
        
      IMPORTANT GAME MECHANICS:
      - The player character is a ${
        this.gameState.character?.race || "Human"
      } ${this.gameState.character?.class || "Fighter"} named ${
        this.gameState.character?.name || "Adventurer"
      }.
      - Player AC: ${this.gameState.character?.ac || 14}
      - Player HP: ${this.gameState.character?.currentHP || 30}/${
        this.gameState.character?.maxHP || 30
      }
      
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
      - Introduce challenges appropriate for a level ${
        this.gameState.character?.level || 1
      } character.
      - Reward creative problem-solving.
      - Maintain a consistent tone and world logic.
      - Provide clear consequences for player actions.
      
      Current game state: The player is in ${this.gameState.environment}.
      Player health: ${this.gameState.character?.currentHP || 30}/${
        this.gameState.character?.maxHP || 30
      }`;

      // Format the conversation history for Gemini
      let conversationContent = this.conversationHistory
        .map((msg) => {
          if (msg.role === "user") {
            return `Player: ${msg.content}`;
          } else if (msg.role === "assistant") {
            return `DM: ${msg.content}`;
          }
          return `${msg.role}: ${msg.content}`;
        })
        .join("\n\n");

      // Add the current message
      let currentMessage = isSystemMessage
        ? userMessage
        : `Player: ${userMessage}`;

      // Combine everything into the full prompt
      let fullPrompt = `${systemPrompt}\n\n${
        conversationContent ? conversationContent + "\n\n" : ""
      }${currentMessage}\n\nDM:`;

      // Set up the request body for Gemini API
      const requestBody = {
        contents: [
          {
            parts: [{ text: fullPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024,
        },
      };

      // Add API key as query parameter
      const apiUrl = `${this.apiEndpoint}?key=${this.apiKey}`;

      const response = await fetch("api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, details: ${errorText}`
        );
      }

      const responseData = await response.json();

      // Extract the AI message from Gemini's response format
      const aiMessage =
        responseData.candidates?.[0]?.content?.parts?.[0]?.text ||
        "The Dungeon Master is silent for a moment.";

      // Add the AI response to the conversation history
      if (!isSystemMessage) {
        this.conversationHistory.push({ role: "user", content: userMessage });
      }
      this.conversationHistory.push({ role: "assistant", content: aiMessage });

      // Limit the conversation history to prevent token limit issues
      if (this.conversationHistory.length > 10) {
        this.conversationHistory = this.conversationHistory.slice(-10);
      }

      // Update game state based on AI response
      this.updateGameState(aiMessage);

      // Return in a format compatible with the rest of your code
      return {
        choices: [
          {
            message: {
              content: aiMessage,
            },
          },
        ],
      };
    } catch (error) {
      console.error("AI Service Error:", error);
      return {
        choices: [
          {
            message: {
              content:
                "The Dungeon Master seems to be taking a short break. Please try again in a moment.",
            },
          },
        ],
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
    const enemyRegex =
      /(?:a|an) (\w+ \w+|\w+) attacks|(?:a|an) (\w+ \w+|\w+) appears/i;
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
    if (
      questMatch &&
      !this.gameState.quests.some((q) => q.includes(questMatch[1]))
    ) {
      this.gameState.quests.push(questMatch[1]);
    }
  }
}
