import React from 'react';
import Constants from 'expo-constants';
import * as ImagePicker from 'expo-image-picker';
import * as Permissions from 'expo-permissions';
import { ScrollView } from 'react-native-gesture-handler';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import { GiftedChat, Bubble, Composer, InputToolbar } from 'react-native-gifted-chat'; // 0.3.0
import { View, Text, Image } from 'react-native';
import CachedImage from '../components/CachedImage';
import ImageCache from '../ImageCache.js';
import { Ionicons } from '@expo/vector-icons';
import styleSheet from '../styleSheet.js';
import { TouchableOpacity } from 'react-native-gesture-handler';
import Fire from '../Fire';
import ImagePickUtil from '../ImagePickUtil.js';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';





export default class Chat extends React.Component<Props> {

  constructor(props) {
    super(props)
		this.recording = null,
		this.sound = null,
    this.state = {
      messages: [],
      isLoading: false,
			isRecording: false,
      attachedReply: null,
      attachedAudio: null,
			haveRecordingPermisions: false,
    };
  }


	askForPermissions = async () => {
    const response = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    this.setState({
      haveRecordingPermissions: response.status === 'granted',
    });
  };


	async startRecording() {
		if (this.state.isRecording) return
		if (this.sound != null) {
			await this.sound.unloadAsync();
			this.sound.setOnPlaybackStatusUpdate(null);
			this.sound = null;
		}
		await this.askForPermissions();	
		await Audio.setAudioModeAsync({
				allowsRecordingIOS: true,
				interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
				playsInSilentModeIOS: true,
				shouldDuckAndroid: true,
				interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
				playThroughEarpieceAndroid: false,
				staysActiveInBackground: true,
			});
			const recording = new Audio.Recording();
			await recording.prepareToRecordAsync(this.recordingSettings);
			//recording.setOnRecordingStatusUpdate(this._updateScreenForRecordingStatus);

			this.recording = recording;
			this.setState({isRecording: true})
			await this.recording.startAsync(); // this._updateScreenForRecordingStatus to update the scree
	}


	async stopRecording() {

		try {
      await this.recording.stopAndUnloadAsync();
    } catch (error) {
      // Do nothing -- we are already unloaded.
    }
		this.setState({isRecording: false})
		const info = await FileSystem.getInfoAsync(this.recording.getURI());
    //console.log(`FILE INFO: ${JSON.stringify(info)}`);
		let name = 'AudioRecording_' + Math.random().toString(36).substr(2, 9)
		let audioURL = await Fire.shared.uploadAudio(this.recording.getURI(), name)
		this.sendAudioMessage(audioURL)
	}

	async sendAudioMessage(url) {
		let audio = url
		let reply = null
		const newId = 'Message_' + Math.random().toString(36).substr(2, 9)
		if (this.state.attachedReply) {
			reply = this.state.attachedReply.id
		}
		if (audio != null) {
			let message = {id:newId, text: '', user:this.user, image: null, audio: audio, reply: reply}
			Fire.shared.sendMessages([message])
		}
	}

