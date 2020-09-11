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
    this.state.pan.addListener((value) => val = value);
    this.state.pan.setOffset({
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
        if (props.onMove) props.onMove(props.id, val.x, val.y)
        Animated.event(
          [false, { dx: pan.x, dy: pan.y }],
          {useNativeDriver: false})(e, gesture)
      },
			onPanResponderReject: (e, gesture) => {
        setDraggable(false)
				if (props.onRelease) props.onRelease(props.id, val.x, val.y)
			},
			onPanResponderRelease: (e, gesture) => {
        setDraggable(false)
				if (props.onRelease) props.onRelease(props.id, val.x, val.y)
      },
      onPanResponderTerminate: (evt, gesture) => {
        setDraggable(false)
				if (props.onRelease) props.onRelease(props.id, val.x, val.y)
      },
    });
  }

  setState(newState, callback) {
    super.setState(newState, callback)
  }

	snapToPos(pos) {
				pos = pos
				pan.setOffset({x: pos.x, y: pos.y})
				pan.setValue({x: val.x - pos.x, y: val.y - pos.y})
        Animated.spring(pan, {
          toValue: {x: 0, y: 0},
          friction: 5,
          useNativeDriver: false
        }).start();
	}

  render() {
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
    let shroud = props.editing ? <View style={styles.shroud}/> : null 
return (
  <Animated.View
    {...panResponder.panHandlers}
    useNativeDriver={true}
    style={[panStyle]}
    >
      <TouchableOpacity activeOpacity={1} style={styles.circle}
        onPress={() => {
          var delta = new Date().getTime() - this.state.lastPress;
          if (this.state.lastPress == 0) {
            setTimeout(() => {
              if (this.state.lastPress != 0) {
                if (this.onTap) this.onTap(this, this._val.x, this._val.y)
              }
              this.setState({
                lastPress: 0
              })
            }, 200)
            this.setState({
              lastPress: new Date().getTime()
            })
          }
          else if(delta < 200) {
            this.state.lastPress = 0
            this.setState({
              lastPress: 0
            })
            if (this.onDoubleTap) this.onDoubleTap(this, this._val.x, this._val.y)
          }
          else {
            this.setState({
              lastPress: new Date().getTime()
            })
          }
        }}
        delayLongPress={50}
        onPressOut={() => this.setState({draggable: false})}
        onLongPress={() => {
          if (true) { //TODO edit mode
            if (this.onGrab) this.onGrab(this, this.state.pos.x, this.state.pos.y)
            this.setState({draggable: true})
          }
        }}
      >
        {shroud}
        {view}
      </TouchableOpacity>
  </Animated.View>
);
  }
}

let styles = StyleSheet.create({
  circle: {
    width: '100%',
		height: '100%',
    backgroundColor: "skyblue",
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shroud: {
    position: 'absolute',
    width: '100%',
		height: '100%',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});

