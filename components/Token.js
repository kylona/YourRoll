import React, { Component } from 'react';
import { Platform, Image, Animated, StyleSheet, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler'

import {
  PanGestureHandler,
  ScrollView,
  State,
} from 'react-native-gesture-handler';
import BlobCache from '../util/BlobCache.js';
import Colors from '../constants/Colors.ts';

const USE_NATIVE_DRIVER = true

export default function Token(props) {
    const name = props.name
    let translateX = new Animated.Value(0);
    let translateY = new Animated.Value(0);
    let panX = new Animated.Value(0);
    let panY = new Animated.Value(0);
    const lastOffset = { x: props.xPos, y: props.yPos };
		translateX.setOffset(lastOffset.x);
		translateY.setOffset(lastOffset.y);
		panX.setOffset(lastOffset.x);
		panY.setOffset(lastOffset.y);
    const onGestureEvent = Animated.event(
      [
        {
          nativeEvent: {
            translationX: panX,
            translationY: panY,
          },
        },
      ],
      { useNativeDriver: USE_NATIVE_DRIVER }
    );
    translateX = Animated.add(translateX, Animated.multiply(Animated.subtract(panX, translateX), props.sensitivity))
    translateY = Animated.add(translateY, Animated.multiply(Animated.subtract(panY, translateY), props.sensitivity))
		const onMove = props.onMove
    const remoteImage = props.image
		const [image, setImage] = React.useState(null)

	React.useEffect(() => {
    let canceled = false
    if (props.image) {
      BlobCache.shared.get(props.image).then(res => {
        if (!canceled) setImage(res)
      })
    }
    return () => {
      canceled = true
    }
  }, []);

  const onHandlerStateChange = event => {
    if (event.nativeEvent.oldState === State.ACTIVE) {
      let shiftX = event.nativeEvent.translationX * props.sensitivity;
      let shiftY = event.nativeEvent.translationY * props.sensitivity;
      lastOffset.x += shiftX;
      lastOffset.y += shiftY;
      if (Math.abs(shiftX) < 1 && Math.abs(shiftY) < 1) {
        if (props.onPress) {
          props.onPress(name)
        }
      }
			onMove(lastOffset.x, lastOffset.y);
    }
  };


  const tokenStyle = () => {
		if (props.selected) return ({
			flex: 0,
			height: props.size.y,
			width: props.size.x,
			borderRadius: Math.min(props.size.x, props.size.y)/5,
			borderWidth: 2,
			borderColor: 'red'
		})
		else return ({
			flex: 0,
			height: props.size.y,
			width: props.size.x,
			borderRadius: Math.min(props.size.x, props.size.y)/5,
			borderWidth: 1,
			borderColor: 'black'
		})
	}

	let imageView = null
	if (image != null) {
		imageView = [<Image key={Math.random()} style={tokenStyle()} source={{uri: image}}/>]
	}
	return (
		<PanGestureHandler
			onGestureEvent={onGestureEvent}
			onHandlerStateChange={onHandlerStateChange}
			minDist={0}
		>
			<Animated.View
				style={[
					styles.box,
					{
						transform: [
							{ translateX: translateX },
							{ translateY: translateY },
						],
					},
					props.boxStyle,
				]}
			>
				<TouchableOpacity style={{flex:0}} activeOpacity={1} onPress={() => {
          if (props.onPress) {
            props.onPress(name)
          }
				}}>
					{imageView}
				</TouchableOpacity>
			</Animated.View>
		</PanGestureHandler>
	);
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  box: {
    flex: 1,
    position: 'absolute',
    alignSelf: 'center',
    padding: 5,
    zIndex: 5,
  },
  image: {
    flex: 1,
    position: 'absolute',
    width: 50,
    height: 50,
  },
});
