import * as React from 'react';
import {Image, Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';
import Colors from '../constants/Colors.ts';
import { Ionicons } from '@expo/vector-icons';
import useColorScheme from '../hooks/useColorScheme';

export default function Avatar(props) {
  return (
		<TouchableOpacity
			style={{width:props.size, height:props.size, justifyContent:'center', padding: 5,}}
			onPress={props.onPress}
		>
      <Image style={styles.avatar} source={{uri: props.image}} />
		</TouchableOpacity>
  );
}

const styles = StyleSheet.create({
	avatar: {
    flex: 0,
    width: '100%',
    height: '100%',
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
