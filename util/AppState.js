import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import { AsyncStorage} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Crypto from 'expo-crypto';
import Fire from '../util/Fire';
import BlobCache from '../util/BlobCache';
import {evaluate} from 'mathjs';
import defaultPlayerAvatar from '../assets/images/defaultCharacter.png'
import { Image } from 'react-native'
import * as Notifications from 'expo-notifications';
import { GiftedChat } from '../components/ChatUI';


class AppState {

  constructor() {
		this.notificationTokens = []
    this.notificationsEnabled = true
    this._unreadMessages = 0
    this.macros = {
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
    this.player = {
      name: 'Unnamed Player',
      avatar: Image.resolveAssetSource(defaultPlayerAvatar).uri,
      id: Fire.shared.uid
    }
		this.messages = []
    this.character = {
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
      ]
    }
    BlobCache.shared.get(this.character.avatar).then((res) => {
      this.character.cachedAvatar = res
    })
    BlobCache.shared.get(this.player.avatar).then((res) => {
      this.player.cachedAvatar = res
    })
    this.listeners = {}
  }


  onMessage(message) {	
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

  addUser(user) {
    AppState.shared.notificationTokens.push("ExponentPushToken[" + user.id + "]") 
  }

  async init() {
		try {
      Fire.shared.onUserAdded(AppState.shared.addUser)
      Fire.shared.onMessageReceived(AppState.shared.onMessage)
      Fire.shared.onMessageUpdated(AppState.shared.onMessageUpdate)
      Fire.shared.onMessageDeleted(AppState.shared.onMessageDelete)
		}
		catch (e) {
      console.log("Server Error:" + e)
		}
    try {
      const jsonValue = await AsyncStorage.getItem('YourRollState')
      if (jsonValue != null) {
        const state = JSON.parse(jsonValue)
        if (state.version != '0.04') {
          AsyncStorage.clear()
          let notificationToken = await AppState.shared.registerForPushNotificationsAsync()
          let user = {
            id: notificationToken.replace("ExponentPushToken", "").replace("[","").replace("]",""),
          }
          Fire.shared.addUser(user)
          return
        }
        if (state.macros) {
          AppState.shared.macros = state.macros
        }
				if (state.messages) {
					AppState.shared.messages = state.messages
				}
        if (state.character) {
          AppState.shared.character = {...AppState.shared.character, ...state.character}
          if (AppState.shared.character.avatar) {
            BlobCache.shared.get(AppState.shared.character.avatar).then((res) => {
              AppState.shared.character.cachedAvatar = res
            })
          }
        }
        if (state.player) {
          AppState.shared.player = state.player
        }
      }
      else {
        //This is the first time we opened the app 
        //TODO first login stuff
        let notificationToken = await AppState.shared.registerForPushNotificationsAsync()
        let user = {
          id: notificationToken.replace("ExponentPushToken", "").replace("[","").replace("]",""),
        }
        Fire.shared.addUser(user)
      }
    }
    catch(e) {
      console.log("Loading Error:" + e)
    }
  }

  async saveState() {
    AppState.shared.recalculateStats(AppState.shared.character)
    let updateId = Fire.shared.uid
    if (updateId) {
      AppState.shared.player._id = updateId
    }
    let truncatedMessages = AppState.shared.messages.slice(0, 50)
    const state = {
      macros: AppState.shared.macros,
      character: AppState.shared.character,
			messages: truncatedMessages,
      version: '0.04',
      player: AppState.shared.player,
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

  recalculateStats(character) {
    //console.log("Recalculating stats")
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
