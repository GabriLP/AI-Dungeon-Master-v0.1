/* Character Creation Script */

import { CharacterManager } from './characterManager.js';

document.addEventListener('DOMContentLoaded', () => {
  const characterManager = new CharacterManager();
  
  // Get all input fields
  const nameInput = document.getElementById('name');
  const classSelect = document.getElementById('class');
  const raceSelect = document.getElementById('race');
  const backgroundInput = document.getElementById('background');
  
  // Get attribute inputs
  const strengthInput = document.getElementById('strength');
  const dexterityInput = document.getElementById('dexterity');
  const constitutionInput = document.getElementById('constitution');
  const intelligenceInput = document.getElementById('intelligence');
  const wisdomInput = document.getElementById('wisdom');
  const charismaInput = document.getElementById('charisma');
  
  // Get summary elements
  const summaryName = document.getElementById('summary-name');
  const summaryClass = document.getElementById('summary-class');
  const summaryRace = document.getElementById('summary-race');
  const summaryHP = document.getElementById('summary-hp');
  const summaryAC = document.getElementById('summary-ac');
  const summaryAtk = document.getElementById('summary-atk');
  
  // Set default values
  setDefaultValues();
  
  // Add event listeners to update summary
  nameInput.addEventListener('input', updateSummary);
  classSelect.addEventListener('change', updateSummary);
  raceSelect.addEventListener('change', updateSummary);
  constitutionInput.addEventListener('input', updateSummary);
  dexterityInput.addEventListener('input', updateSummary);
  strengthInput.addEventListener('input', updateSummary);
  
  // Add event listener to Apply button
  const applyButton = document.querySelector('a[href="main-page.html"]');
  if (applyButton) {
    applyButton.addEventListener('click', function(e) {
      e.preventDefault();
      createCharacter();
    });
  }
  
  function setDefaultValues() {
    // Set default values for attributes
    strengthInput.value = 10;
    dexterityInput.value = 10;
    constitutionInput.value = 10;
    intelligenceInput.value = 10;
    wisdomInput.value = 10;
    charismaInput.value = 10;
    
    // Update the summary with default values
    updateSummary();
  }
  
  function updateSummary() {
    // Update the character summary based on inputs
    if (nameInput.value) {
      summaryName.textContent = nameInput.value;
    } else {
      summaryName.textContent = "Unnamed";
    }
    
    // Update class and race
    summaryClass.textContent = classSelect.options[classSelect.selectedIndex].text;
    summaryRace.textContent = raceSelect.options[raceSelect.selectedIndex].text;
    
    // Calculate HP based on class and constitution
    const constitutionMod = Math.floor((parseInt(constitutionInput.value) - 10) / 2);
    let baseHP = 10; // Default base HP
    
    // Adjust base HP based on class
    switch(classSelect.value) {
      case 'barbarian':
        baseHP = 12;
        break;
      case 'fighter':
      case 'paladin':
      case 'ranger':
        baseHP = 10;
        break;
      case 'bard':
      case 'cleric':
      case 'druid':
      case 'rogue':
        baseHP = 8;
        break;
      case 'wizard':
      case 'sorcerer':
        baseHP = 6;
        break;
    }
    
    const totalHP = baseHP + constitutionMod;
    summaryHP.textContent = Math.max(1, totalHP); // Minimum HP of 1
    
    // Calculate AC based on dexterity
    const dexMod = Math.floor((parseInt(dexterityInput.value) - 10) / 2);
    const baseAC = 10 + dexMod;
    summaryAC.textContent = baseAC;
    
    // Calculate attack bonus based on strength
    const strMod = Math.floor((parseInt(strengthInput.value) - 10) / 2);
    const attackBonus = strMod;
    summaryAtk.textContent = attackBonus >= 0 ? `+${attackBonus}` : attackBonus;
  }
  
  function createCharacter() {
    // Create a new character based on the inputs
    const characterData = {
      name: nameInput.value || "Adventurer",
      class: classSelect.options[classSelect.selectedIndex].text,
      race: raceSelect.options[raceSelect.selectedIndex].text,
      level: 1,
      background: backgroundInput.value,
      strength: parseInt(strengthInput.value),
      dexterity: parseInt(dexterityInput.value),
      constitution: parseInt(constitutionInput.value),
      intelligence: parseInt(intelligenceInput.value),
      wisdom: parseInt(wisdomInput.value),
      charisma: parseInt(charismaInput.value),
      // Calculate HP based on constitution
      maxHP: parseInt(summaryHP.textContent),
      // Calculate AC based on dexterity
      ac: parseInt(summaryAC.textContent)
    };
    
    // Create the character in the manager
    const newCharacter = characterManager.createCharacter(characterData);
    
    // Select the character as the active character
    characterManager.selectCharacter(newCharacter.id);
    
    // Redirect to the main game page
    window.location.href = "main-page.html";
  }
});