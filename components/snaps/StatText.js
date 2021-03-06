import * as React from 'react';
import {Animated, View, Text,  TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Recorder from '../../util/Recorder';
import Fire from '../../util/Fire';
import ObjectFactory from '../../util/ObjectFactory';
import MessageParser from '../../util/MessageParser';
import Colors from '../../constants/Colors.ts';
import { Ionicons } from '@expo/vector-icons';
import AppState from '../../util/AppState';

export default function StatText(props) {

	const display = props.display

	if (!props.back) {
		let parsedDisplay = MessageParser.parseBlings(display)
    let lines = parsedDisplay.split('\n')
    let lineViews = []
    for (let line of lines) {
      let blings = line.match(/\%[a-zA-Z\d-]+/g)
      let prompts = line.split(/\%[a-zA-Z\d-]+/g)
      let blingInputs = []
      if (blings == null || blings.length == 0) {
        blingInputs.push (
          <Text editable={false} key={line} style={styles.inputText}>{line}</Text>
        )	
      }
      for (let s in blings) {
        let stat = blings[s].replace('%', '').toLowerCase()
        if (prompts[s] != "") {
          blingInputs.push(
            <Text editable={false} key={prompts[s]} style={styles.inputText}>{prompts[s]}</Text>
          )
        }
        let defaultValue = AppState.shared.getStat(stat)
        if (defaultValue == null) defaultValue = ""
        defaultValue = defaultValue.toString()
        blingInputs.push(
          <TextInput
            key={stat}
            defaultValue={defaultValue}
            placeholder={stat+ '...'}
            style={styles.inputText}
            onEndEditing={(e) => {
              var text = e.nativeEvent.text
              if (text == '') return
              if (AppState.shared.getStat(stat) != text) {
                AppState.shared.character[stat] = text
                AppState.shared.saveState()
              }
            }}
          />
        )
      }
      lineViews.push(
        <View key={line} pointerEvents='box-none' onLongPress={props.onLongPress} style={styles.lineView}>
          {blingInputs}
        </View>
      )
		}
		
		return (
      <View key={display} onPress={props.onPress} onLongPress={props.onLongPress} style={styles.snapFront}>
        {lineViews}
			</View>
		);

	}

	else return (
		<View style={styles.snapBack}>
				<TextInput
					key={display}
					multiline={true}
					defaultValue={display}
					placeholder={"What to display..."}
					style={styles.inputText}
					onEndEditing={(e) => {
						var text = e.nativeEvent.text
						if (text == '') return
            props.onDisplayChange(text)
					}}
				/>
		</View>
	)
}


const styles = StyleSheet.create({
  snapFront: {
		width:'100%',
		height:'100%',
		alignItems: 'center',
    justifyContent: 'center',
		backgroundColor:Colors['dark'].accent,
		borderRadius: 15,
  },
  snapBack: {
		width:'100%',
		height:'100%',
		alignItems: 'center',
    justifyContent: 'center',
		backgroundColor:Colors['dark'].primaryLight,
		borderRadius: 15,
    padding: 10,
  },
  lineView: {
    flexDirection: 'row',
    flexWrap: 'wrap',
		alignItems: 'center',
  },
	tableAddButton: {
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 15,
    borderRadius: 40,
    backgroundColor: Colors['dark'].accent
  },
  inputText: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors['dark'].textDark,
  },
  inputBox: {
    width: '100%',
    backgroundColor: Colors['dark'].primaryLight,
    margin: 10,
    marginTop: 20,
    borderRadius: 15,
  },
});
