import AppState from './AppState'
import {evaluate} from 'mathjs'
export default class MessageParser {

  static parse(messages) {
    messages[0].text = MessageParser.parseMacros(messages[0].text)
    messages[0].text = MessageParser.parseBlings(messages[0].text)
    let results = MessageParser.parseDiceRolls(messages[0].text)
    let resultMessage = MessageParser.evaluateMath(messages[0].text, results)
    if (resultMessage != null) {
      messages = MessageParser.pushDiceRollMessage(resultMessage, messages)
    }
    return messages
  }

  static rollDice(size) {
    return (Math.floor(((Math.random() + 0.2) * 10000)) % size) + 1
  }

  static evaluateMath(string, results) {
    let diceString = string
    for (let r in results) {
      diceString = diceString.replace(results[r].prompt, results[r].result)
    }
    diceString = diceString.replace('[','(').replace(']',')')
    diceString = diceString.replace(/\s*\+\s*/g, '+').replace(/\s*\-\s*/g, '-')
    diceString = diceString.replace(/\s*\*\s*/g, '*').replace(/\s*\/\s*/g, '/')
    let mathExps = diceString.match(/((((\d+[\+,\-,\*,\/])+\d+)|((\((\d+[\+,\-,\*,\/])*\d+\)))))([\+,\-,\*,\/]((\d+|((\((\d+[\+,\-,\*,\/])*\d+\))))))*/g) //matches math expressions
    if (!mathExps && results.length == 0) return null
    mathString = diceString
    for (let e in mathExps) {
      let evaled = evaluate(mathExps[e])
      mathString = mathString.replace(mathExps[e], mathExps[e] + ' → ' + evaled)
    }
    if (results.length > 0 && mathExps) {
      return mathString
    }
    else if (results.length > 0 && !mathExps) {
      return diceString
    }
  }

  static parseDiceRolls(string) {
    results = []
    let diceRolls = string.match(/\b\d*d\d+(kh)?(kl)?/g)
    for (let r in diceRolls) {
      let keepHigh = diceRolls[r].includes('kh')
      let keepLow = diceRolls[r].includes('kl')
      let baseRoll = diceRolls[r].replace(/(kh)?(kl)?/g,'')
      let numDsize = baseRoll.split('d')
      if (numDsize[0] == '') numDsize[0] = '1'
      let number = parseInt(numDsize[0])
      let dice = parseInt(numDsize[1])
      if (isNaN(dice) || isNaN(number) || dice == 0) {
        console.log("Invalid numDsize: " + numDsize)
        return results
      }
      let count = 0
      let toWrite = ''
      if (number > 1) toWrite = '('
      let sum = 0;
      let max = 0;
      let min = dice+1;
      while(count < number){
        let roll = MessageParser.rollDice(dice)
        if (count != 0) toWrite += ' + '
        toWrite += roll 
        sum += roll
        max = Math.max(max, roll)
        min = Math.min(min, roll)
        count = count + 1
      }
      if (number > 1) toWrite += ')'
      if (keepHigh) {
        if (number > 20) toWrite = diceRolls[r]
        results.push({prompt: diceRolls[r], result: toWrite.replace(/\+/g, ',') + ' → ' + max}) 
      }
      else if (keepLow) {
        if (number > 20) toWrite = diceRolls[r]
        results.push({prompt: diceRolls[r], result: toWrite.replace(/\+/g, ',') + ' → ' + min}) 
      }
      else {
        if (number > 20) toWrite = diceRolls[r] + ' → ' + sum
        results.push({prompt: diceRolls[r], result: toWrite}) 
      }
    }
    return results
  } 

  static pushDiceRollMessage(resultMessage, messages) {
      const newId = 'Message_' + Math.random().toString(36).substr(2, 9)
      messages[0].rolls = '🎲' + ' ' + resultMessage
      /* Dice Roller as person /
      let rollMessage = {
        _id: messages[0]._id,
        id: newId,
        createdAt: messages[0].createdAt,
        text: resultMessage,
        user: {_id: "NOVA_RPG_DICE_ROLLER", name: "Dice Roller", avatar: "https://i.pinimg.com/originals/1e/15/88/1e15881f6e57c883f0cd394381ac7249.jpg"},
        reply: messages[0].id || null,
      }
      messages.push(rollMessage)
      */
    return messages
  }

  static parseBlings(string) {
    let origString = string
    let blingWrapped = string.match(/\$[a-zA-Z\d-]+/g)
    if (blingWrapped == null || blingWrapped.length == 0) return string
    for (let b in blingWrapped) {
      let bling = blingWrapped[b].toLowerCase().replace(/\s/,'').replace('$','')
      if (AppState.shared.getStat(bling) != null){
        string = string.replace(blingWrapped[b].replace(/\s/,''), AppState.shared.getStat(bling))
      }
    }
    if (origString == string) return string
    return MessageParser.parseBlings(string)
  }

  static parseMacros(string) {
    let origString = string
    let hashWrapped = string.match(/\#[a-zA-Z\d-]+/g)
    if (hashWrapped == null || hashWrapped.length == 0) return string
    for (let h in hashWrapped) {
      let hash = hashWrapped[h].toLowerCase().replace(/\s/,'').replace('#','')
      if (AppState.shared.getMacro(hash) != null){
        string = string.replace(hashWrapped[h].replace(/\s/,''), AppState.shared.getMacro(hash))
      }
    }
    if (origString == string) return string
    return MessageParser.parseMacros(string)
  }

  static getPartialCommand(text) {
    let words = text.split(" ")
    let lastWord = words[words.length -1]
    if (lastWord.startsWith("#") || lastWord.startsWith("$")) {
      return lastWord
    }
    else return null
  }

  static getPartialCommandGuesses(parCom) {
    let guesses = []
    if (parCom == null) return guesses
    for (let macro in AppState.shared.macros) {
      if (macro.startsWith(parCom.slice(1, parCom.length))) guesses.push("#" + macro)
    }
    for (let stat in AppState.shared.character) {
      console.log(stat)
      if (stat.startsWith(parCom.slice(1, parCom.length))) guesses.push("$" + stat)
    }
    return guesses
  }

}

