import * as React from 'react';
import { View, TouchableOpacity, Clipboard, Dimensions, Image, Keyboard, ScrollView, StyleSheet, Vibration } from 'react-native';
import { Text } from '../components/Themed';
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
import { GiftedChat, Bubble, Message, Composer, InputToolbar, Send} from '../components/ChatUI';
import TypingIndicator from '../components/ChatUI/TypingIndicator.js'
import { Ionicons } from '@expo/vector-icons';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import ReactionsPanel from '../components/ReactionPanel';
import ReactionsDisplay from '../components/ReactionDisplay';
import TurnTracker from '../components/TurnTracker';
import AutoComplete from '../components/AutoComplete';
import oofReact from '../assets/images/oof.png';
import komReact from '../assets/images/kombucha.png';
import tudReact from '../assets/images/ThumbsUpDrake.png';
import tddReact from '../assets/images/ThumbsDownDrake.png';
import ccrReact from '../assets/images/CatCry.png';
import leoReact from '../assets/images/leomeme.png';
import mfcReact from '../assets/images/monkeyface.png';
import lolReact from '../assets/images/Lol.png';
import lvmReact from '../assets/images/LoveMeme.png';


export default function ChatScreen(props) {
  const [composeText, setComposeText] = React.useState("")
  const [recordPanelEnabled, enableRecordPanel] = React.useState(false)
	const [attachedReply, attachReply] = React.useState(null)
	const [messages, setMessages] = React.useState([...AppState.shared.messages])
  const [users, setUsers] = React.useState([...AppState.shared.users])
  const [typing, setTyping] = React.useState(AppState.shared.typing)
  const [selectedMessage, selectMessage] = React.useState(null)
  const [reactPanelPos, setReactPanelPos] = React.useState(null)
  const [reactDisplayPos, setReactDisplayPos] = React.useState(null)
	const [isLoading, setLoading] = React.useState(false)
  const [keyboardUp, setKeyboardUp] = React.useState(false)
	const theme = useColorScheme();

  const keyboardWillShow = () => {
    enableRecordPanel(false)
    setKeyboardUp(true)
  }
  const keyboardDidShow = () => {
    Fire.shared.sendTyping(ObjectFactory.createTyping(AppState.shared))
    setKeyboardUp(true)
  }
  const keyboardDidHide = () => {
    Fire.shared.deleteTyping(ObjectFactory.createTyping(AppState.shared))
    setKeyboardUp(false)
  }
  const keyboardWillHide = () => {
    setKeyboardUp(false)
  }

	React.useEffect(() => {
    const unsubscribeFocus = props.navigation.addListener('focus', () => {
			AppState.shared.unreadMessages = 0
      AppState.shared.notificationsEnabled = false
      Fire.shared.deleteTyping(ObjectFactory.createTyping(AppState.shared))
      console.log("DISABLING NOTIFICATIONS")
    });
    const unsubscribeBlur = props.navigation.addListener('blur', () => {
      AppState.shared.notificationsEnabled = true
      console.log("ENABLING NOTIFICATIONS")
    });

    // Return the function to unsubscribe from the event so it gets removed on unmount
    return () => {unsubscribeFocus(); unsubscribeBlur()};
  }, [props.navigation]);

	React.useEffect(() => {
    Keyboard.addListener("keyboardWillShow", keyboardWillShow)
    Keyboard.addListener("keyboardDidShow", keyboardDidShow)
    Keyboard.addListener("keyboardDidHide", keyboardDidHide)
    Keyboard.addListener("keyboardWillHide", keyboardWillHide)
    let unsubscribeAppState = AppState.shared.addListener(() => {
      setMessages([...AppState.shared.messages])
      setUsers([...AppState.shared.users])
      setTyping({...AppState.shared.typing})
    })
    return () => {
      Fire.shared.offMessages()
      Keyboard.removeListener("keyboardWillShow", keyboardWillShow)
      Keyboard.removeListener("keyboardDidShow", keyboardDidShow)
      Keyboard.removeListener("keyboardDidHide", keyboardDidHide)
      Keyboard.removeListener("keyboardWillHide", keyboardWillHide)
      unsubscribeAppState()
    }
	},[]);

  const sendAudioMessage = async (url) => {
    let audio = url
    let reply = null
    if (attachedReply) {
      reply = attachedReply.id
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
			reply = attachedReply.id
		}
		if (image != null) {
      let message = ObjectFactory.createMessage( {
        user: getUser(),
        image: image,
        reply: reply,
      } )
      await setMessages([...GiftedChat.insert(messages, message, 'timestamp')])
      AppState.shared.sendMessages([message])
		}
	}

	const sendTextMessage = async (messages) => {
		if (attachedReply) {
			messages[0].reply = attachedReply.id
		}
		attachReply(null)
    messages = MessageParser.parse(messages)
    let cleanMessages = []
    for ( let m in messages ) {
      cleanMessages.push(ObjectFactory.createMessage(messages[m]))
    }
    AppState.shared.sendMessages(cleanMessages)
	}

  const getUser = () => { //TODO ObjectFactory to create user Object
    return ObjectFactory.createUser(AppState.shared)
  }

	const renderActions = (props) => {
    return ( <View style={styles.action}>
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
      if (message.id == replyId) {
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
      if (message.id == replyId) {
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


  const showActionSheet = (message, context) => {
    let lpActions = [] 
    let actionMap = []
    if (message && message.text) {
      actionMap.push( (message) => {Clipboard.setString(message.text)})
      lpActions.push("Copy Text")
    }
    if (message.user._id == getUser()._id) { //if the user wrote the message
      actionMap.push( (message) => {
        Fire.shared.deleteMessage(message)
      })
      lpActions.push("Delete")
    }
    actionMap.push( () => {})
    lpActions.push("Cancel")
    context.actionSheet().showActionSheetWithOptions({
      options: lpActions,
      cancelButtonIndex: lpActions.length - 1
    }, (buttonIndex) => {
      actionMap[buttonIndex](message)
    })
  }

  const setLongPress = (props) => {
    props.onLongPress = (context, message) => {
      message.context = context
      selectMessage(message)
      if (props.marker.current) {
         props.marker.current.measure((x, y, width, height, pageX, pageY) => {
           console.log("x is", x)
           let maxY = Dimensions.get('window').height - 90
           let posY = pageY < 153 ? 153 : pageY > maxY ? maxY : pageY
           setReactPanelPos({x: pageX, y: posY})
         })
      }
    }
    return props 
  }

  const getReactionIndicator = (props) => {
    let reactionText = ""
    if (props.currentMessage.reactions) {
      for (let r in props.currentMessage.reactions) {
        reactionText = reactionText + props.currentMessage.reactions[r].reaction
      }
      /*
      let numReactions = Object.values(props.currentMessage.reactions).length
      if (numReactions > 1) {
        reactionText = reactionText + " " + numReactions + " "
      }
      */
    }
    if (reactionText == "") return null
    let riStyle = styles.reactionsIndicatorLeft
    if (props.currentMessage.user._id == getUser()._id) {
      riStyle = styles.reactionsIndicatorRight
    }
		let oofs = []
    while(reactionText.includes("oof")) {
      reactionText = reactionText.replace("oof", "")
      oofs.push(<Image key={Math.random()} style={styles.oof} source={oofReact}/>)
    }
    while(reactionText.includes("kombucha")) {
      reactionText = reactionText.replace("kombucha", "")
      oofs.push(<Image key={Math.random()} style={styles.oof} source={komReact}/>)
    }
    while(reactionText.includes("monkeyface")) {
      reactionText = reactionText.replace("monkeyface", "")
      oofs.push(<Image key={Math.random()} style={styles.oof} source={mfcReact}/>)
    }
    while(reactionText.includes("👍")) {
      reactionText = reactionText.replace("👍", "")
      oofs.push(<Image key={Math.random()} style={styles.oof} source={tudReact}/>)
    }
    while(reactionText.includes("👎")) {
      reactionText = reactionText.replace("👎", "")
      oofs.push(<Image key={Math.random()} style={styles.oof} source={tddReact}/>)
    }
    while(reactionText.includes("😭")) {
      reactionText = reactionText.replace("😭", "")
      oofs.push(<Image key={Math.random()} style={styles.oof} source={ccrReact}/>)
    }
    while(reactionText.includes("😎")) {
      reactionText = reactionText.replace("😎", "")
      oofs.push(<Image key={Math.random()} style={styles.oof} source={leoReact}/>)
    }
    /*
    while(reactionText.includes("😂")) {
      reactionText = reactionText.replace("😂", "")
      oofs.push(<Image key={Math.random()} style={styles.oof} source={lolReact}/>)
    }
    while(reactionText.includes("😍")) {
      reactionText = reactionText.replace("😍", "")
      oofs.push(<Image key={Math.random()} style={styles.oof} source={lvmReact}/>)
    }
    */
    return (
      <TouchableOpacity
        style={riStyle}
        onPress={() => {
         props.marker.current.measure((x, y, width, height, pageX, pageY) => {
           let maxY = Dimensions.get('window').height - 410
           let posY = pageY < 143 ? 143 : pageY > maxY ? maxY : pageY
           setReactDisplayPos({x: pageX, y: posY})
         })
         selectMessage(props.currentMessage)
        }}
      >
				{oofs}
        <Text style={styles.reactionEmojiFont}>{reactionText}</Text>
      </TouchableOpacity>
    )
  }

  const getReadIndicator = (props) => {
    let readPics = []
    for (let user of AppState.shared.users) {
      if (user.id == Fire.shared.uid) continue
      if (user.lastReadMessageId == props.currentMessage.id) {
        readPics.push (
          <Image key={Math.random()} style={styles.oof} source={{uri: user.avatar}}/>
        )
      }
    }
    if (readPics == []) return null
    return (
      <View style={styles.readIndicator} >
				{readPics}
      </View>
    )
  }

  const renderMessage = (props) => {
    props.users = users
    return (
      <View style={{flex:0}}
        key={props}
      >
        <Message {...props}/>
        {getReadIndicator(props)}
      </View>
    )
  }

	const renderBubble = (props) => {
    let lpProps = setLongPress(props)
		props.marker = React.createRef(null);
    let bubble = (
        <View style={{flex:0}}
					ref={props.marker}
          onLayout={() => {}}
        >
          {getReplyBubble(props)}
          <Bubble {...props}/>
          {getDiceBubble(props)}
          {getReactionIndicator(props)}
        </View>
    );
    return bubble;
  }

  const renderAudioBubble = (props) => {
    return <AudioBubble {...props} />
  }


  const renderAttachedReply = () => {
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

  const renderAutoComplete = () => {
    let parCom = MessageParser.getPartialCommand(composeText) 
    let guesses = MessageParser.getPartialCommandGuesses(parCom)
    if (!keyboardUp || guesses.findIndex((e) => {return e == parCom}) != -1 || guesses.length == 0) return {autoComplete: null, acHeight: 0}
    let guessViews = []
    let acHeight = 0
    return {
      autoComplete: (
        <AutoComplete
          guesses={guesses}
          height={120}
          onHeightChange={(height) => {acHeight = height}}
          onAutoComplete={(guess) => {
            setComposeText(composeText.replace(parCom,guess))
          }}
        />
      ),
      acHeight: 120
    }
  }

  
	const renderInputToolbar = (props) => {
    let attachedReply = renderAttachedReply()
    let {autoComplete, acHeight} = renderAutoComplete()
    let accHeight = attachedReply != null ? 42 : 0
    accHeight += acHeight
    props.text = composeText
    return (
      <View style={styles.inputField(accHeight)}>
        {autoComplete}
        {attachedReply}
        <InputToolbar {...props} containerStyle={styles.inputBar} renderComposer={renderComposer}/>
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
        onInputTextChanged={(text) => {setComposeText(text)}}
				user={getUser()}
				renderUsernameOnMessage={true}
				showUserAvatar={true}
				loadEarlier={true}
				isLoadingEarlier={isLoading}
				infiniteScroll={true}
				renderActions={(props) => renderActions(props)}
				renderInputToolbar={(props) => renderInputToolbar(props)}
				renderSend={renderSend}
				renderMessage={(props) => renderMessage(props)}
				renderMessageAudio={(props) => renderAudioBubble(props)}
				renderBubble={(props) => renderBubble(props)}
        bottomOffset={Platform.OS =='ios' ? 45 : -5}
        renderFooter={() => {return (
          <View style={{width:'100%', height:30}}>
            <TypingIndicator isTyping={typing}/>
          </View> 
          )
        }}
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
      <View pointerEvents='box-none' style={styles.header}>
        <TurnTracker/>
      </View>
      <View pointerEvents='box-none' style={styles.overlay}>
        <ReactionsPanel
         pos={reactPanelPos}
         dismissPressed={() => {
          setReactPanelPos(null)
         }}
         replyPressed={() => {
          attachReply(selectedMessage)
          setReactPanelPos(null)
         }}
         reactionPressed={(reaction) => {
           let message = selectedMessage
           let user = getUser()
           if (!message.reactions) {
              message.reactions = {}
           }
           if (message.reactions[user._id] && message.reactions[user._id].reaction == reaction) {
             //Toggle if you react the same way twice
             delete message.reactions[user._id]  
           }
           else {
             message.reactions[user._id] = {
               user: user,
               reaction: reaction
             }
           }
           AppState.shared.updateMessage(ObjectFactory.updateMessage(message))
           setReactPanelPos(null)
         }}
         morePressed={() => {
           showActionSheet(selectedMessage, selectedMessage.context)
           setReactPanelPos(null)
         }}
        />
        <ReactionsDisplay
         pos={reactDisplayPos}
         reactions={selectedMessage ? selectedMessage.reactions : null}
         dismissPressed={() => {
          setReactDisplayPos(null)
         }}
        />
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    position:'absolute',
    top: 0,
    width: '100%',
  },
  overlay: {
    position:'absolute',
    width: '100%',
    height: '100%',
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
    width: 80,
    height: 40,
    alignItems: 'center',
    justifyContent: 'flex-start',
    alignSelf: 'flex-start',
    paddingLeft: 10,
    paddingRight: 10,
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
    backgroundColor: Colors['dark'].primary,
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
    backgroundColor: Colors['dark'].primaryDark,
  },
	inputField: (accHeight) => {return( {
    backgroundColor: Colors['dark'].primaryDark,
    width:'100%',
    height: 48 + accHeight,
    marginTop: -accHeight,
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
  reactionsIndicatorRight: {
    flex: 0,
		flexDirection: 'row',
    backgroundColor: Colors['dark'].primary,
    alignSelf: 'flex-end',
    alignContent: 'center',
    marginTop: -5,
    marginRight: 10,
    height: 27,
    borderRadius: 14,
    borderColor: Colors['dark'].primaryDarker,
    borderWidth: 2,
  },
  reactionsIndicatorLeft: {
    flex: 0,
		flexDirection: 'row',
    backgroundColor: Colors['dark'].primary,
    alignSelf: 'flex-end',
    alignContent: 'center',
    marginTop: -5,
    height: 27,
    borderRadius: 14,
    borderColor: Colors['dark'].primaryDarker,
    borderWidth: 2,
    transform: [
      {translateX: -60},
      {translateY: 0},
    ],
  },
  reactionEmojiFont: {
    fontSize: 14,
    margin: 3,
    color: Colors['dark'].textLight,
  },
  readIndicator: {
    flex: 0,
    flexDirection: 'row',
    width: '100%',
    alignItems: 'flex-end',
    alignSelf: 'flex-end',
    alignContent: 'flex-end',
    justifyContent: 'flex-end',
    margin: 5,
  },
	oof: {
    width: 20,
    height: 20,
    borderRadius: 10,
    margin:3,
  }
});

