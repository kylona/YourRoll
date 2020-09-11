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

  static createMessage(props) {
    const id = 'Message_' + Math.random().toString(36).substr(2,9)
    let text = props.text
    let user = props.user
    let reply = props.reply
    let audio = props.audio
    let rolls = props.rolls
    let image = props.image
    let reacts = props.reacts
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
    if (!reacts) {
      reacts = null
    }
    return {
      id: id,
      text: text,
      user: user,
      reply: reply,
      audio: audio,
      rolls: rolls,
      image: image,
      reacts: reacts,
      timestamp: Fire.shared.timestamp,
    }
  }
}

