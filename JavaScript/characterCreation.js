/* Character Creation Script */

import { CharacterManager } from './characterManager.js';

document.addEventListener('DOMContentLoaded', () => {
  const characterManager = new CharacterManager();
  
  // Get all input fields
  const nameInput = document.getElementById('name');
  const classSelect = document.getElementById('class');
  const raceSelect = document.getElementById('race');
  //const backgroundInput = document.getElementById('background');
  
  // Get attribute inputs
  const strengthInput = document.getElementById('strength');
  const dexterityInput = document.getElementById('dexterity');
  const constitutionInput = document.getElementById('constitution');
  const intelligenceInput = document.getElementById('intelligence');
  const wisdomInput = document.getElementById('wisdom');
  const charismaInput = document.getElementById('charisma');

  //Get skills
  const acrobaticsInput = document.getElementById('acrobatics');
  const animalHandlingInput = document.getElementById('animal-handling');
  const arcanaInput = document.getElementById('arcana');
  const athleticsInput = document.getElementById('athletics');
  const deceptionInput = document.getElementById('deception');
  const historyInput = document.getElementById('history');
  const insightInput = document.getElementById('insight');
  const intimidationInput = document.getElementById('intimidation');
  const medicineInput = document.getElementById('medicine');
  const perceptionInput = document.getElementById('perception');
  
  // Get summary elements
  const summaryName = document.getElementById('summary-name');
  const summaryClass = document.getElementById('summary-class');
  const summaryRace = document.getElementById('summary-race');
  const summaryHP = document.getElementById('summary-hp');
  const summaryAC = document.getElementById('summary-ac');
  const summaryAtk = document.getElementById('summary-atk');
  
  // Set default values
  const defaults = {
    strength: 10, dexterity: 10, constitution: 10, 
    intelligence: 10, wisdom: 10, charisma: 10,
    acrobatics: 0, animalHandling: 0, arcana: 0,
    athletics: 0, deception: 0, history: 0,
    insight: 0, intimidation: 0, medicine: 0, perception: 0
  };

  strengthInput.value = defaults.strength;
  dexterityInput.value = defaults.dexterity;
  constitutionInput.value = defaults.constitution;
  intelligenceInput.value = defaults.intelligence;
  wisdomInput.value = defaults.wisdom;
  charismaInput.value = defaults.charisma;
  
  acrobaticsInput.value = defaults.acrobatics;
  animalHandlingInput.value = defaults.animalHandling;
  arcanaInput.value = defaults.arcana;
  athleticsInput.value = defaults.athletics;
  deceptionInput.value = defaults.deception;
  historyInput.value = defaults.history;
  insightInput.value = defaults.insight;
  intimidationInput.value = defaults.intimidation;
  medicineInput.value = defaults.medicine;
  perceptionInput.value = defaults.perception;
  
  // Update summary when inputs change
  function updateSummary() {
    summaryName.textContent = nameInput.value || "-";
    summaryClass.textContent = classSelect.value || "-";
    summaryRace.textContent = raceSelect.value || "-";

    // TODO: Modifiers
    // // Calculate HP based on constitution (simple formula)
    // const conMod = Math.floor((parseInt(constitutionInput.value) - 10) / 2);
    // let baseHP = 10; // Default base HP

    // //TODO: Set some base HP for classes here

    // const hp = baseHP + conMod;
    // summaryHP.textContent = hp > 0 ? hp : 1; // Minimum HP is 1
    
    // // Calculate AC based on dexterity
    // const dexMod = Math.floor((parseInt(dexterityInput.value) - 10) / 2);
    // summaryAC.textContent = 10 + dexMod;
    
    // // Calculate attack bonus based on strength
    // const strMod = Math.floor((parseInt(strengthInput.value) - 10) / 2);
    // summaryAtk.textContent = strMod >= 0 ? `+${strMod}` : strMod;
  }

  // Add event listeners to all inputs
  nameInput.addEventListener('input', updateSummary);
  classSelect.addEventListener('change', updateSummary);
  raceSelect.addEventListener('change', updateSummary);
  strengthInput.addEventListener('input', updateSummary);
  dexterityInput.addEventListener('input', updateSummary);
  constitutionInput.addEventListener('input', updateSummary);
  intelligenceInput.addEventListener('input', updateSummary);
  wisdomInput.addEventListener('input', updateSummary);
  charismaInput.addEventListener('input', updateSummary);

  updateSummary();
  
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

  // Add event listener to Apply button
  const applyButton = document.querySelector('.character-creation-links a[href="main-page.html"]');
  if (applyButton) {
    applyButton.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Create character data object
      const characterData = {
        name: nameInput.value || "Adventurer",
        class: classSelect.value,
        race: raceSelect.value,
        level: 1,
        ac: parseInt(summaryAC.textContent) || 10,
        maxHP: parseInt(summaryHP.textContent) || 20,
        currentHP: parseInt(summaryHP.textContent) || 20,
        status: "Healthy",
        
        // Add attributes
        strength: parseInt(strengthInput.value) || 10,
        dexterity: parseInt(dexterityInput.value) || 10,
        constitution: parseInt(constitutionInput.value) || 10,
        intelligence: parseInt(intelligenceInput.value) || 10,
        wisdom: parseInt(wisdomInput.value) || 10,
        charisma: parseInt(charismaInput.value) || 10,
        
        // Add skills
        skills: {
          acrobatics: parseInt(acrobaticsInput.value) || 0,
          animalHandling: parseInt(animalHandlingInput.value) || 0,
          arcana: parseInt(arcanaInput.value) || 0,
          athletics: parseInt(athleticsInput.value) || 0,
          deception: parseInt(deceptionInput.value) || 0,
          history: parseInt(historyInput.value) || 0,
          insight: parseInt(insightInput.value) || 0,
          intimidation: parseInt(intimidationInput.value) || 0,
          medicine: parseInt(medicineInput.value) || 0,
          perception: parseInt(perceptionInput.value) || 0
        }
      };
      
      // Save character data to localStorage
      localStorage.setItem('newCharacterData', JSON.stringify(characterData));
      
      // Navigate to main page
      window.location.href = 'main-page.html';
    });
  }
})