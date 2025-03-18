/* Character Manager module */

import { DEFAULT_CHARACTER } from './defaultCharacter.js';

export class CharacterManager {
  constructor() {
    this.character = null;
    this.characters = this.loadCharacters();
  }

  initializeCharacter() {
    // Check if there's a selected character in localStorage
    const selectedCharacterId = localStorage.getItem('selectedCharacterId');
    if (selectedCharacterId) {
      this.loadCharacter(selectedCharacterId);
    } else {
      // If no selected character, use the default character
      this.character = { ...DEFAULT_CHARACTER, name: "Adventurer", class: "Fighter", race: "Human", level: 1 };
    }
    
    // Update the UI with character information
    this.updateCharacterDisplay();
    
    return this.character;
  }
  
  loadCharacters() {
    // Get characters from localStorage
    const charactersJson = localStorage.getItem('characters');
    return charactersJson ? JSON.parse(charactersJson) : [];
  }
  
  saveCharacters() {
    // Save characters to localStorage
    localStorage.setItem('characters', JSON.stringify(this.characters));
  }
  
  loadCharacter(characterId) {
    // Find the character with the given ID
    const character = this.characters.find(c => c.id === characterId);
    if (character) {
      this.character = character;
      return character;
    }
    return null;
  }
  
  updateCharacter(updates) {
    // Update the current character with new properties
    if (!this.character) return;
    
    this.character = { ...this.character, ...updates };
    
    // Update the character in the characters array
    const index = this.characters.findIndex(c => c.id === this.character.id);
    if (index !== -1) {
      this.characters[index] = this.character;
      this.saveCharacters();
    }
    
    // Update the UI
    this.updateCharacterDisplay();
    
    return this.character;
  }
  
  updateCharacterDisplay() {
    // Update the character sheet display
    if (!this.character) return;
    
    const nameElement = document.getElementById('character-name');
    const classElement = document.getElementById('character-class');
    const raceElement = document.getElementById('character-race');
    const levelElement = document.getElementById('character-level');
    const hpElement = document.getElementById('character-hp');
    const acElement = document.getElementById('character-ac');
    const statusElement = document.getElementById('character-status');
    
    if (nameElement) nameElement.textContent = this.character.name;
    if (classElement) classElement.textContent = this.character.class;
    if (raceElement) raceElement.textContent = this.character.race;
    if (levelElement) levelElement.textContent = this.character.level;
    if (hpElement) hpElement.textContent = `${this.character.currentHP}/${this.character.maxHP}`;
    if (acElement) acElement.textContent = this.character.ac;
    
    if (statusElement) {
      statusElement.textContent = this.character.status;
      
      // Clear previous status classes
      statusElement.classList.remove('critical', 'wounded');
      
      // Add appropriate status class
      if (this.character.status === 'Critical') {
        statusElement.classList.add('critical');
      } else if (this.character.status === 'Wounded') {
        statusElement.classList.add('wounded');
      }
    }
  }
  
  createCharacter(characterData) {
    // Generate a unique ID for the new character
    const id = Date.now().toString();
    
    // Create a new character with default values and user-provided data
    const newCharacter = {
      id,
      name: characterData.name || "Adventurer",
      class: characterData.class || "Fighter",
      race: characterData.race || "Human",
      level: characterData.level || 1,
      ac: characterData.ac || DEFAULT_CHARACTER.ac,
      maxHP: characterData.maxHP || DEFAULT_CHARACTER.maxHP,
      currentHP: characterData.maxHP || DEFAULT_CHARACTER.maxHP,
      status: "Healthy"
    };
    
    // Add the new character to the characters array
    this.characters.push(newCharacter);
    this.saveCharacters();
    
    return newCharacter;
  }
  
  deleteCharacter(characterId) {
    // Remove the character with the given ID
    const index = this.characters.findIndex(c => c.id === characterId);
    if (index !== -1) {
      this.characters.splice(index, 1);
      this.saveCharacters();
      return true;
    }
    return false;
  }
  
  selectCharacter(characterId) {
    // Set the selected character ID in localStorage
    localStorage.setItem('selectedCharacterId', characterId);
    
    // Load the character
    return this.loadCharacter(characterId);
  }
  
  resetCharacter() {
    // Reset the current character to full health
    if (!this.character) return;
    
    this.updateCharacter({
      currentHP: this.character.maxHP,
      status: "Healthy"
    });
    
    return this.character;
  }
}