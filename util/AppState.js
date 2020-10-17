import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import { AsyncStorage} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import Fire from '../util/Fire';
import ObjectFactory from '../util/ObjectFactory';
import AppStateUpdater from '../util/AppStateUpdater';
import BlobCache from '../util/BlobCache';
import {evaluate} from 'mathjs';
import defaultPlayerAvatar from '../assets/images/defaultCharacter.png'
import { Image } from 'react-native'
import * as Notifications from 'expo-notifications';
import { GiftedChat } from '../components/ChatUI';


class AppState {

  constructor() {
    this.listeners = {}
    let newTable = ObjectFactory.createTable() 
    this.tables = {
      active: newTable,
      list: [newTable]
    }
    this.player = {
      name: 'Unnamed Player',
      avatar: Image.resolveAssetSource(defaultPlayerAvatar).uri,
      id: Fire.shared.uid
    }
    this.setTableDefaults(this, this.tables.active.id)
  }

  setTableDefaults(appState, tableId) {
    appState[tableId] = {}
    appState[tableId].notificationTokens = {}
    appState[tableId].users = []
    appState[tableId].tokens = []
    appState[tableId].map = undefined
    appState[tableId].pinnedMessage = "Pinned Message"
    appState[tableId].unreadMessages = 0
    appState[tableId].macros = {
      strsave: 'Str Save: 1d20 + $dexsave',
      dexsave: 'Dex Save: 1d20 + $dexsave',
      consave: 'Con Save: 1d20 + $consave',
      intsave: 'Int Save: 1d20 + $intsave',
      wissave: 'Wis Save: 1d20 + $wissave',
      chasave: 'Cha Save: 1d20 + $chasave',
      athletics: 'Athletics: 1d20 + $strmod',
      acrobatics: 'Acrobatics: 1d20 + $dexmod',
      sleight: 'Sleight of Hand: 1d20 + $dexmod',
      soh: 'Sleight of Hand: 1d20 + $dexmod',
      aracana: 'Arcana: 1d20 + $intmod',
      history: 'History: 1d20 + $intmod',
      investigation: 'Investigation: 1d20 + $intmod',
      nature: 'Nature: 1d20 + $intmod',
      religion: 'Religion: 1d20 + $intmod',
      animalhandling: 'Animal Handling: 1d20 + $wismod',
      insight: 'Insight: 1d20 + $wismod',
      medicine: 'Medicine: 1d20 + $wismod',
      perception: 'Perception: 1d20 + $wismod',
      survival: 'survival: 1d20 + $wismod',
      deception: 'deception: 1d20 + $chamod',
      intimidation: 'intimidation: 1d20 + $chamod',
      performance: 'performance: 1d20 + $chamod',
      persuasion: 'persuasion: 1d20 + $chamod',
    }
    appState[tableId].messages = []
    appState[tableId].character = {
      name: "Unnamed",
      avatar: 'https://firebasestorage.googleapis.com/v0/b/nova-rpg.appspot.com/o/uploads%2FToken_becs7qhdx.jpeg?alt=media&token=e0fb9238-e8c5-4a9b-b611-9fdf776f6b91',
      level: '8',
      XP: '0',
      prof: '3',
      race: '',
      class: '',
      strength: '10',
      dexterity: '10',
      constitution: '10',
      intelligence: '10',
      wisdom: '10',
      charisma: '10',
      strmod: '0',
      dexmod: '0',
      conmod: '0',
      intmod: '0',
      wismod: '0',
      chamod: '0',
      strsave: '$strmod',
      dexsave: '$dexmod',
      consave: '$conmod',
      intsave: '$intmod',
      wissave: '$wismod',
      chasave: '$chamod',
      coreStats: [
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
      ],
      computedStats: [
       'prof',
       'strmod',
       'dexmod',
       'conmod',
       'intmod',
       'wismod',
       'chamod',
      ],
      statCalculations: [
        'strmod = floor(strength/2)-5',
        'dexmod = floor(dexterity/2)-5',
        'conmod = floor(constitution/2)-5',
        'intmod = floor(intelligence/2)-5',
        'wismod = floor(wisdom/2)-5',
        'chamod = floor(charisma/2)-5',
        'prof = 2+floor((level-1)/4)',
      ],
      actionLayout: ObjectFactory.createActionLayout(),
    }
    BlobCache.shared.get(appState[tableId].character.avatar).then((res) => {
      appState[tableId].character.cachedAvatar = res
    })
  }


  get notificationTokens() {
    return AppState.shared[AppState.shared.tables.active.id].notificationTokens
  }
  set notificationTokens(value) {
    AppState.shared[AppState.shared.tables.active.id].notificationTokens = value
  }

