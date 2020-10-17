import * as React from 'react';
import {Animated, Dimensions, ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';
import Recorder from '../util/Recorder';
import Fire from '../util/Fire';
import ObjectFactory from '../util/ObjectFactory';
import MessageParser from '../util/MessageParser';
import Colors from '../constants/Colors.ts';
import { Ionicons } from '@expo/vector-icons';
import AppState from '../util/AppState';
import SnapDraggable from '../components/SnapDraggable';
import StatText from '../components/snaps/StatText';
import SnapAvatar	from '../components/snaps/SnapAvatar';

export default function SnapAdder(props) {

    const [scrollEnabled, enableScroll] = React.useState(true)

		let snapOptions = {
			0: {grid: {x: 0, y: 0}, size: {x:2, y:1}, type:"SnapText", display:"Stat:\nX"},
			1: {grid: {x: 2, y: 0}, size: {x:3, y:1}, type:"SnapText", display:"Stat:\nX"},
			2: {grid: {x: 5, y: 0}, size: {x:4, y:1}, type:"SnapText", display:"Stat:\nX"},
			3: {grid: {x: 9, y: 0}, size: {x:1, y:1}, type:"SnapText", display:"\nX"},
      4: {grid: {x: 10, y: 0}, size: {x:2, y:2}, type:"Avatar"},
		}

		const colWidth = Dimensions.get('window').width/6 
		const rowHeight = colWidth

		const gridToPos = (grid) => {
      return {x: grid.x*colWidth, y: grid.y*rowHeight}
    }

    const posToGrid = (pos) => {
      let grid = {x: Math.floor(pos.x/colWidth + 0.5), y: Math.floor(pos.y/rowHeight + 0.5)}
      grid.x = grid.x > props.numColumns-1 ? props.numColumns-1 : grid.x < 0 ? 0 : grid.x
      grid.y = grid.y < 0 ? 0 : grid.y
      return grid
    }

    const preOnGrab = (snap, x, y) => {
      if(props.onGrab) props.onGrab(snap, x, y)
      enableScroll(false)
    }

    const preOnMove = (snap, x, y) => {
    }

    const preOnRelease = (snap, x, y) => {
      if(props.onRelease) props.onRelease(snap, x, y)
      enableScroll(true)
      let grid = posToGrid({x, y})
      snap.snapToPos(gridToPos(snap.grid))
    }

        
    let snaps = []
    for (let id in snapOptions) {
      let item = snapOptions[id]
      let renderFront = () => null
      let renderBack = () => null
      switch (item.type) {
        case "SnapText":
        renderFront = (onLongPress, onPressOut) => {
        return (
          <StatText
            back={false}
            display={item.display}
            onDisplayChange={(text) => {
              AppState.shared.character.actionLayout[id].display = text
              AppState.shared.saveState()
            }}
            onLongPress={onLongPress}
            onPressOut={onPressOut}
          />)
        }
        renderBack = (onLongPress, onPressOut) => {
        return (
          <StatText
            back={true}
            display={item.display}
            onDisplayChange={(text) => {
              AppState.shared.character.actionLayout[id].display = text
              AppState.shared.saveState()
            }}
            onLongPress={onLongPress}
            onPressOut={onPressOut}
          />)
        }
        break
        case "Avatar":
        renderFront = (onLongPress, onPressOut) => {
        return (
          <SnapAvatar
            back={false}
            onLongPress={onLongPress}
            onPressOut={onPressOut}
          />)
        }
        renderBack = (onLongPress, onPressOut) => {
        return (
          <SnapAvatar
            back={true}
            onLongPress={onLongPress}
            onPressOut={onPressOut}
          />)
        }
        break
          
      }
      if (item.type == "SnapText") {
      }
      snaps.push(
        <SnapDraggable
          key={AppState.shared.character.name + id}
          pos={gridToPos(item.grid)}
          grid={item.grid}
          size={item.size}
          flipped={props.editing}
          onGrab={(g, x, y) => {preOnGrab(g, x, y)}}
          onMove={(m, x, y) => {preOnMove(m, x, y)}}
          onRelease={(r, x, y) => {preOnRelease(r, x, y)}}
          width={colWidth*item.size.x}
          height={rowHeight*item.size.y}
          onDoubleTap={(tapped, x, y) => {props.onDoubleTap(tapped, x, y)}}
          onTap={item.onTap}
          renderFront={renderFront}
          renderBack={renderBack}
          editing={props.editing}
          id={id}
        />
      )
    }

		return (
			<View style={styles.adderScroll}>
      <ScrollView
        scrollEnabled={scrollEnabled}
				horizontal={true}
        contentContainerStyle={styles.adderScrollContainer}
      >
				{snaps}
			</ScrollView>
			</View>
		);

}
const styles = StyleSheet.create({
  adderScroll: {
    height: '100%',
    flexDirection: 'row',
    backgroundColor: Colors['dark'].primary,
  },
  adderScrollContainer: {
    margin: 20,
    width: Dimensions.get('window').width*2,
    flexDirection: 'row',
		justifyContent: 'flex-start',
		alignItems: 'flex-start',
		borderRadius: 15,
  },
  snapFront: {
		width:200,
		height:'100%',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor:Colors['dark'].accent,
		borderRadius: 15,
  },
  snapBack: {
		width:'100%',
		height:'100%',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor:Colors['dark'].primaryLight,
		borderRadius: 15,
  },
	tableAddButton: {
    flex: 0,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 15,
    borderRadius: 40,
    backgroundColor: Colors['dark'].accent
  },
  inputText: {
    flex: 1,
    width: '100%',
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors['dark'].textDark,
  },
  inputBox: {
    width: '100%',
    backgroundColor: Colors['dark'].primaryLight,
    margin: 10,
    marginTop: 20,
    borderRadius: 15,
  },
});

