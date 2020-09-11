import React, { Component } from "react";
import { StyleSheet, View, Text, PanResponder, Animated } from "react-native";
import { TouchableOpacity } from 'react-native-gesture-handler';
import Colors from '../constants/Colors';

export default function SnapDraggable(props) {
    const [pan, setPan] = React.useState(new Animated.ValueXY({x: 0, y:0}))
    const [grow, setGrow] = React.useState(new Animated.ValueXY({x: props.width, y: props.height}))
    const [pos, setPos] = React.useState(props.pos || {x: 0, y:0})
    const [grid, setGrid] = React.useState(props.grid || {x: 0, y:0})
    const [size, setSize] = React.useState(props.size || {x: 1, y:1})
    const [draggable, setDraggable] = React.useState(false)
    const [lastPress, setLastPress] = React.useState(0)
    const [flipped, setFilipped] = React.useState(props.flipped || false)


    let val = props.pos
    // Add a listener for the delta value change
    pan.addListener((value) => val = value);
    pan.setOffset({
      x: pos.x,
      y: pos.y
    })
    // Initialize PanResponder with move handling
    const panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (e, gesture) => {
				return (draggable)
			},
      onMoveShouldSetPanResponder: (e, gesture) => {
				return (draggable)
			},
			onPanResponderGrant: (e, gesture) => {
        pan.setOffset({
          x: pos.x,
          y: pos.y
        })
			},
      onPanResponderMove: (e, gesture) => {
        if (props.onMove) props.onMove(snapObject(), val.x, val.y)
        Animated.event(
          [false, { dx: pan.x, dy: pan.y }],
          {useNativeDriver: false})(e, gesture)
      },
			onPanResponderReject: (e, gesture) => {
        setDraggable(false)
				if (props.onRelease) props.onRelease(snapObject(), val.x, val.y)
			},
			onPanResponderRelease: (e, gesture) => {
        setDraggable(false)
				if (props.onRelease) props.onRelease(snapObject(), val.x, val.y)
      },
      onPanResponderTerminate: (evt, gesture) => {
        setDraggable(false)
				if (props.onRelease) props.onRelease(snapObject(), val.x, val.y)
      },
    });

	const snapToPos = (newPos) => {
        setPos(newPos)
				pan.setOffset({x: newPos.x, y: newPos.y})
				pan.setValue({x: val.x - newPos.x, y: val.y - newPos.y})
        Animated.spring(pan, {
          toValue: {x: 0, y: 0},
          friction: 5,
          useNativeDriver: false
        }).start();
	}

  const snapObject = () => {
    return {
      pos: pos,
      size: size,
      grid: grid,
      draggable: draggable,
      flipped: flipped,
      snapToPos: snapToPos,
      setGrid: setGrid,
      id: props.id,
    }
  }

  const panStyle = {
    position: 'absolute',
    width: props.width,
    height: props.height,
    padding: draggable ? 0 : 5,
    borderWidth: props.selected ? 2 : 0,
    borderColor: Colors['dark'].accent,
    transform: [
    {
      translateX: pan.x
    },
    {
      translateY: pan.y
    },
    ]
  }
  let frontView = props.renderFront()
  let backView = props.renderFront()
  let view = flipped ? frontView : backView
  let handle = props.editing ? null : (
    <TouchableOpacity activeOpacity={0} style={styles.handle}
      onPress={() => {
        var delta = new Date().getTime() - lastPress;
        if (lastPress == 0) {
          setTimeout(() => {
            if (lastPress != 0) {
              if (props.onTap) onTap(snapObject(), val.x, val.y)
            }
            setLastPress(0)
          }, 200)
          setLastPress(new Date().getTime()) }
        else if(delta < 200) {
          setLastPress(0)
          if (props.onDoubleTap) props.onDoubleTap(snapObject(), val.x, val.y)
        }
        else {
          setLastPress(new Date().getTime())
        }
      }}
      delayLongPress={50}
      onPressOut={() => setDraggable(false)}
      onLongPress={() => {
        if (true) { //TODO edit mode
          if (props.onGrab) props.onGrab(snapObject(), pos.x, pos.y)
            setDraggable(true)
        }
      }}
    >
    </TouchableOpacity>
  )

  return (
    <Animated.View
      {...panResponder.panHandlers}
      useNativeDriver={true}
      style={[panStyle]}
      >
        <View style={styles.contentBox}>
          {view}
        </View>
        {handle}
    </Animated.View>
  );
}

let styles = StyleSheet.create({
  handle: {
    width: '100%',
		height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  contentBox: {
    width: '100%',
		height: '100%',
    position: 'absolute',
    margin: 5,
    alignItems: 'center',
    justifyContent: 'center',
  }
});

