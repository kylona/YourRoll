import * as React from 'react';
import {Animated, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, View, Image } from '../components/Themed';
import Colors from '../constants/Colors.ts';
import { Ionicons } from '@expo/vector-icons';
import useColorScheme from '../hooks/useColorScheme';
import { SvgUri } from 'react-native-svg';
import IconSVG from '../components/IconSVG';


export function HeaderTitle(props) {
  return (
    <View style={styles.headerTitle}>
      <IconSVG/>
    </View>
  );
}

export function HeaderRight(props) {
  return (
    <TouchableOpacity 
      style={styles.headerRight}
      onPress={props.onPress}
    >
      {props.children}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    width:200,
    height:50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  headerRight: {
    width:80,
    height:50,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
