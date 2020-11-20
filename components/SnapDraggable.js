import React, { Component } from "react";
import { StyleSheet, TouchableOpacity, View, Text, PanResponder, Animated } from "react-native";
//import { TouchableOpacity } from 'react-native-gesture-handler';
import Colors from '../constants/Colors';

export default function SnapDraggable(props) {
    const [pan, setPan] = React.useState(new Animated.ValueXY({x: 0, y:0}))
    const [grow, setGrow] = React.useState(new Animated.ValueXY({x: props.width, y: props.height}))
    const [pos, setPos] = React.useState(props.pos || {x: 0, y:0})
    const [grid, setGrid] = React.useState(props.grid || {x: 0, y:0})
    const [size, setSize] = React.useState(props.size || {x: 1, y:1})
    const [draggable, setDraggable] = React.useState(false)
    const [lastPress, setLastPress] = React.useState(0)
    const [flipped, setFlipped] = React.useState(props.flipped)

    pan.setOffset({x: 100, y:100})

    React.useEffect(() => {
      grow.setValue({x: props.height/2, y: 0})
    },[])

    React.useEffect(() => {
        Animated.timing(grow, {
          toValue: {x: props.height/2, y: 0},
          duration: 100,
          useNativeDriver: false
        }).start(
        () => {
        setFlipped(props.flipped)
        Animated.timing(grow, {
          toValue: {x: 0, y: props.height},
          duration: 100,
          useNativeDriver: false
        }).start();
        }
        );
    },[props.flipped])



    let val = props.pos
    // Add a listener for the delta value change
    pan.addListener((value) => val = value);
    if (props.offset) {
      pan.setOffset({
        x: props.offset.x,
        y: props.offset.y,
      })
    }
    else {
      pan.setOffset({
        x: pos.x,
        y: pos.y
      })
    }
    // Initialize PanResponder with move handling
    const panResponder = React.useMemo(() => {
      return PanResponder.create({
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
        let pageX = gesture.moveX 
        let pageY = gesture.moveY
        if (props.onMove) {
          props.onMove(snapObject(), val.x, val.y, pageX, pageY)
        }
        Animated.event(
          [null, { dx: pan.x, dy: pan.y }],
          {useNativeDriver: false})(e, gesture)
      },
			onPanResponderReject: (e, gesture) => {
        let pageX = gesture.moveX 
        let pageY = gesture.moveY
				if (props.onRelease) props.onRelease(snapObject(), val.x, val.y, pageX, pageY)
        setDraggable(false)
			},
			onPanResponderRelease: (e, gesture) => {
        let pageX = gesture.moveX 
        let pageY = gesture.moveY
				if (props.onRelease) props.onRelease(snapObject(), val.x, val.y, pageX, pageY)
        setDraggable(false)
      },
      onPanResponderTerminate: (evt, gesture) => {
        let pageX = gesture.moveX 
        let pageY = gesture.moveY
				if (props.onRelease) props.onRelease(snapObject(), val.x, val.y, pageX, pageY)
        setDraggable(false)
      },
    })}, [draggable]);

	const snapToPos = (newPos, callback) => {
        setPos(newPos)
				pan.setOffset({x: newPos.x, y: newPos.y})
				pan.setValue({x: val.x - newPos.x, y: val.y - newPos.y})
        Animated.timing(pan, {
          toValue: {x: 0, y: 0},
          duration: 200,
          useNativeDriver: false
        }).start(callback);
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
      snapToPos: snapToPos,
    }
  }

  const panStyle = {
    width: props.width,
    height: grow.y,
    marginTop: grow.x,
    padding: draggable ? 0 : 5,
    borderWidth: props.selected ? 2 : 0,
    borderColor: Colors['dark'].accent,
    position: 'absolute',
    transform: [
    {
      translateX: pan.x
    },
    {
      translateY: pan.y
    },
    ]
  }
  const grabOnLongPress = () => {
    if (props.onGrab) props.onGrab(snapObject(), pos.x, pos.y)
    setDraggable(true)
  }
  const onLetGo = () => {
    setDraggable(false)
  }
  const onResize = (x, y) => {
    console.log("Resize")
  }
  let frontView = props.renderFront(grabOnLongPress, onLetGo, onResize)
  let backView = props.renderBack(grabOnLongPress, onLetGo, onResize)
  let view = flipped ? backView : frontView 
  let handle = (
    <TouchableOpacity activeOpacity={1} style={styles.handle}
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
      //onPressOut={onLetGo}
      onLongPress={grabOnLongPress}
			onContentSizeChange={(e) => {
        let height = e.nativeEvent.contentSize.height
        console.log(height)
			}}
    >
      {view}
    </TouchableOpacity>
  )



  return (
    <Animated.View
      {...panResponder.panHandlers}
      useNativeDriver={true}
      style={[panStyle]}
      >
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

