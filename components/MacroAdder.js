import * as React from 'react';
import {Animated, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';
import Recorder from '../util/Recorder';
import Fire from '../util/Fire';
import Colors from '../constants/Colors.ts';
import { Ionicons } from '@expo/vector-icons';
import AppState from '../util/AppState';

export default function MacroAdder(props) {

	const [name, setName] = React.useState(null)
	const [value, setValue] = React.useState(null)
  const [oldName, setOldName] = React.useState(props.name)
  const [oldValue, setOldValue] = React.useState(props.value)
  if (oldName != props.name || oldValue != props.value) {
    setOldName(props.name)
    setName(props.name)
    setOldValue(props.value)
    setValue(props.value)
  }


  return (
    <View style={styles.container}>
      <View style={styles.inputBox}>
        <TextInput
          //defaultValue={}
          placeholder={"Macro Name..."}
          defaultValue={name}
          placeholderTextColor={Colors['dark'].textLight}
          style={styles.inputText}
          onChangeText={(text) => {
						setName(text.toLowerCase())					
          }}
        />
      </View>
      <View style={styles.inputBox}>
        <TextInput
          //defaultValue={AppState.shared.character.name}
          placeholder={"Macro Value..."}
          defaultValue={value}
          placeholderTextColor={Colors['dark'].textLight}
          style={styles.inputText}
          onChangeText={(text) => {
						setValue(text)					
          }}
        />
      </View>
			<TouchableOpacity
				style={styles.macroAddButton}
				onPress={ () => {
          let newName = name == null ? props.name : name
          let newValue = value == null ? props.value : value
					if (newName != '' && newValue != '') {
            let cleanName = newName.replace("#", "").replace(" ", "").trim()
            let newMacro = {
              name: cleanName,
              value: newValue,
            }
            Fire.shared.sendMacro(newMacro)
					}
				}}
			>
        <Ionicons name='md-add-circle' size={60} color={Colors['dark'].textLight}/>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 250,
    alignItems: 'center',
    backgroundColor: Colors['dark'].primary,
    borderRadius: 20,
    padding: 10,
  },
	macroAddButton: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginRight: 5,
  },
  inputText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors['dark'].textDark,
    padding: 10,
    margin: 5,
    marginLeft: 20,
  },
  inputBox: {
    width: '100%',
    backgroundColor: Colors['dark'].primaryLight,
    margin: 10,
    marginTop: 20,
    borderRadius: 15,
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
