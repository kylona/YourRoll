import Fire from '../util/Fire';
import BlobCache from '../util/BlobCache';
import {evaluate} from 'mathjs';
import defaultPlayerAvatar from '../assets/images/defaultCharacter.png'
import { Image } from 'react-native'
import ObjectFactory from '../util/ObjectFactory'


class Character {

  constructor(toCopy={}) {
      this.name = toCopy.name || "Unnamed"
      this.avatar = toCopy.avatar || 'https://firebasestorage.googleapis.com/v0/b/nova-rpg.appspot.com/o/uploads%2FToken_becs7qhdx.jpeg?alt=media&token=e0fb9238-e8c5-4a9b-b611-9fdf776f6b91'
      this.level = toCopy.level || '8'
      this.XP = toCopy.XP || '0'
      this.prof = toCopy.prof || '3'
      this.race = toCopy.race || ''
      this.pClass = toCopy.pClass || ''
      this.strength = toCopy.strength || '10'
      this.dexterity = toCopy.dexterity || '10'
      this.constitution = toCopy.constitution || '10'
      this.intelligence = toCopy.intelligence || '10'
      this.wisdom = toCopy.wisdom || '10'
      this.charisma = toCopy.charisma || '10'
      this.strmod = toCopy.strmod || '0'
      this.dexmod = toCopy.dexmod || '0'
      this.conmod = toCopy.conmod || '0'
      this.intmod = toCopy.intmod || '0'
      this.wismod = toCopy.wismod || '0'
      this.chamod = toCopy.chamod || '0'
      this.strsave = toCopy.strsave || '$strmod'
      this.dexsave = toCopy.dexsave || '$dexmod'
      this.consave = toCopy.consave || '$conmod'
      this.intsave = toCopy.intsave || '$intmod'
      this.wissave = toCopy.wissave || '$wismod'
      this.chasave = toCopy.chasave || '$chamod'
      this.coreStats = toCopy.coreStats || [
        'strength',
        'dexterity',
        'constitution',
        'intelligence',
        'wisdom',
        'charisma',
        'level',
        'race',
        'class',
       'strsave',
       'dexsave',
       'consave',
       'intsave',
       'wissave',
       'chasave',
      ]
      this.computedStats = toCopy.computedStats || [
       'prof',
       'strmod',
       'dexmod',
       'conmod',
       'intmod',
       'wismod',
       'chamod',
      ]
      this.statCalculations = toCopy.statCalculations || [
        'strmod = floor(strength/2)-5',
        'dexmod = floor(dexterity/2)-5',
        'conmod = floor(constitution/2)-5',
        'intmod = floor(intelligence/2)-5',
        'wismod = floor(wisdom/2)-5',
        'chamod = floor(charisma/2)-5',
        'prof = 2+floor((level-1)/4)',
      ]
			this.macros = toCopy.macros || []
      this.actionLayout = toCopy.actionLayout || ObjectFactory.createActionLayout()
      BlobCache.shared.get(this.avatar).then((res) => {
        this.cachedAvatar = res
      })
  }

  asObject() {
    return {
      name: this.name,
      avatar: this.avatar, 
      level: this.level, 
      XP: this.XP, 
      prof: this.prof, 
      race: this.race, 
      pClass: this.pClass, 
      strength: this.strength, 
      dexterity: this.dexterity, 
      constitution: this.constitution, 
      intelligence: this.intelligence, 
      wisdom: this.wisdom, 
      charisma: this.charisma, 
      strmod: this.strmod, 
      dexmod: this.dexmod, 
      conmod: this.conmod, 
      intmod: this.intmod, 
      wismod: this.wismod, 
      chamod: this.chamod, 
      strsave: this.strsave, 
      dexsave: this.dexsave, 
      consave: this.consave, 
      intsave: this.intsave, 
      wissave: this.wissave, 
      chasave: this.chasave, 
      coreStats: this.coreStats, 
      computedStats: this.computedStats, 
      statCalculations: this.statCalculations, 
			macros: this.macros, 
      actionLayout: this.actionLayout, 
      cachedAvatar: this.cachedAvatar, 
    }
  }

  recalculateStats() {
    for (let calc in this.statCalculations) {
      evaluate(this.statCalculations[calc], this.asObject())
    }
  }

  getStat(stat) {
    if (this.hasOwnProperty(stat)) {
      return this[stat]
    }
    return null
  }

  getMacro(hash) {
    if (this.macros.hasOwnProperty(hash)) {
      return AppState.shared.macros[hash]
    }
    return null
  }

  savedLocally() {
		AsyncStorage.setItem("Character_" + this.name, JSON.stringify(this))
		return this
  }

  savedOnline() {
		Fire.shared.sendCharacter(this)	
		return this
  }


	static load(name) {
		const jsonValue = AsyncStorage.getItem("Character_" + name)
		if (jsonValue != null) {
			return new Character(JSON.parse(jsonValue))
		}
		else return null
	}
}

export default Character
