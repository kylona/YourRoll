import * as React from 'react';
import {Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';
import Recorder from '../util/Recorder';
import Fire from '../util/Fire';
import Colors from '../constants/Colors.ts';
import { Ionicons } from '@expo/vector-icons';
import useColorScheme from '../hooks/useColorScheme';

export default function RecordingPanel(props) {
  const [isRecording, setRecording] = React.useState(false)
  const [isPaused, setPaused] = React.useState(true)
  const [time, setTime] = React.useState(0)
  const startStopText = isRecording ? "Stop Recording" : "Start Recording"
  const playPauseText = isPaused ? isRecording ? "Resume" : "Play" : "Pause"
  const theme = useColorScheme()
  const [panelHeightVal, setPanelHeight] = React.useState(0)
  let panelHeight = new Animated.Value(panelHeightVal);
  panelHeight.addListener((value) => {
    setPanelHeight(value.value)
  })

  let containerStyle = (height) => { return ({
    width: '100%',
    height: height,
    alignItems: 'center',
    backgroundColor: Colors['dark'].primary
  })}

  React.useEffect(() => {
    if (props.enabled) {
      Animated.timing(panelHeight, {
        toValue: 200,
        duration: 300,
        isInteraction: true,
        useNativeDriver: false,
      }).start();
    }
    else {
      Animated.timing(panelHeight, {
        toValue: 0,
        duration: 300,
        isInteraction: true,
        useNativeDriver: false,
      }).start();
    }
     
  },[props.enabled]);

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
  }

  const startStopRecording = () => {
    if (isRecording) {
      Recorder.shared.stopRecording().then((uri) => {
        setRecording(false)
        setPaused(true)
        Recorder.shared.playAudio(uri, getAudioPos)
        props.onFinishedRecording(uri)
      })
    }
    else {
      Recorder.shared.startRecording(getAudioPos).then(() => {
        setPaused(false)
        setRecording(true)
      })
    }
  }

  const playPause = () => {
    if (isRecording) {
      if (isPaused) {
        Recorder.shared.resumeRecording().then(() => {
          setPaused(false)
        })
      }
      else {
        Recorder.shared.pauseRecording().then(() => {
          setPaused(true)
        })
      }
    }
    else {
      if (Recorder.shared.sound == null) {
        startStopRecording()
      }
      else {
        if (isPaused) {
          Recorder.shared.resumeAudio().then(() => {
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
  }
  const micColor = isRecording ? Colors[theme].accent : Colors[theme].textLight
  const playPauseIcon = isPaused ? 'md-play' : 'md-pause'
  const timeText = time ? Math.floor(time/60000) + ":" + ('0' + Math.floor((time/1000)%60)).slice(-2) : '0:00'
  const playbackControl = true || isRecording ?
    (
      <View style={styles.playbackControl}>
      <TouchableOpacity onPress={playPause} >
        <Ionicons name={playPauseIcon} style={styles.playPauseIcon} size={30} color={Colors[theme].textDark}/>
      </TouchableOpacity>
      <Text style={styles.timeText}>{timeText}</Text>
      </View>
    ) :
    null

  return (
    <View style={containerStyle(panelHeightVal)}>
      <TouchableOpacity style={styles.micIcon} onPress={startStopRecording} >
        <Ionicons name='md-mic' style={{marginTop: 5}} size={48} color={micColor}/>
      </TouchableOpacity>
      {playbackControl}
    </View>
  );
}


const styles = StyleSheet.create({
  micIcon: {
    marginTop: 20,
    flex: 0,
  },
  playPauseIcon: {
    flex: 0,
    marginLeft: 30,
    marginTop: 5,
  },
  timeText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: Colors['dark'].textDark,
    margin: 10,
    marginLeft: 20,
  },
  playbackControl: {
    flex: 0,
    flexDirection: 'row',
    backgroundColor: Colors['dark'].primaryLight,
    width: 200,
    margin: 10,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 20,
    alignItems: 'center',
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
  }
});