  get unreadMessages() {
    return AppState.shared[AppState.shared.tables.active.id].unreadMessages
  }
  set unreadMessages(value) {
    AppState.shared[AppState.shared.tables.active.id].unreadMessages = value
  }

  get macros() {
    return AppState.shared[AppState.shared.tables.active.id].macros
  }
  set macros(value) {
    AppState.shared[AppState.shared.tables.active.id].macros = value
  }

  get messages() {
    return AppState.shared[AppState.shared.tables.active.id].messages
  }
  set messages(value) {
    AppState.shared[AppState.shared.tables.active.id].messages = value
  }

  get character() {
    return AppState.shared[AppState.shared.tables.active.id].character
  }
  set character(value) {
    AppState.shared[AppState.shared.tables.active.id].character = value
  }

  get map() {
    return AppState.shared[AppState.shared.tables.active.id].map
  }
  set map(value) {
    AppState.shared[AppState.shared.tables.active.id].map = value
  }

  get pinnedMessage() {
    return AppState.shared[AppState.shared.tables.active.id].pinnedMessage
  }

  set pinnedMessage(text) {
    return AppState.shared[AppState.shared.tables.active.id].pinnedMessage = text
  }

  get tokens() {
    return AppState.shared[AppState.shared.tables.active.id].tokens
  }
  set tokens(value) {
    AppState.shared[AppState.shared.tables.active.id].tokens = value
  }

  get users() {

    return AppState.shared[AppState.shared.tables.active.id].users
  }

  set users(value) {
    AppState.shared[AppState.shared.tables.active.id].users = value
  }

  onMessage(message) {  
    AppState.shared.lastReadMessage = message
    const cacheImages = async () => {
      if (message.user.avatar && message.user.avatar != null) {
        message.user.avatar = await BlobCache.shared.get(message.user.avatar)
      }
      if (message.image && message.image != null) {
        message.image = await BlobCache.shared.get(message.image)
      }
      if (message.audio && message.image != null) {
        message.audio = await BlobCache.shared.get(message.audio)
      }
    }
    cacheImages().then(() => {
      let index = AppState.shared.messages.findIndex((e) => {
        return e.id == message.id
      })
      if (index != -1) return
      if (message.user._id != Fire.shared.uid) {
        if (AppState.shared.notificationsEnabled) {
          AppState.shared.unreadMessages += 1
        }
      }
      AppState.shared.messages = GiftedChat.insert(AppState.shared.messages, message, 'timestamp')
      AppState.shared.saveState()
      let user = ObjectFactory.createUser(AppState.shared)
      Fire.shared.sendUser(user)
    }
    )
  }

  onMessageDelete(message) {
      let index = AppState.shared.messages.findIndex((e) => {
        return e.id == message.id
      })
      if (index == -1) return
      AppState.shared.messages.splice(index, 1)
      AppState.shared.saveState()
  }


  onMessageUpdate(message) {
      let index = AppState.shared.messages.findIndex((e) => {
        return e.id == message.id
      })
      if (index == -1) return
      AppState.shared.messages[index]._id = message._id
      AppState.shared.messages[index].text = message.text
      AppState.shared.messages[index].reactions = message.reactions
      AppState.shared.saveState()
  }

  onTableNameChange(name) {
    if (name == null) return
    AppState.shared.tables.active.name = name
    AppState.shared.saveState()
  }

  updateMessage(message) {
    Fire.shared.updateMessage(message)
  }

  sendMessages(messages) {
    /*for (let m in messages) { //TODO performance improvement (don't get sent message from server)
      let message = messages[m]
      AppState.shared.onMessage(message)
    }
    AppState.shared.saveState()
    */
    Fire.shared.sendMessages(messages) 
    for (let m in messages) {
      let message = messages[m]
      for (let t in AppState.shared.notificationTokens) {
        let title = message.user.name
        let body = message.text
        if (!message.text || message.text == '') {
          if (message.image) body = "Sent an image."
          if (message.audio) body = "Sent an audio recording."
        }
        Fire.shared.pushNotification(AppState.shared.notificationTokens[t], title, body)
      }
    }
  }

  async loadEarlierMessages() {
    let earliestMessage = AppState.shared.messages[0]
    for (let m in AppState.shared.messages) {
      earliestMessage = AppState.shared.messages[m].timestamp < earliestMessage.timestamp ? AppState.shared.messages[m] : earliestMessage
    }
    await Fire.shared.loadEarlierMessages(earliestMessage, AppState.shared.onMessage)
  }


    onMap = (map) => {
      if (map == 'null') {
        BlobCache.shared.get('https://i.imgur.com/cHLywwH.jpg').then((res) => {
          AppState.shared.map = res 
          AppState.shared.saveState()
        })
      }
      else {
        BlobCache.shared.get(map).then((res) => {
          AppState.shared.map = res 
          AppState.shared.saveState()
        })
      }
    }

