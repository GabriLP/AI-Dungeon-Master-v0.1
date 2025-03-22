/* Manages the display of messages and UI elements */

export class ViewManager {
  static appendMessage(sender, message, className = '') {
    const output = document.getElementById('output');
    if (!output) return;

    const messageContainer = document.createElement('div');
    messageContainer.classList.add('message-container');
    
    const senderElement = document.createElement('span');
    senderElement.classList.add('message-sender');
    senderElement.textContent = sender + ': ';
    senderElement.style.fontWeight = 'bold';
    
    const messageElement = document.createElement('div');
    messageElement.classList.add('message-content');
    if (className) messageElement.classList.add(className);
    messageElement.textContent = message;
    
    messageContainer.appendChild(senderElement);
    messageContainer.appendChild(messageElement);
    
    output.appendChild(messageContainer);
    output.scrollTop = output.scrollHeight;
  }

  static appendSystemMessage(message) {
    this.appendMessage('System', message, 'system-message');
  }
  
  static addCombatFeedback(element) {
    const output = document.getElementById('output');
    if (!output) return;
    
    output.appendChild(element);
    output.scrollTop = output.scrollHeight;
  }

  static clearInput() {
    const inputBox = document.getElementById('input-box');
    if (inputBox) inputBox.value = '';
  }
  
  static clearOutput() {
    const output = document.getElementById('output');
    if (output) output.innerHTML = '';
  }
  
  static showLoading(message = 'The Dungeon Master is thinking...') {
    // Remove loading indicator
    this.hideLoading();
    
    // Create and add the loading indicator
    const output = document.getElementById('output');
    if (!output) return;
    
    const loadingElement = document.createElement('div');
    loadingElement.id = 'loading-indicator';
    loadingElement.classList.add('loading-indicator');
    
    const spinnerElement = document.createElement('div');
    spinnerElement.classList.add('spinner');
    
    const messageElement = document.createElement('span');
    messageElement.textContent = message;
    
    loadingElement.appendChild(spinnerElement);
    loadingElement.appendChild(messageElement);
    
    output.appendChild(loadingElement);
    output.scrollTop = output.scrollHeight;
  }
  
  static hideLoading() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
      loadingIndicator.remove();
    }
  }
  
  static updateEnemiesList(enemies) {
    const enemiesContainer = document.getElementById('enemies-list');
    if (!enemiesContainer) return;
    
    enemiesContainer.innerHTML = '';
    
    const heading = document.createElement('h3');
    heading.textContent = 'Enemies Nearby';
    enemiesContainer.appendChild(heading);
    
    enemies.forEach(enemy => {
      const enemyElement = document.createElement('div');
      enemyElement.classList.add('enemy-item');
      enemyElement.textContent = enemy;
      enemiesContainer.appendChild(enemyElement);
    });
  }
  
  static clearEnemiesList() {
    const enemiesContainer = document.getElementById('enemies-list');
    if (enemiesContainer) {
      enemiesContainer.innerHTML = '';
    }
  }
  
  static updateNPCList(npcs) {
    const npcContainer = document.getElementById('npc-list');
    if (!npcContainer) return;
    
    npcContainer.innerHTML = '';
    
    const heading = document.createElement('h3');
    heading.textContent = 'NPCs Present';
    npcContainer.appendChild(heading);
    
    npcs.forEach(npc => {
      const npcElement = document.createElement('div');
      npcElement.classList.add('npc-item');
      npcElement.textContent = npc;
      npcContainer.appendChild(npcElement);
    });
  }
  
  static updateLocation(location) {
    const locationElement = document.getElementById('current-location');
    if (locationElement) {
      locationElement.textContent = location.charAt(0).toUpperCase() + location.slice(1);
    }
  }
  
  static updateQuestLog(quests) {
    const questLog = document.getElementById('quest-log');
    if (!questLog) return;
    
    questLog.innerHTML = '';
    
    const heading = document.createElement('h3');
    heading.textContent = 'Active Quests';
    questLog.appendChild(heading);
    
    quests.forEach(quest => {
      const questElement = document.createElement('div');
      questElement.classList.add('quest-item');
      questElement.textContent = quest;
      questLog.appendChild(questElement);
    });
  }
  
  static showRestartOption(onRestart) {
    const output = document.getElementById('output');
    if (!output) return;
    
    const restartContainer = document.createElement('div');
    restartContainer.classList.add('restart-container');
    
    const restartMessage = document.createElement('p');
    restartMessage.textContent = 'You have fallen unconscious. Would you like to:';
    
    const restartButton = document.createElement('button');
    restartButton.textContent = 'Restart Adventure';
    restartButton.classList.add('restart-button');
    restartButton.addEventListener('click', onRestart);
    
    restartContainer.appendChild(restartMessage);
    restartContainer.appendChild(restartButton);
    
    output.appendChild(restartContainer);
    output.scrollTop = output.scrollHeight;
  }
}