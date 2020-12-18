import React, { Component } from 'react';
import { Text, Image, Animated, StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler'
import Colors from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const USE_NATIVE_DRIVER = true

export default function TokenControls(props) {
  if (!props.token) return null
  if (!props.token.size) props.token.size = 1

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
			color: Colors['dark'].textLight,
			fontSize: gridScale/3,
      opacity: 0.5,
      backgroundColor: 'black',
		})
	}


 const selectPanelStyle = (selected) => {
		if(selected) {
			let tokenY = selected.y
			let tokenX = selected.x
			return({
				flex: 0,
				position: 'absolute',
				transform: [{translateY:tokenY - props.scale*props.token.size},{translateX:tokenX + 145},{scale:props.scale/25*props.token.size},],
        height: 100,
        zIndex: 200,
			})
		}
    else return null
	}

  return (
		<View style={selectPanelStyle(props.token)}>
			<TokenRoundButton 
				 icon="ios-trash"
				 color={Colors['dark'].textDark}
				 backgroudColor={Colors['dark'].primary}
				 value="Delete"
				 scale={25}
				 onPress={() => {props.removeToken(props.token)}}
			/>
      <View style={{
          flexDirection: 'row',
          width: 130,
          marginTop: -25
      }}>
        <TokenRoundButton 
           icon="ios-remove"
           color={Colors['dark'].textDark}
           backgroudColor={Colors['dark'].primary}
           value="Smaller"
           scale={25}
           onPress={() => {props.updateToken({...props.token, size: props.token.size - 0.25})}}
        />
        <TokenRoundButton 
           icon="ios-add"
           color={Colors['dark'].textDark}
           backgroudColor={Colors['dark'].primary}
           value="Bigger"
           scale={25}
           onPress={() => {props.updateToken({...props.token, size: props.token.size + 0.25})}}
        />
      </View>
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
