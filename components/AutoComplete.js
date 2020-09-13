import * as React from 'react';
import {Animated, Platform, Dimensions, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';
import Recorder from '../util/Recorder';
import Fire from '../util/Fire';
import AppState from '../util/AppState';
import Colors from '../constants/Colors.ts';
import { Ionicons } from '@expo/vector-icons';
import useColorScheme from '../hooks/useColorScheme';

export default function AutoComplete(props) {
  const theme = useColorScheme()
  const [panelHeightVal, setPanelHeight] = React.useState(0)
  let panelHeight = new Animated.Value(panelHeightVal);
  panelHeight.addListener((value) => {
    setPanelHeight(value.value)
		if (props.onHeightChange) props.onHeightChange(value.value)
  })

  React.useEffect(() => {
    panelHeight.setValue(0) 
    if (props.pos) {
      Animated.timing(panelHeight, {
        toValue: props.height,
        duration: 150,
        isInteraction: true,
        useNativeDriver: false,
      }).start();
    }
  },[props.height]);

  let containerStyle = (height) => { return ({
    zIndex: 5,
    flexDirection: 'row',
    height: props.height,
		backgroundColor: Colors[theme].primary,
  })}


	let guessViews = []
	for (let g in props.guesses) {
		let guess = props.guesses[g]
    let value = ""
    if (guess.startsWith("#")) {
      value = AppState.shared.getMacro(guess.replace("#", ""))
    }
    if (guess.startsWith("$")) {
      value = AppState.shared.getStat(guess.replace("$",""))
    }
		guessViews.push(
			<TouchableOpacity 
				onPress={() => {
          if (props.onAutoComplete) {
            props.onAutoComplete(guess)
          }
				}}
        key={guess}
        style={styles.guessContainer}>
			  <Text style={styles.guessText}>{guess} → {value}</Text>
			</TouchableOpacity>
		)
	}


  return (
    <View style={containerStyle(panelHeightVal)}>
			<ScrollView
        keyboardShouldPersistTaps={'always'}
      >
				{guessViews}
			</ScrollView>
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
  guessContainer: {
    flexDirection: 'row',
		width: '100%',
    height: 40,
    paddingLeft: 20,
    paddingRight: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
		borderWidth: 1,
		borderColor: Colors['dark'].primary,
    backgroundColor: Colors['dark'].primaryLight
  },
  guessText: {
    fontSize: Platform.OS == 'ios' ? 18 : 12,
    fontWeight: 'bold',
    color: Colors['dark'].textDark,
    marginLeft: 3,
    marginRight: 3,
  },
});
