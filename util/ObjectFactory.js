import Fire from './Fire.js'
export default class ObjectFactory {

  static createToken(image) {
    const name = 'Token_' + Math.random().toString(36).substr(2,9)
    return {
      name: name,
      image: image,
      x: 0,
      y: 0,
      timestamp: Fire.shared.timestamp
    }
  }

  static updateMessage(props) {
    const id = props.id
    let message = ObjectFactory.createMessage(props)
    message.id = id
    return message 
  }

  static createTable(props) {
    let id = 'Table_' + Math.random().toString(36).substr(2,9)
    let name = "A simple oak Table"
    if (props) {
      id = props.id ? props.id : id 
      name = props.name ? props.name : name
    }
    return {
      id: id,
      name: name,
    }
  }

  static createMessage(props) {
    const id = 'Message_' + Math.random().toString(36).substr(2,9)
    let text = props.text
    let user = props.user
    let reply = props.reply
    let audio = props.audio
    let rolls = props.rolls
    let image = props.image
    let reactions = props.reactions
    let timestamp = Fire.shared.timestamp
    if (!text) {
      text = null
    }
    if (!user) {
      user = null
    }
    if (!reply) {
      reply = null
    }
    if (!audio) {
      audio = null
    }
    if (!rolls) {
      rolls = null
    }
    if (!image) {
      image = null
    }
    if (!reactions) {
      reactions = null
    }
    return {
      id: id,
      text: text,
      user: user,
      reply: reply,
      audio: audio,
      rolls: rolls,
      image: image,
      reactions: reactions,
      timestamp: Fire.shared.timestamp,
    }
  }

  static createActionLayout(character) {
    return ( {
      0: {grid: {x: 0, y: 0}, size: {x:4, y:1}, type:"SnapText", display:"%name"},
      1: {grid: {x: 0, y: 1}, size: {x:2, y:1}, type:"SnapText", display:"Class: %class"},
      2: {grid: {x: 2, y: 1}, size: {x:2, y:1}, type:"SnapText", display:"Level: %level"},
      3: {grid: {x: 0, y: 2}, size: {x:2, y:1}, type:"SnapText", display:"Race: %race"},
      4: {grid: {x: 2, y: 2}, size: {x:2, y:1}, type:"SnapText", display:"Prof: %prof"},
      5: {grid: {x: 4, y: 0}, size: {x:2, y:2}, type:"Avatar"},
      6: {grid: {x: 0, y: 3}, size: {x:2, y:1}, type:"SnapText", display:"Strength: %strength"},
      7: {grid: {x: 2, y: 3}, size: {x:2, y:1}, type:"SnapText", display:"Dexterity: %dexterity"},
      8: {grid: {x: 4, y: 3}, size: {x:2, y:1}, type:"SnapText", display:"Constitution: %constitution"},
      9: {grid: {x: 0, y: 4}, size: {x:2, y:1}, type:"SnapText", display:"StrMod: \n$strmod"},
      10: {grid: {x: 2, y: 4}, size: {x:2, y:1}, type:"SnapText", display:"DexMod: \n$dexmod"},
      11: {grid: {x: 4, y: 4}, size: {x:2, y:1}, type:"SnapText", display:"ConMod: \n$conmod"},

      12: {grid: {x: 0, y: 5}, size: {x:2, y:1}, type:"SnapText", display:"Intelligence: %intelligence"},
      13: {grid: {x: 2, y: 5}, size: {x:2, y:1}, type:"SnapText", display:"Wisdom: %wisdom"},
      14: {grid: {x: 4, y: 5}, size: {x:2, y:1}, type:"SnapText", display:"Charisma: %charisma"},
      15: {grid: {x: 0, y: 6}, size: {x:2, y:1}, type:"SnapText", display:"IntMod: \n$intmod"},
      16: {grid: {x: 2, y: 6}, size: {x:2, y:1}, type:"SnapText", display:"WisMod: \n$wismod"},
      17: {grid: {x: 4, y: 6}, size: {x:2, y:1}, type:"SnapText", display:"ChaMod: \n$chamod"},
    })
  }
}

