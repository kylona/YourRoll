import * as React from 'react';
import { Clipboard, Image, Keyboard, StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';
import Colors from '../constants/Colors.ts';
import RecordingPanel from '../components/RecordingPanel';
import AudioBubble from '../components/AudioBubble';
import Fire from '../util/Fire';
import ObjectFactory from '../util/ObjectFactory';
import ImagePicker from '../util/ImagePicker';
import AppState from '../util/AppState';
import MessageParser from '../util/MessageParser';
import BlobCache from '../util/BlobCache';
import useColorScheme from '../hooks/useColorScheme';
import { GiftedChat, Bubble, Composer, InputToolbar, Send } from '../components/ChatUI';
import { Ionicons } from '@expo/vector-icons';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import { TouchableOpacity } from 'react-native-gesture-handler'


export default function ChatScreen(props) {
  const [recordPanelEnabled, enableRecordPanel] = React.useState(false)
	const [attachedReply, attachReply] = React.useState(null)
	const [messages, setMessages] = React.useState([...AppState.shared.messages])
	const [isLoading, setLoading] = React.useState(false)
	const theme = useColorScheme();

  const keyboardWillShow = () => {
    enableRecordPanel(false)
  }

	React.useEffect(() => {
    const unsubscribeFocus = props.navigation.addListener('focus', () => {
			AppState.shared.unreadMessages = 0
      AppState.notificationsEnabled = false
    });
    const unsubscribeBlur = props.navigation.addListener('blur', () => {
      AppState.notificationsEnabled = true
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return () => {unsubscribeFocus(); unsubscribeBlur()};
  }, [props.navigation]);

	React.useEffect(() => {
    Keyboard.addListener("keyboardWillShow", keyboardWillShow)
    let unsubscribeAppState = AppState.shared.addListener(() => {
      setMessages([...AppState.shared.messages])
    })
    return () => {
      Fire.shared.offMessages()
      Keyboard.removeListener("keyboardWillShow", keyboardWillShow)
      unsubscribeAppState()
    }
	},[]);

  const sendAudioMessage = async (url) => {
    let audio = url
    let reply = null
    if (attachedReply) {
      reply = attachedReply._id
    }
    if (audio != null) {
      let message = ObjectFactory.createMessage({
        user: getUser(),
        audio: audio,
        reply: reply,
      })
      AppState.shared.sendMessages([message])
    }
  }

  const sendImageMessage = async (url) => {
		let image = url
		let reply = null
		if (attachedReply) {
			reply = attachedReply._id
		}
		if (image != null) {
      let message = ObjectFactory.createMessage( {
        user: getUser(),
        image: image,
        reply: reply,
      } )
      //await setMessages([...GiftedChat.insert(messages, message, 'timestamp')])
      AppState.shared.sendMessages([message])
		}
	}

	const sendTextMessage = async (messages) => {
		if (attachedReply) {
			messages[0].reply = attachedReply._id
		}
		attachReply(null)
    messages = MessageParser.parse(messages)
    let cleanMessages = []
    for ( let m in messages ) {
      cleanMessages.push(ObjectFactory.createMessage(messages[m]))
    }
    AppState.shared.sendMessages(cleanMessages)
	}

  const getUser = () => {
    const {name, avatar} = AppState.shared.character
    let id = Fire.shared.uid
		if (!id)  { //TODO don't rely on remembering uid
      id = AppState.shared.player._id
      //console.log("BLANK ID: " + AppState.shared.player._id)
    }
    return ({
      name: name,
      _id: id,
      avatar: avatar,
    })
  }

	const renderActions = (props) => {
    return (
      <View style={styles.action}>
        <TouchableOpacity 
					onPress={async () => {
						let image = await ImagePicker.pickImage()
            if (image == null) return
            let remoteImage = await Fire.shared.upload(image)
						sendImageMessage(remoteImage)
					}}
				>
          <Ionicons
            style={{alignSelf:'flex-start'}}
            name='md-camera'
            size={30}
            color={Colors[theme].textLight}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            Keyboard.dismiss()
            enableRecordPanel(!recordPanelEnabled)
          }}
        >
          <Ionicons
            style={{alignSelf:'flex-end', marginLeft: 15,}}
            name='md-mic'
            size={30}
            color={Colors[theme].textLight}
          />
        </TouchableOpacity>
      </View>
    )
  }	

  const renderAccessory = () => {
    if (attachedReply == null) return null
    let text = 'Replying to ' + attachedReply.user.name + ": " + attachedReply.text
    return (
      <View style={styles.accessory}>
        <Text numberOfLines={1} ellipsizeMode='tail' style={styles.replyText}>{text}</Text>
        <Image style={[styles.avatar, {marginRight: 10}]} source={{uri: attachedReply.image}}/>
        <TouchableOpacity 
          onPress={() => { attachReply(null)}}
          style= {{flex:0}}
        >
          <Ionicons
            name='md-close-circle'
            size={30}
            color={Colors[theme].textLight}/>
        </TouchableOpacity>
      </View>
    )
  }

	const renderMessageAudio = (props) => {
    let bubble = (
        <GestureRecognizer
          onSwipeRight={()=>{attachReply(props.currentMessage)}}>
          {getReplyBubble(props)}
          <View style={styles.audioBubble}>
            <TouchableOpacity onPress={() => {
              Recorder.shared.playAudio(props.currentMessage.audio)
            }}>
                <Ionicons name='ios-play' size={60} color={styleSheet.lightText}/>
            </TouchableOpacity>
          </View>
        </GestureRecognizer>
    );
    return bubble
  }

	const findReplyText = (replyId) => {
    if(!replyId) return ''
    for (let m in messages) {
      let message = messages[m]
      if (message._id == replyId) {
        let text = message.text
        if (!text) return ''
        if (text.length > 90) {
          text = text.substring(0, 80) + '...'
        }
        return text
      }
    }
  }

  const findReplyImage = (replyId) => {
    if(!replyId) return ''
    for (let m in messages) {
      let message = messages[m]
      if (message._id == replyId) {
        return message.image
      }
    }
  }

	const getReplyBubble = (props) => {
    let replyBubble = []
    let text = findReplyText(props.currentMessage.reply)
    if(text != '') {
      text = <Text style={styles.replyBubbleText}>{text}</Text>
    }
    else {
      text = null
    }
    if (props.currentMessage.reply) {
      if (props.currentMessage.user._id == getUser()._id) {
        let image = findReplyImage(props.currentMessage.reply)
        if(image) {
          image = <Image style={[styles.replyBubbleRight, {height: 60, marginLeft:0, marginTop:0, opacity:0.5,}]} source={{uri: image}}/>
        }
        replyBubble.push(
            <View key={props.currentMessage.id} style={styles.replyBubbleRight}>
              {text}
							{image}
            </View>
        )
      }
      else {
        let image = findReplyImage(props.currentMessage.reply)
        if(image) {
          image = <Image style={[styles.replyBubbleLeft, {height: 60, marginLeft:0, marginTop:0, opacity:0.5,}]} source={{uri: image}}/>
        }
        replyBubble.push(
            <View key={props.currentMessage.id} style={styles.replyBubbleLeft}>
              {text}
							{image}
            </View>
        )
      }
    }
    return replyBubble
  }

	const getDiceBubble = (props) => {
    if (!props.currentMessage.rolls) return null
    let diceBubble = []
    let text = props.currentMessage.rolls
    if(text != '') {
      text = <Text style={styles.diceBubbleText}>{text}</Text>
    }
    else {
      text = null
    }
    if (props.currentMessage.user._id == getUser()._id) {
      diceBubble.push(
          <View key={props.currentMessage.id} style={styles.diceBubbleRight}>
            {text}
          </View>
      )
    }
    else {
      diceBubble.push(
          <View key={props.currentMessage.id} style={styles.diceBubbleLeft}>
            {text}
          </View>
      )
    }
    return diceBubble
  }

  const setLongPress = (props) => {
    let lpActions = [] 
    let actionMap = []
    actionMap.push(()=>{attachReply(props.currentMessage)})
    lpActions.push("Reply")
    if (props.currentMessage && props.currentMessage.text) {
      actionMap.push( (message) => {Clipboard.setString(message.text)})
      lpActions.push("Copy Text")
    }
    if (props.currentMessage.user._id == getUser()._id) { //if the user wrote the message
      actionMap.push( (message) => {
        Fire.shared.deleteMessage(message)
      })
      lpActions.push("Delete")
    }
    actionMap.push( () => {})
    lpActions.push("Cancel")

    props.onLongPress = (context, message) => {
      context.actionSheet().showActionSheetWithOptions({
        options: lpActions,
        cancelButtonIndex: lpActions.length - 1
      }, (buttonIndex) => {
        actionMap[buttonIndex](message)
      })
    }

    return props 
  }

	const renderBubble = (props) => {
    let lpProps = setLongPress(props)
    let bubble = (
        <GestureRecognizer
          onSwipeRight={()=>{attachReply(props.currentMessage)}}
        >
          {getReplyBubble(props)}
          <Bubble {...props}/>
          {getDiceBubble(props)}
        </GestureRecognizer>
    );
    return bubble;
  }

  const renderAudioBubble = (props) => {
    return <AudioBubble {...props} />
  }
  
	const renderInputToolbar = (props) => {
    let accessoryBar = renderAccessory()
    return (
      <View style={styles.inputField(attachedReply != null)}>
        {accessoryBar}
        <InputToolbar {...props} containerStyle={styles.inputBar}/>
      </View>
    )
  }

	const renderComposer = (props) => {
    return (
      <Composer {...props} placeholderTextColor={Colors['dark'].textLight} textInputStyle={styles.composer}/>
    )
  }

	const renderSend = (props) => {
		let newProps = {...props}
	  newProps.containerStyle = styles.send
		return (
			<Send {...newProps}/>
		)
	}
  return (
    <View style={styles.giftedContainer}>
			<GiftedChat
				messages={messages}
				onSend={sendTextMessage}
				user={getUser()}
				renderUsernameOnMessage={true}
				showUserAvatar={true}
				loadEarlier={true}
				isLoadingEarlier={isLoading}
				infiniteScroll={true}
				renderActions={(props) => renderActions(props)}
				renderInputToolbar={(props) => renderInputToolbar(props)}
				renderComposer={renderComposer}
				renderSend={renderSend}
				renderMessageAudio={(props) => renderAudioBubble(props)}
				renderBubble={(props) => renderBubble(props)}
        bottomOffset={Platform.OS =='ios' ? 30 : -5}
				onLoadEarlier={async () => {
					if(isLoading) return
					setLoading(true)
          await AppState.shared.loadEarlierMessages()
					setLoading(false)
				}}
			/>
      <RecordingPanel 
        enabled={recordPanelEnabled}
        onFinishedRecording={async (uri) => {
					const url = await Fire.shared.upload(uri)
          sendAudioMessage(url)
        }}
      />
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftedContainer: {
    height: '100%',
    width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors['dark'].textDark,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  textWrapper: {
    flex: 0,
    backgroundColor: Colors['dark'].primaryLight,
    margin: 10,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
	avatar: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  replyText: {
    width: '80%',
    margin: 5,
    color: Colors['dark'].textLight
  },
	action: {
    flexDirection: 'row',
    width: 60,
    height: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 10,
    paddingRight: 10,
    marginLeft: -100,
    backgroundColor: Colors['dark'].primaryDark,
  },
  accessory: {
    flexDirection: 'row',
    width: '100%',
    height: 44,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: Colors['dark'].primaryDark,
    paddingRight:30,
  },
  composer: {
    color: Colors['dark'].textLight,
    marginLeft: 30,
  },
	inputBar: {
    backgroundColor: Colors['dark'].primaryDark,
    borderTopLeftRadius: 25,
    borderBottomLeftRadius: 25,
    borderColor: Colors['dark'].primaryDark,
    borderWidth: 3,
    marginLeft: 80,
    paddingLeft: 20,
    width: '100%',
  },
	send: {
		marginRight: 80,
    backgroundColor: Colors['dark'].primaryDark,
  },
	inputField: (acc) => {return( {
    backgroundColor: Colors['dark'].primaryDark,
    width:'100%',
    height: acc ? 90 : 48,
    marginTop: acc ? -42 : null,
  })},
	diceBubbleRight: {
    width: 200,
    alignSelf: 'flex-end',
    justifyContent: 'flex-start',
    backgroundColor: Colors['dark'].primaryLight,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
		margin: 5,
    paddingTop: 15,
    marginTop: -15,
    zIndex: -1,
  },
  diceBubbleLeft: {
    width: 200,
    alignSelf: 'flex-start',
    justifyContent: 'flex-start',
    backgroundColor: Colors['dark'].accentDark,
    borderTopRightRadius: 10,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
		margin: 5,
    paddingTop: 15,
    marginTop: -15,
    zIndex: -1,
  },
	replyBubbleRight: {
    width: 200,
    justifyContent: 'flex-start',
    backgroundColor: Colors['dark'].primary,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
    borderTopRightRadius: 10,
		margin: 10,
    paddingBottom: 15,
    marginBottom: -15,
    zIndex: -1,
  },
  replyBubbleLeft: {
    width: 200,
    justifyContent: 'flex-start',
    backgroundColor: Colors['dark'].primary,
    borderTopLeftRadius: 10,
    borderBottomRightRadius: 10,
    borderTopRightRadius: 10,
		margin: 5,
    paddingBottom: 15,
    marginBottom: -15,
    zIndex: -1,
  },
	diceBubbleText: {
    margin: 5,
    color: Colors['dark'].textDark,
    opacity: 0.8,
  },
	replyBubbleText: {
    margin: 5,
    color: Colors['dark'].textLight,
    opacity: 0.8,
  },
});

