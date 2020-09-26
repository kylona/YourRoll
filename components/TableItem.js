import * as React from 'react';
import {Animated, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';
import Recorder from '../util/Recorder';
import Fire from '../util/Fire';
import ObjectFactory from '../util/ObjectFactory';
import Colors from '../constants/Colors.ts';
import { Ionicons } from '@expo/vector-icons';
import AppState from '../util/AppState';

export default function TableItem(props) {

  let t = props.index
  return (
     <TouchableOpacity
         key={t}
         style={styles.tableContainer}
         onPress={props.onPress}
         onLongPress={props.onLongPress}
     >
      <Text style={styles.inputText}>{props.name}</Text>
     </TouchableOpacity>
  );
}


const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    backgroundColor: Colors['dark'].primary,
    borderRadius: 20,
    padding: 10,
  },
	tableAddButton: {
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 15,
    borderRadius: 40,
    backgroundColor: Colors['dark'].accent
  },
	tableContainer: {
    flexDirection: 'row',
    width:'100%',
    backgroundColor:Colors['dark'].primaryLight,
    borderRadius: 15,
    alignItems: 'center',
    padding: 5,
    marginTop: 10,
  },
  macroDeleteButton: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginRight: 5,
  },
  inputText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors['dark'].textDark,
    margin: 15,
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
    fontSize: 25,
    fontWeight: 'bold',
    color: Colors['dark'].textLight,
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
