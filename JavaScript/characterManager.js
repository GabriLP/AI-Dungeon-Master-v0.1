/* Character Manager module */

import { DEFAULT_CHARACTER } from './defaultCharacter.js';

export class CharacterManager {
  constructor() {
    this.character = null;
    this.characters = this.loadCharacters();
  }

  initializeCharacter() {
    // Check if there's new character data from creation page
    const newCharacterData = localStorage.getItem('newCharacterData');

    console.log("Looking for a new character data: ", newCharacterData);
    
    if (newCharacterData) {
      try{
        // Pare the char data
        const characterData = JSON.parse(newCharacterData);

        // create a new char with the data
        this.character = this.createCharacter(characterData);

        // Select him if it exists
        if (this.character && this.character.id){
          this.selectCharacter(this.character.id);
        }

        console.log("Created a new character from data: ", this.character);

        // clear temp character data
        localStorage.removeItem('newCharacterData');
      } catch(error){
          console.error("Error creating character from data:", error);
          // Fall back to default character
          this.character = { ...DEFAULT_CHARACTER, name: "Adventurer", class: "Fighter", race: "Human", level: 1 };
        }
    } else {
      // Check if there's a selected character in localStorage
      const selectedCharacterId = localStorage.getItem('selectedCharacterId');
      if (selectedCharacterId) {
        this.loadCharacter(selectedCharacterId);
      } else {
        // If no selected character, use the default character
        this.character = { ...DEFAULT_CHARACTER, name: "Adventurer", class: "Fighter", race: "Human", level: 1 };
      }
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
    const portraitElement = document.getElementById('character-portrait');
    
    if (nameElement) nameElement.textContent = this.character.name;
    if (classElement) classElement.textContent = this.character.class;
    if (raceElement) raceElement.textContent = this.character.race;
    if (levelElement) levelElement.textContent = this.character.level;
    if (hpElement) hpElement.textContent = `${this.character.currentHP}/${this.character.maxHP}`;
    if (acElement) acElement.textContent = this.character.ac;

    // Update portrait based on character class
    if (portraitElement) {
      const characterClass = this.character.class.toLowerCase();
      portraitElement.src = `../img/${characterClass}_portrait.png`;
      // Fallback if image doesn't exist
      portraitElement.onerror = function() {
        this.src = "../img/fighter_portrait.png";
      };
    }
    
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

    // Update attributes if they exist
    const attributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    attributes.forEach(attr => {
      const element = document.getElementById(`attr-${attr}`);
      if (element && this.character[attr] !== undefined) {
        element.textContent = this.character[attr];
      }
    });
    
    // Update skills if they exist
    if (this.character.skills) {
      const skillElements = {
        acrobatics: document.getElementById('skill-acrobatics'),
        animalHandling: document.getElementById('skill-animal-handling'),
        arcana: document.getElementById('skill-arcana'),
        athletics: document.getElementById('skill-athletics'),
        deception: document.getElementById('skill-deception'),
        history: document.getElementById('skill-history'),
        insight: document.getElementById('skill-insight'),
        intimidation: document.getElementById('skill-intimidation'),
        medicine: document.getElementById('skill-medicine'),
        perception: document.getElementById('skill-perception')
      };
      
      for (const [skill, element] of Object.entries(skillElements)) {
        if (element && this.character.skills[skill] !== undefined) {
          element.textContent = this.character.skills[skill];
        }
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
      status: "Healthy",
      // Add attributes
      strength: characterData.strength || 10,
      dexterity: characterData.dexterity || 10,
      constitution: characterData.constitution || 10,
      intelligence: characterData.intelligence || 10,
      wisdom: characterData.wisdom || 10,
      charisma: characterData.charisma || 10,
      // Add skills
      skills: characterData.skills || {
        acrobatics: 0,
        animalHandling: 0,
        arcana: 0,
        athletics: 0,
        deception: 0,
        history: 0,
        insight: 0,
        intimidation: 0,
        medicine: 0,
        perception: 0
      }
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