    onPinnedMessage = (message) => {
      if (message == 'null') {
        AppState.shared.pinnedMessage = "" 
        AppState.shared.saveState()
      }
      else {
        console.log(message)
        AppState.shared.pinnedMessage = message
        AppState.shared.saveState()
      }
    }

    onTokenAdded = (token) => {
      let tIndex = AppState.shared.tokens.findIndex((item) => {return item.name == token.name})
      if (tIndex > -1) {
        AppState.shared.tokens[tIndex].x = token.x
        AppState.shared.tokens[tIndex].y = token.y
      }
      else {
        AppState.shared.tokens.push(token)
      }
      AppState.shared.saveState()
    }

    onTokenChanged = (token) => {
      let tIndex = AppState.shared.tokens.findIndex((item) => {return item.name == token.name})
      if (tIndex > -1) {
        AppState.shared.tokens[tIndex].x = token.x
        AppState.shared.tokens[tIndex].y = token.y
      }
      else {
        AppState.shared.tokens.push(token)
      }
      AppState.shared.saveState()
    }

    onTokenRemoved = (token) => {
      let tIndex = AppState.shared.tokens.findIndex((item) => {return item.name == token.name})
      if (tIndex > -1) {
        AppState.shared.tokens.splice(tIndex, 1)
      }
      AppState.shared.saveState()
    }

  get unreadMessages() {
    return AppState.shared._unreadMessages
  }

  set unreadMessages(value) {
    if (value == AppState.shared._unreadMessages) return
    AppState.shared._unreadMessages = value
    Notifications.setBadgeCountAsync(value)
    AppState.shared.saveState()
  }

  addListener(callback) {
    let randomId = Math.random().toString(36).substr(2,9)
    AppState.shared.listeners[randomId] = callback
    return () => {delete AppState.shared.listeners[randomId]}
  }



