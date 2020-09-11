import * as React from 'react';
import {Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';
import Recorder from '../util/Recorder';
import Fire from '../util/Fire';
import Colors from '../constants/Colors.ts';
import { Ionicons } from '@expo/vector-icons';
import useColorScheme from '../hooks/useColorScheme';

export default function AudioBubble(props) {
  const [isPaused, setPaused] = React.useState(true)
  const [isPlaying, setPlaying] = React.useState(false)
  const [time, setTime] = React.useState(0)
  const theme = useColorScheme()
  const sound = props.currentMessage.audio


  const getAudioPos = (recorderStatus) => {
    let milliseconds = recorderStatus.positionMillis
    if (!milliseconds) milliseconds = recorderStatus.durationMillis
    setTime(milliseconds)
    if (recorderStatus.hasOwnProperty('isPlaying')) {
      if(!recorderStatus.isPlaying) {
        setPaused(true)
      }
      else {
        setPaused(false)
      }
    }
    if (recorderStatus.didJustFinish) {
      setPlaying(false)
    }
  }

  const playPause = () => {
    if (!isPlaying) {
      Recorder.shared.playAudio(sound, getAudioPos).then(() => {
        setPaused(false)
        setPlaying(true)
      })
    }
    else {
      if (isPaused) {
        Recorder.shared.resumeAudio(sound, getAudioPos).then(() => {
          setPaused(false)
        })
      }
      else {
        Recorder.shared.pauseAudio().then(() => {
          setPaused(true)
        })
      }
    }
  }
  const playPauseIcon = isPaused ? 'md-play' : 'md-pause'
  const timeText = time ? Math.floor(time/60000) + ":" + ('0' + Math.floor((time/1000)%60)).slice(-2) : '0:00'

  let bubbleStyle = styles.bubbleLeft
  let myId = Fire.shared.uid
  if (!myId) myId = 'blankId'
  if (props.currentMessage.user._id == myId) {
    bubbleStyle = styles.bubbleRight
  }
  return (
    <View style={bubbleStyle}>
      <View style={styles.playbackControl}>
      <TouchableOpacity onPress={playPause} >
        <Ionicons name={playPauseIcon} style={styles.playPauseIcon} size={20} color={Colors[theme].textDark}/>
      </TouchableOpacity>
      <Text style={styles.timeText}>{timeText}</Text>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  bubbleLeft: {
		borderRadius: 15,
		backgroundColor: Colors['dark'].primaryLight,
		minHeight: 20,
		justifyContent: 'flex-end',
  },
  bubbleRight: {
		borderRadius: 15,
		backgroundColor: Colors['dark'].defaultBlue,
		minHeight: 20,
		justifyContent: 'flex-end',
  },
  playPauseIcon: {
    flex: 0,
    marginLeft: 15,
    marginTop: 5,
  },
  timeText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors['dark'].textDark,
    margin: 10,
    marginLeft: 10,
  },
  playbackControl: {
    flex: 0,
    flexDirection: 'row',
    backgroundColor: Colors['dark'].primaryLight,
    width: 130,
    margin: 10,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 10,
    paddingRight: 10,
    borderRadius: 15,
    alignItems: 'center',
  },
});
