import React, { Component } from "react";
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, ScrollView, View, PanResponder, Animated, Dimensions, Text, } from "react-native";
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import SnapDraggable from '../components/SnapDraggable.js';
import StatText from '../components/snaps/StatText';
import SnapAvatar from '../components/snaps/SnapAvatar';
import AppState from '../util/AppState';
import SnapAdder from '../components/SnapAdder';
import Colors from '../constants/Colors';

export default function SnapGrid(props) {
    const extraVisibleRows = 4
    const colWidth = Dimensions.get('window').width / props.numColumns
    const rowHeight = colWidth
    const emptySquare = {empty: true}
    const snapObjs = []
    const screenSlide = new Animated.Value((props.numRows+extraVisibleRows)*rowHeight)
    const [actionLayout, setActionLayout] = React.useState(AppState.shared.character.actionLayout)
    const [shouldDelete, setShouldDelete] = React.useState(false)
    let waitingGrid = null
    const [numRows, setNumRows] = React.useState(props.numRows)
    console.log(numRows)
    const [screenHeight, setScreenHeight] = React.useState((props.numRows+extraVisibleRows)*rowHeight)
    React.useEffect(() => {
      let unsubscribe = AppState.shared.addListener(() => {
        setActionLayout({...AppState.shared.character.actionLayout})
      })
      return unsubscribe
    },[])

    const gridToPos = (grid) => {
      return {x: grid.x*colWidth, y: grid.y*rowHeight}
    }

    const posToGrid = (pos, size) => {
      let grid = {x: Math.floor(pos.x/colWidth + 0.5), y: Math.floor(pos.y/rowHeight + 0.5)}
      grid.x = grid.x < 0 ? 0 : grid.x
      if (grid.x + size.x > props.numColumns-1) grid.x = props.numColumns - size.x
      grid.y = grid.y < 0 ? 0 : grid.y
      return grid
    }

    const updateLayout = (snap, grid) => {
      if (!AppState.shared.character.actionLayout.hasOwnProperty(snap.id)) {
        AppState.shared.character.actionLayout[snap.id] = snap
      }
      AppState.shared.character.actionLayout[snap.id].grid = grid
      AppState.shared.character.actionLayout[snap.id].pos = gridToPos(grid)
      AppState.shared.saveState()
    }

    const preOnGrab = (snap, x, y) => {
      console.log("GRABBING", snap)
      props.onGrab(snap, x, y)
    }

    const preOnMove = (snap, x, y, pageX, pageY) => {
      if (screenHeight - y < 280 &&
        Math.abs(Dimensions.get('window').width/2 - (x + snap.size.x*colWidth/2)) < snap.size.x*colWidth/2) {
        setShouldDelete(true)
      }
      else {
        setShouldDelete(false)
      }
      let grid = posToGrid({x, y}, snap.size)
      if (waitingGrid != grid) {
        waitingGrid = grid
        setTimeout( () => {
          if (waitingGrid == grid) {
            console.log("Hover Detected")
          }
        }, 100)
      }
    }

    const getOverlappingSnaps = (snap, grid, blocked) => {
      let olSnap = new Set()
      let minX = grid.x
      let maxX = grid.x + snap.size.x - 1
      let minY = grid.y
      let maxY = grid.y + snap.size.y - 1
      let searchedSnaps = actionLayout
      if (blocked) searchedSnaps = [...actionLayout, ...blocked]
      for (let id in searchedSnaps) {
        if (id == snap.id) continue
        let item = actionLayout[id] 
        let iminX = item.grid.x
        let imaxX = item.grid.x + item.size.x - 1
        let iminY = item.grid.y
        let imaxY = item.grid.y + item.size.y - 1
        if ((minX <= iminX && iminX <= maxX) || (iminX <= minX && minX <= imaxX)) {
          if ((minY <= iminY && iminY <= maxY) || (iminY <= minY && minY <= imaxY)) {
            olSnap.add(item)
          }
        }
      }
      return [...olSnap.values()]
    }

    const findNewSpot = (replaced, blocked) => {
      for (let delX = 0; delX < props.numColumns; delX++) {
        for (let delY = 0; delY < numRows; deyY++) {
          let testGrid = {x: (replaced.grid.x + delX) % props.numColumns,
                          y: (replaced.grid.y + deyY) % numRows
                         }
          
        }
      }
    }

    const findNewSpots = (replaced, blocked) => {
      
    }

    const preOnRelease = (snap, x, y) => {
      props.onRelease(snap, x, y)
      if (screenHeight - y < 280 &&
        Math.abs(Dimensions.get('window').width/2 - (x + snap.size.x*colWidth/2)) < snap.size.x*colWidth/2) {
        delete AppState.shared.character.actionLayout[snap.id]
        setShouldDelete(false)
        AppState.shared.saveState()
      }
      else if (screenHeight - y < Dimensions.get('window').width/2.5) {
        snap.snapToPos(snap.pos)
      }
      else {
        let grid = posToGrid({x, y}, snap.size)
        let olSnap = getOverlappingSnaps(snap, grid)
        let updateNewSpot = null
        if (olSnap.length != 0) {
          updateNewSpot = findNewSpots(olSnap, [{snap: snap, grid: grid}])
        }
        snap.snapToPos(gridToPos(grid), () => {
          updateLayout(snap,grid)
          if (updateNewSpot) updateNewSpot()
        })
      }
    }


    const getSnapsFromLayout = (layout, flipped, doOnRelease) => {
      let snaps = []
      for (let id in layout) {
        let item = layout[id]
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
                layout[id].display = text
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
                layout[id].display = text
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
            flipped={flipped}
            onGrab={(g, x, y) => {preOnGrab(g, x, y)}}
            onMove={(m, x, y, pageX, pageY) => {preOnMove(m, x, y, pageX, pageY)}}
            onRelease={(r, x, y) => doOnRelease(r, x, y, item)}
            width={colWidth*item.size.x}
            height={rowHeight*item.size.y}
            onDoubleTap={(tapped, x, y) => {props.onDoubleTap(tapped, x, y)}}
            onTap={item.onTap}
            renderFront={renderFront}
            renderBack={renderBack}
            id={id}
          />
        )
      }
      return snaps

    }
    const adderPosToGrid = (pos) => {
      pos.y += Dimensions.get('window').height - rowHeight
      let grid = {x: Math.floor(pos.x/colWidth + 0.5), y: Math.floor(pos.y/rowHeight + 0.5)}
      return grid
    }
    const gridToAdderPos = (grid) => {
      let pos = {x: grid.x*colWidth, y: grid.y*rowHeight}
      pos.y -= Dimensions.get('window').height - rowHeight
      return pos
    }

    const addToGrid = (snap, x, y, item) => {
      props.onRelease(snap, x, y)
      let adderGrid = adderPosToGrid({x, y})
      console.log(x, y)
      console.log(adderGrid.x, adderGrid.y)
      let screenGrid = adderPosToGrid({x: x - adderPosition.current, y})
      screenGrid.y += 1 - snap.size.y
      if (y + Dimensions.get('window').width/2.5 > 0) {
        snap.snapToPos(snap.pos)
      }
      else {
        let snapPos = gridToAdderPos(adderGrid)
        snap.snapToPos(snapPos, () => {
          item.id = snap.id
          updateLayout(item,screenGrid)
        })
      }
    }

    const [adderPosition, setAdderPosition] = React.useState({current: Dimensions.get('window').width})
    let snapAdder = null
    if (props.editing) {
      let id = Math.max(...Object.keys(actionLayout)) + 6
      console.log(id)
			let snapOptions = {}
      snapOptions[id++] = ( {grid: {x: 0, y: 0}, size: {x:6, y:1}, type:"SnapText", display:"Stat:$X"})
      snapOptions[id++] = ( {grid: {x: 6, y: 0}, size: {x:2, y:1}, type:"SnapText", display:"Stat:$X"})
      snapOptions[id++] = ( {grid: {x: 8, y: 0}, size: {x:3, y:1}, type:"SnapText", display:"Stat:$X"})
      snapOptions[id++] = ( {grid: {x: 11, y: 0}, size: {x:4, y:1}, type:"SnapText", display:"Stat:$X"})
      snapOptions[id++] = ( {grid: {x: 15, y: 0}, size: {x:1, y:1}, type:"SnapText", display:"$X"})
      snapOptions[id++] = ( {grid: {x: 16, y: 0}, size: {x:2, y:2}, type:"Avatar"})
      snapAdder = (
          <ScrollView
            snapToInterval={colWidth}
            onScroll={(e) => {
              adderPosition.current = e.nativeEvent.contentOffset.x
            }}
            scrollEventThrottle={0.5}
            contentOffset={{x: Dimensions.get('window').width, y: 0}}
            scrollEnabled={props.scrollEnabled}
            horizontal={true}
            contentContainerStyle={{
              height: Dimensions.get('window').width/2.5,
              alignSelf: 'flex-end',
              backgroundColor:Colors['dark'].primary,
            }}

          >
            <View style={{
              backgroundColor:Colors['dark'].primary,
              justifyContent: 'flex-end',
              height: Dimensions.get('window').width/2.5,
              width: Dimensions.get('window').width*3,
            }}>
              {getSnapsFromLayout(snapOptions, false, addToGrid)}
            </View>
          </ScrollView>
      )
    }

    let trashColor = shouldDelete ? Colors['dark'].accent : Colors['dark'].primaryDark
    let deleteIcon = props.editing ? (
        <Ionicons
          name='ios-trash'
          size={60}
          color={trashColor}
          style={{position:'absolute', bottom: 100, height: 60, alignSelf:'center'}}
        />
    ) : null

    return (
      <View style={{width:Dimensions.get('window').width, height:rowHeight*numRows}}>
        <View style={{alignSelf:'flex-end'}}>
          {snapAdder}
        </View>
        {getSnapsFromLayout(actionLayout, props.editing,(r, x, y) => {preOnRelease(r, x, y)})}
        {deleteIcon}
      </View>
    )

}