  async registerForPushNotificationsAsync() {
    let token;
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!');
        return;
      }
      token = (await Notifications.getExpoPushTokenAsync()).data;
    } else {
      alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    return token;
  }

  async addUser(user) {
    if (user.avatar) {
      user.avatar = await BlobCache.shared.get(user.avatar)
    }
    if (user.playerAvatar) {
      user.playerAvatar = await BlobCache.shared.get(user.playerAvatar)
    }
    AppState.shared.notificationTokens[user.id] = "ExponentPushToken[" + user.id + "]"
    AppState.shared.notificationTokens[user.id] = "ExponentPushToken[" + user.id + "]"
    let index = AppState.shared.users.findIndex((e) => {
      return e.id == user.id
    })
    if (index == -1) {
      AppState.shared.users.push(user)
    }
    else {
      AppState.shared.users[index] = user
    }
    console.log(AppState.shared.users)
    AppState.shared.saveState()
  }

  async updateUser(user) {
    if (user.avatar) {
      user.avatar = await BlobCache.shared.get(user.avatar)
    }
    if (user.playerAvatar) {
      user.playerAvatar = await BlobCache.shared.get(user.playerAvatar)
    }
    AppState.shared.notificationTokens[user.id] = "ExponentPushToken[" + user.id + "]"
    let index = AppState.shared.users.findIndex((e) => {
      return e.id == user.id
    })
    if (index == -1) return
    AppState.shared.users[index] = user
    console.log(AppState.shared.users)
    AppState.shared.saveState()
  }

  async init() {
    try {
      const jsonValue = await AsyncStorage.getItem('YourRollState')
      if (jsonValue != null) {
        let state = JSON.parse(jsonValue)
        if (state.version != '0.08') {
          state = AppStateUpdater.updateState(state)
        }
        if (state.player) {
          AppState.shared.player = state.player
        }
        if (state.tables) {
          AppState.shared.tables = state.tables
          for (table of state.tables.list) {
            if (!state.hasOwnProperty(table.id)) {
              AppState.shared.setTableDefaults(AppState.shared, table.id)
            }
            else {
              AppState.shared[table.id] = {}
              if (state[table.id].macros) {
                AppState.shared[table.id].macros = state[table.id].macros
              }
              if (state[table.id].character) {
                AppState.shared[table.id].character = state[table.id].character
              }
              if (state[table.id].messages) {
                AppState.shared[table.id].messages = state[table.id].messages
              }
              if (state[table.id].map) {
                AppState.shared[table.id].map = state[table.id].map
              }
              if (state[table.id].tokens) {
                AppState.shared[table.id].tokens = state[table.id].tokens
              }
              if (state[table.id].notificationTokens) {
                AppState.shared[table.id].notificationTokens = state[table.id].notificationTokens
              }
              if (state[table.id].users) {
                AppState.shared[table.id].users = state[table.id].users
              }
            }
          }
        }
      }
      else {
        //This is the first time we opened the app 
        //TODO first login stuff
        let notificationToken = await AppState.shared.registerForPushNotificationsAsync()
        let user = ObjectFactory.createUser(AppState.shared);
        Fire.shared.sendUser(user)
      }
    }
    catch(e) {
      console.log("Loading Error:" + e)
    }
    try {
      let latestMessage = null
      if (AppState.shared.messages.length > 0) {
        latestMessage = AppState.shared.messages[AppState.shared.messages.length -1]
      }
      Fire.shared.tableId = AppState.shared.tables.active.id
      Fire.shared.onUserAdded(AppState.shared.addUser)
      Fire.shared.onUserChanged(AppState.shared.updateUser)
      Fire.shared.onMessageReceived(latestMessage, AppState.shared.onMessage)
      Fire.shared.onMessageUpdated(AppState.shared.onMessageUpdate)
      Fire.shared.onMessageDeleted(AppState.shared.onMessageDelete)
      Fire.shared.onTableNameChanged(AppState.shared.onTableNameChange)
      Fire.shared.onMap(AppState.shared.onMap)
      Fire.shared.onPinnedMessage(AppState.shared.onPinnedMessage)
      Fire.shared.onTokenAdded(AppState.shared.onTokenAdded)
      Fire.shared.onTokenChanged(AppState.shared.onTokenChanged)
      Fire.shared.onTokenRemoved(AppState.shared.onTokenRemoved)
    }
    catch (e) {
      console.log("Server Error:" + e)
    }
  }

  async saveState() {
    AppState.shared.recalculateStats(AppState.shared.character)
    let updateId = Fire.shared.uid
    if (updateId) {
      AppState.shared.player._id = updateId
    }
    let state = {
      tables: AppState.shared.tables,
      version: '0.07',
      player: AppState.shared.player,
    }
    for (table of AppState.shared.tables.list) {
      let truncatedMessages = AppState.shared[table.id].messages.slice(0, 50)
      const tableState = {
        macros: AppState.shared[table.id].macros,
        character: AppState.shared[table.id].character,
        messages: truncatedMessages,
        map: AppState.shared[table.id].map,
        tokens: AppState.shared[table.id].tokens,
        notificationTokens: AppState.shared[table.id].notificationTokens,
        users: AppState.shared[table.id].users,
      }
      state[table.id] = tableState
    }
    for (let c in AppState.shared.listeners) {
      AppState.shared.listeners[c](state)
    }
    try {
      const jsonValue = JSON.stringify(state)
      AsyncStorage.setItem("YourRollState", jsonValue)
    }
    catch (e) {
      console.log("Storing Error" + e)
    }
  }

  changeTable(table) {
    AppState.shared.tables.active = table
    if (!AppState.shared.hasOwnProperty(table.id)) {
      AppState.shared.setTableDefaults(AppState.shared, table.id)
    }
    let latestMessage = null
    if (AppState.shared.messages.length > 0) {
      latestMessage = AppState.shared.messages[AppState.shared.messages.length -1]
    }
    Fire.shared.offEverything()
    Fire.shared.tableId = table.id
    Fire.shared.onUserAdded(AppState.shared.addUser)
    Fire.shared.onUserChanged(AppState.shared.updateUser)
    Fire.shared.onMessageReceived(latestMessage, AppState.shared.onMessage)
    Fire.shared.onMessageUpdated(AppState.shared.onMessageUpdate)
    Fire.shared.onMessageDeleted(AppState.shared.onMessageDelete)
    Fire.shared.onTableNameChanged(AppState.shared.onTableNameChange)
    Fire.shared.onMap(AppState.shared.onMap)
    Fire.shared.onPinnedMessage(AppState.shared.onPinnedMessage)
    Fire.shared.onTokenAdded(AppState.shared.onTokenAdded)
    Fire.shared.onTokenChanged(AppState.shared.onTokenChanged)
    Fire.shared.onTokenRemoved(AppState.shared.onTokenRemoved)
    AppState.shared.saveState()
  }

  recalculateStats(character) {
    for (let calc in character.statCalculations) {
      evaluate(character.statCalculations[calc], character)
    }
  }


  getStat(stat) {
    if (AppState.shared.character.hasOwnProperty(stat)) {
      return AppState.shared.character[stat]
    }
    return null
  }

  getMacro(hash) {
    if (AppState.shared.macros.hasOwnProperty(hash)) {
      return AppState.shared.macros[hash]
    }
    return null
  }

}

AppState.shared = new AppState()
export default AppState