	async playAudio(url) {

		await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      playsInSilentModeIOS: true,
      playsInSilentLockedModeIOS: true,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DO_NOT_MIX,
      playThroughEarpieceAndroid: false,
      staysActiveInBackground: true,
    });
		const sound = new Audio.Sound();
    await sound.loadAsync({uri: url});
    this.sound = sound
		this.sound.playAsync();
	}

	get user() {
    let name = GLOBALS.characterBank.state.activeCharacter
    let id = Fire.shared.uid
    let avatar = GLOBALS.characterBank.getActive().charToken
    if (!name) name = "Anonymous"
    if (!id) id = "BlankID"
    return ({
      name: name,
      _id: id,
      avatar: avatar,
    })
  }

  rollDice(size) {
    return (Math.floor(((Math.random() + 0.2) * 10000)) % size) + 1
  }

  parseDiceRolls(string, messages) {
    let diceRolls = string.match(/\b\d*d\d+/g)
    for (let r in diceRolls) {
      let numDsize = diceRolls[r].split('d')
      if (numDsize[0] == '') numDsize[0] = '1'
      let number = parseInt(numDsize[0])
      let dice = parseInt(numDsize[1])
      if (isNaN(dice) || isNaN(number)) {
        console.log("Invalid numDsize: " + numDsize)
        return messages
      }
      let count = 0
      let toWrite = diceRolls[r] + ' -> ['
      let sum = 0
      while(count < number){
        let roll = this.rollDice(dice)
        sum += roll
        if ((count == 11 && number - count > 10)) {
          toWrite += ' + . . . '
        }
        if (count < 10 || number - count < 10) {
          if (count != 0) toWrite += ' + '
          toWrite += roll 
        }
        count = count + 1
      }
      toWrite += '] = ' + sum
      const newId = 'Message_' + Math.random().toString(36).substr(2, 9)
      let rollMessage = {
        _id: messages[0]._id,
        id: newId,
        createdAt: messages[0].createdAt,
        text: toWrite,
        user: {_id: "NOVA_RPG_DICE_ROLLER", name: "Dice Roller", avatar: "https://i.pinimg.com/originals/1e/15/88/1e15881f6e57c883f0cd394381ac7249.jpg"},
        reply: messages[0].id || null,
      }
      messages.push(rollMessage)
    }
    return messages
  } 

  processBlings(string) {
    let blingWrapped = string.match(/\$[a-z\d-]+/g)
    if (blingWrapped == null || blingWrapped.length == 0) return string
    for (let b in blingWrapped) {
      let bling = blingWrapped[b].toLowerCase().replace(/\s/,'').replace('$','')
      if (GLOBALS.character.getStat(bling) != null){
        string = string.replace(blingWrapped[b].replace(/\s/,''), GLOBALS.character.getStat(bling))
      }
    }
    return string
  }

  processDiceClass(string) {
    let dcWrapped = string.match(/(^|\s)(dc\d+)/g)
    if (dcWrapped == null || dcWrapped.length == 0) return string
    for (let b in dcWrapped) {
      let dc = dcWrapped[b].toLowerCase().replace(/\s/,'').replace('dc','')
      if (dc == '-1'){
        string = string.replace(dcWrapped[b].replace(/\s/,''), 'd1')
      }
      if (dc == '0'){
        string = string.replace(dcWrapped[b].replace(/\s/,''), 'd4')
      }
      if (dc == '1'){
        string = string.replace(dcWrapped[b].replace(/\s/,''), 'd6')
      }
      if (dc == '2'){
        string = string.replace(dcWrapped[b].replace(/\s/,''), 'd8')
      }
      if (dc == '3'){
        string = string.replace(dcWrapped[b].replace(/\s/,''), 'd10')
      }
      if (dc == '4'){
        string = string.replace(dcWrapped[b].replace(/\s/,''), 'd12')
      }
      if (dc == '5'){
        string = string.replace(dcWrapped[b].replace(/\s/,''), 'd20')
      }
      if (dc == '6'){
        string = string.replace(dcWrapped[b].replace(/\s/,''), '2d20kh')
      }
    }
    return string
  }

  renderActions(self, props) {
    return (
      <View style={styles.action}>
        <TouchableOpacity onPress={async () => {
          let image = await ImagePickUtil.pickImage()
          let reply = null
					const newId = 'Message_' + Math.random().toString(36).substr(2, 9)
          if (this.state.attachedReply) {
            reply = this.state.attachedReply.id
          }
          if (image != null) {
            let message = {id: newId, text: '', user:self.user, image: image, reply: reply}
            Fire.shared.sendMessages([message])
          }
        }}>
          <Ionicons style={{alignSelf:'flex-start'}} name='md-camera' size={30} color={styleSheet.lightText}/>
        </TouchableOpacity>
        <TouchableOpacity onPress={async () => {
					if (this.state.isRecording) {
						await this.stopRecording()
					}
					else {
						await this.startRecording()
					}
        }}>
          <Ionicons 
						style={{alignSelf:'flex-end', marginLeft: 10,}}
						 name='md-mic' 
						size={30} color={this.state.isRecording ? 'red' : styleSheet.lightText}/>
        </TouchableOpacity>
      </View>
    )
  }

  renderAccessory() {
    if (this.state.attachedReply == null) return null
    let text = 'Replying to ' + this.state.attachedReply.user.name + ": " + this.state.attachedReply.text
    if (text.length > 45) {
      text = text.substring(0, 45) + '...'
    }
    return (
      <View style={styles.accessory}>
        <Text style={styles.replyText}>{text}</Text>
        <Image style={[styles.avatarStyle, {marginRight: 10}]} source={{uri: this.state.attachedReply.image}}/>
        <TouchableOpacity onPress={() => {
          this.setState({attachedReply: null})
        }}>
          <Ionicons name='md-close-circle' size={30} color={styleSheet.lightText}/>
        </TouchableOpacity>
      </View>
    )
  }


  renderMessageAudio(self, props) {
    let bubble = (
        <GestureRecognizer  
          onSwipeRight={()=>{this.setState({attachedReply: props.currentMessage})}}>
          {this.getReplyBubble(props)}
					<View style={styles.audioBubble}>
						<TouchableOpacity onPress={() => {
							this.playAudio(props.currentMessage.audio)
						}}>
								<Ionicons name='ios-play' size={60} color={styleSheet.lightText}/>
						</TouchableOpacity>
					</View>
        </GestureRecognizer>
    );
    return bubble
  }

	getReplyBubble(props) {
    let replyBubble = []
    let text = this.findReplyText(props.currentMessage.reply)
    if(text != '') {
      text = <Text style={styles.replyBubbleText}>{text}</Text>
    }
    else {
      text = null
    }
    if (props.currentMessage.reply) {
      if (props.currentMessage.user._id == this.user._id) {
        let image = this.findReplyImage(props.currentMessage.reply)
        if(image) {
          image = <Image style={[styles.replyBubbleRight, {height: 60, opacity:0.5}]} source={{uri: image}}/>
        }
        replyBubble.push(
            <View style={styles.replyBubbleRight}>
              {[text, image]}
            </View>
        )
      }
      else {
        let image = this.findReplyImage(props.currentMessage.reply)
        if(image) {
          image = <Image style={[styles.replyBubbleLeft, {height: 40}]} source={{uri:image}}/>
        }
        replyBubble.push(
            <View style={styles.replyBubbleLeft}>
              {[text, image]}
            </View>
        )
      }
    }
		return replyBubble
	}

  renderBubble(props) {
    let bubble = (
        <GestureRecognizer  
          onSwipeRight={()=>{this.setState({attachedReply: props.currentMessage})}}>
          {this.getReplyBubble(props)}
          <Bubble {...props}/>
        </GestureRecognizer>
    );
    return bubble;
  }

  renderInputToolbar(self, props) {
    let accessoryBar = [self.renderAccessory()]
    return (
      <View style={styles.inputField(this.state.attachedReply != null)}>
        {accessoryBar}
        <InputToolbar {...props} containerStyle={styles.inputBar}/>
      </View>
    )
  }

  renderComposer(props) {
    return (
      <Composer {...props} textInputStyle={styles.composer}/>
    )
  }

  findReplyText(replyId) {
    if(!replyId) return ''
    for (let m in this.state.messages) {
      let message = this.state.messages[m]
      if (message.id == replyId) {
        let text = message.text
        if (text.length > 90) {
          text = text.substring(0, 80) + '...'
        }
        return text
      }
    }
  }

  findReplyImage(replyId) {
    if(!replyId) return ''
    for (let m in this.state.messages) {
      let message = this.state.messages[m]
      if (message.id == replyId) {
        return message.image
      }
    }
  }

  render() {
    return (
      <View style={styles.giftedChatContainer}>
        <GiftedChat
          style={styles.giftedChat}
          messages={this.state.messages}
          onSend={(messages) => {
            messages[0].id = 'Message_' + Math.random().toString(36).substr(2, 9)
            messages[0].text = this.processBlings(messages[0].text, messages)
            messages[0].text = this.processDiceClass(messages[0].text, messages)
            if (this.state.attachedReply) {
              messages[0].reply = this.state.attachedReply.id
            }
            else {
              messages[0].reply = null
            }
            this.setState({attachedReply: null})
            messages = this.parseDiceRolls(messages[0].text, messages)
            Fire.shared.sendMessages(messages)
          }}
          user={this.user}
          renderUsernameOnMessage={true}
          showUserAvatar={true}
          loadEarlier={true}
          isLoadingEarlier={this.state.isLoading}
          infiniteScroll={true}
          renderActions={(props) => this.renderActions(this, props)}
          renderInputToolbar={(props) => this.renderInputToolbar(this, props)}
          renderComposer={this.renderComposer}
					renderMessageAudio={(props) => this.renderMessageAudio(this, props)}
          renderBubble={(props) => this.renderBubble(props)}
          onLoadEarlier={() => {
            if(this.state.isLoading) return
            this.state.isLoading = true
            this.setState({isLoading: true}, () => {
              let earliestMessage = this.state.messages[0]
              for (let m in this.state.messages) {
                earliestMessage = this.state.messages[m].timestamp < earliestMessage.timestamp ? this.state.messages[m] : earliestMessage
              }
              Fire.shared.loadEarlierMessages(earliestMessage, message => {
                  if (this.state.messages.includes(message)) return
                  this.setState(previousState => ({
                    messages: GiftedChat.prepend(previousState.messages, message),
                    isLoading: false
                  }))
                }
              )
            })
          }}
        />
      </View>
    );
  }

  componentDidMount() {
    GLOBALS.chat = this
    Fire.shared.onMessage(message => {
        if (message.user.avetar) {
          ImageCache.shared.getCachedImage(message.user.avatar).then((res) => {
            message.user.avatar = res
            if(message.image) {
              ImageCache.shared.getCachedImage(message.image).then((res) => {
                message.image = res
                this.setState(previousState => ({
                  messages: GiftedChat.append(previousState.messages, message),
                }))
              })
            }
            else {
              this.setState(previousState => ({
                messages: GiftedChat.append(previousState.messages, message),
              }))
            }
          })
        }
        else if (message.image) {
          ImageCache.shared.getCachedImage(message.image).then((res) => {
            message.image = res
            this.setState(previousState => ({
              messages: GiftedChat.append(previousState.messages, message),
            }))
          })
        }
        else {
          this.setState(previousState => ({
            messages: GiftedChat.append(previousState.messages, message),
          }))
        }
      }
    );
  }

  componentWillUnmount() {
    Fire.shared.offMessages();
  }
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  contentContainer: {
    paddingTop: 15,
  },
	avatarStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  replyText: {
    margin: 5,
    color: styleSheet.lightText
  },
  replyBubbleText: {
    margin: 5,
    color: '#fff'
  },
  replyBubbleRight: {
    width: 200,
    justifyContent: 'flex-start',
    backgroundColor: styleSheet.background,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingBottom: 15,
    marginBottom: -15,
    zIndex: -1,
  },
  replyBubbleLeft: {
    width: 200,
    justifyContent: 'flex-start',
    backgroundColor: styleSheet.background,
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
    paddingBottom: 15,
    marginBottom: -15,
    zIndex: -1,
  },
  accessory: {
    flexDirection: 'row',
    width: '100%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: styleSheet.background,
    paddingRight:30,
  },
  action: {
    flexDirection: 'row',
    width: 60,
    height: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 10,
    paddingRight: 10,
    marginLeft: -80,
    backgroundColor: styleSheet.backgroundDark,
  },
  giftedChatContainer: {
    width: '100%',
    height: '100%',
    backgroundColor: styleSheet.backgroundDark
  },
  inputBar: {
    backgroundColor: styleSheet.background,
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
    borderColor: styleSheet.backgroundDard,
    borderWidth: 3,
    marginLeft: 80,
    paddingleft: 20,
  },
  inputField: (acc) => {return( {
    backgroundColor: styleSheet.backGroundDark,
    width:'100%',
    height: acc ? 90 : 48,
    marginTop: acc ? -42 : null,
  })},
  composer: {
    color: styleSheet.lightText,
    marginLeft: 30,
  },
	audioBubble: {
		width: 100,
		height: 60,
		backgroundColor: styleSheet.accent1,
		borderRadius: 15,
		justifyContent: 'center',
		alignItems: 'center',
	},
}

