import * as React from 'react';
import {Animated, Image, Platform, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';
import Recorder from '../util/Recorder';
import Fire from '../util/Fire';
import Colors from '../constants/Colors.ts';
import { Ionicons } from '@expo/vector-icons';
import useColorScheme from '../hooks/useColorScheme';
import oofReact from '../assets/images/oof.png';
import komReact from '../assets/images/kombucha.png';
import mfcReact from '../assets/images/monkeyface.png';
import tudReact from '../assets/images/ThumbsUpDrake.png';
import tddReact from '../assets/images/ThumbsDownDrake.png';
import ccrReact from '../assets/images/CatCry.png';
import cwoReact from '../assets/images/leomeme.png';
import lolReact from '../assets/images/Lol.png';
import lvmReact from '../assets/images/LoveMeme.png';

export default function ReactionPanel(props) {
  if (props.pos == null) return null
  const theme = useColorScheme()
  const [panelScaleVal, setPanelScale] = React.useState(0)
  let panelScale = new Animated.Value(panelScaleVal);
  panelScale.addListener((value) => {
    setPanelScale(value.value)
  })


  let panelWidth = Platform.OS == 'ios' ? 480 : 430
  let maxScale = Dimensions.get('window').width/panelWidth

  React.useEffect(() => {
    panelScale.setValue(0) 
    if (props.pos) {
      Animated.timing(panelScale, {
        toValue: maxScale,
        duration: 150,
        isInteraction: true,
        useNativeDriver: false,
      }).start();
    }
  },[props.pos]);

  let containerStyle = (scale) => { return ({
    zIndex: 5,
    flexDirection: 'row',
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: scale/maxScale,
    transform: [
      { translateX: 0},
      { translateY: props.pos.y - 150 },
      { scale: scale },
    ]
  })}

  const reactionPressed = (emoji) => {
    return () => {if (props.reactionPressed) props.reactionPressed(emoji)}
  }


  return (
    <TouchableOpacity
      activeOpacity={1}
      style={{backroundColor: 'black', width: '100%', height:'100%'}}
      onPress={() => {
        Animated.timing(panelScale, {
          toValue: 0,
          duration: 100,
          isInteraction: true,
          useNativeDriver: false,
        }).start(() => {
          if (props.dismissPressed) props.dismissPressed()
        });
      }}
    >
      <View style={containerStyle(panelScaleVal)}>
        <TouchableOpacity style={styles.roundContainer} onPress={props.replyPressed}>
            <Ionicons name='ios-undo' style={styles.replyButton} size={27} color={Colors[theme].textLight}/>
        </TouchableOpacity>
        <View style={styles.emojiContainer}>
          <TouchableOpacity style={styles.iconButton} onPress={reactionPressed('😍')}>
            <Text style={styles.reactionEmoji}>😍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={reactionPressed('😂')}>
            <Text style={styles.reactionEmoji}>😂</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={reactionPressed('😎')}>
            <Image style={styles.oof} source={cwoReact}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={reactionPressed('😭')}>
            <Image style={styles.oof} source={ccrReact}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={reactionPressed('oof')}>
            <Image style={styles.oof} source={oofReact}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={reactionPressed('kombucha')}>
            <Image style={styles.oof} source={komReact}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={reactionPressed('monkeyface')}>
            <Image style={styles.oof} source={mfcReact}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={reactionPressed('👍')}>
            <Image style={styles.oof} source={tudReact}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={reactionPressed('👎')}>
            <Image style={styles.oof} source={tddReact}/>
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.roundContainer} onPress={props.morePressed}>
            <Ionicons name='ios-more' style={styles.replyButton} size={27} color={Colors[theme].textLight}/>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0,
  },
  roundContainer: {
    flexDirection: 'row',
    flex: 0,
    padding: 5,
    width: 45,
    height: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    backgroundColor: Colors['dark'].primary
  },
  emojiContainer: {
    flexDirection: 'row',
    flex: 0,
    height: '100%',
    paddingLeft: 20,
    paddingRight: 20,
    margin: 5,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    backgroundColor: Colors['dark'].primary
  },
  reactionEmoji: {
    fontSize: Platform.OS == 'ios' ? 27 : 20,
    fontWeight: 'bold',
    color: Colors['dark'].textDark,
    marginLeft: 3,
    marginRight: 3,
  },
  oof: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin:3,
  }
});
