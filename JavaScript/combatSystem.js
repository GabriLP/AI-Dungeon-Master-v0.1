/* Combat system module */

export class CombatSystem {
  static resolveAttack(attackValue, character) {
    const results = {
      success: false,
      damage: 0,
      critical: false,
      message: ''
    };

    // Critical hit on natural 20
    if (attackValue === 20) {
      results.success = true;
      results.critical = true;
      results.damage = this.calculateDamage(attackValue, character, true);
      results.message = `Critical hit! (${attackValue} vs AC ${character.ac})`;
    }
    // Hit if attack meets or exceeds AC
    else if (attackValue >= character.ac) {
      results.success = true;
      results.damage = this.calculateDamage(attackValue, character);
      results.message = `Attack hits! (${attackValue} vs AC ${character.ac})`;
    } 
    // Miss otherwise
    else {
      results.message = `Attack misses! (${attackValue} vs AC ${character.ac})`;
    }

    return results;
  }

  static calculateDamage(attackValue, character, isCritical = false) {
    // Base damage calculation
    let damage = Math.max(1, Math.floor((attackValue - character.ac) / 2) + 1);
    
    // If critical hit, double the damage
    if (isCritical) {
      damage = damage * 2;
    }
    
    // // Scale damage based on character level
    // if (character.level) {
    //   const levelScaling = 1 + (character.level * 0.1);
    //   damage = Math.round(damage * levelScaling);
    // }
    
    return damage;
  }

  static parseAttackValue(message) {
    const attackRegex = /\(Attack:\s*(\d+)\)/i;
    const match = message.match(attackRegex);
    return match ? parseInt(match[1]) : null;
  }
  
  static parseDiceRoll(message) {
    // Support for dice notation like 1d20+5
    const diceRegex = /\((\d+)d(\d+)(?:\s*\+\s*(\d+))?\)/g;
    let match;
    let parsedMessage = message;
    
    while ((match = diceRegex.exec(message)) !== null) {
      const numDice = parseInt(match[1]);
      const diceSides = parseInt(match[2]);
      const modifier = match[3] ? parseInt(match[3]) : 0;
      
      let total = modifier;
      for (let i = 0; i < numDice; i++) {
        total += Math.floor(Math.random() * diceSides) + 1;
      }
      
      parsedMessage = parsedMessage.replace(match[0], `(${total})`);
    }
    
    return parsedMessage;
  }

  static generateCombatMessage(results) {
    const element = document.createElement('div');
    element.classList.add('combat-message');
    
    if (results.success) {
      element.classList.add(results.critical ? 'critical-hit' : 'damage');
      element.textContent = `${results.message} You take ${results.damage} damage.`;
    } else {
      element.classList.add('defense');
      element.textContent = results.message;
    }
    
    return element;
  }
}