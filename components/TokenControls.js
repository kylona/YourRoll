import React, { Component } from 'react';
import { Text, Image, Animated, StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler'
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const USE_NATIVE_DRIVER = true

export default function TokenControls(props) {

  const TokenRoundButton = ({icon, color, backgroudColor, value, onPress, onLongPress=null, scale}) => {
    return(
			<View style={styles.buttonBlock} pointerEvents='box-none'>
				<TouchableOpacity style={tokenButton(scale)} onPress={onPress} onLongPress={onLongPress}>
					<Ionicons name={icon} size={scale*0.7} color={color}/>
				</TouchableOpacity>
				<Text style={tokenText(scale)} pointerEvents='none'>{value}</Text>
			</View>
    )
  }

	const tokenButton = (gridScale) => {
		return({
			borderWidth:1,
			borderColor:Colors['dark'].accentDark,
			alignItems:'center',
			justifyContent:'center',
			width:gridScale*.75,
			height:gridScale*.75,
			backgroundColor:Colors['dark'].accent,
			borderRadius:gridScale*3/8,
		})
	}

	const tokenText = (gridScale) => {
		return({
			textAlign: 'center',
			color: Colors['dark'].textDark,
			fontSize: gridScale/3,
		})
	}


 const selectPanelStyle = (selected) => {
		if(selected) {
			let tokenY = selected.y
			let tokenX = selected.x
			return({
				flex: 0,
				position: 'absolute',
				transform: [{translateY:tokenY - props.scale*0.6},{translateX:tokenX + props.scale/4}],
			})
		}
    else return null
	}

  if (!props.token) return null
  return (
		<View style={selectPanelStyle(props.token)}>
			<TokenRoundButton 
				 icon="ios-trash"
				 color={Colors['dark'].textDark}
				 backgroudColor={Colors['dark'].primary}
				 value="Delete"
				 scale={props.scale}
				 onPress={() => {props.removeToken(props.token)}}
			/>
		</View>
  );
}

const styles = StyleSheet.create({
 buttonBlock: {
    flex: 1,
    justifyContent: 'center',
    margin: 10,
    alignItems: 'center',
    zIndex: 2
  },
});
