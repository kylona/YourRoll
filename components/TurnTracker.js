import * as React from 'react';
import {Animated, TextInput, Image, Platform, Dimensions, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';
import Recorder from '../util/Recorder';
import Fire from '../util/Fire';
import AppState from '../util/AppState';
import Colors from '../constants/Colors.ts';
import { Ionicons } from '@expo/vector-icons';
import useColorScheme from '../hooks/useColorScheme';
import oofReact from '../assets/images/oof.png';

export default function TurnTracker(props) {
  const theme = useColorScheme()
  const [panelScaleVal, setPanelScale] = React.useState(0)
  let panelScale = new Animated.Value(panelScaleVal);
  panelScale.addListener((value) => {
    setPanelScale(value.value)
  })


  let panelWidth = Platform.OS == 'ios' ? 450 : 400
  let maxScale = Dimensions.get('window').width/panelWidth

  React.useEffect(() => {
    panelScale.setValue(0) 
    Animated.timing(panelScale, {
      toValue: maxScale,
      duration: 150,
      isInteraction: true,
      useNativeDriver: false,
    }).start();
  },[]);

  let containerStyle = (scale) => { return ({
    zIndex: 5,
    backgroundColor:Colors['dark'].primaryDark,
    flexDirection: 'row',
    height: '100%',
    width: "100%",
    opacity: 0.9,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [
      { scale: 1 },
    ]
  })}


  return (
      <View style={containerStyle(panelScaleVal)}>
          <Text>📌</Text>
          <TextInput
            style={styles.pinnedMessage}
            multiline={true}
            placeholder={"Pinned Message..."}
            placeholderTextColor={Colors['dark'].textLighter}
            onEndEditing={(e) => {
              let text = e.nativeEvent.text
              console.log(text)
              Fire.shared.sendPinnedMessage(text)
            }}
          >
          {AppState.shared.pinnedMessage}
          </TextInput>
      </View>
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
  pinnedMessage: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors['dark'].textLight,
    margin: 3,
  },
  oof: {
    width: 30,
    height: 30,
    borderRadius: 15,
  }
});
