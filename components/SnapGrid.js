import React, { Component } from "react";
import { StyleSheet, View, PanResponder, Animated, Dimensions, Text, } from "react-native";
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import SnapDraggable from '../components/SnapDraggable.js';

export default function SnapGrid(props) {
    const extraVisibleRows = 4
    const colWidth = Dimensions.get('window').width / props.numColumns
    const rowHeight = colWidth
    const emptySquare = {empty: true}
    const snapObjs = []
    const screenSlide = new Animated.Value((props.numRows+extraVisibleRows)*rowHeight)
    const [snapGrid, setSnapGrid] = React.useState({})
    const [waitingGrid, setWaitingGrid] = React.useState()
    const [numRows, setNumRows] = React.useState(props.numRows)
    const [screenHeight, setScreenHeight] = React.useState((props.numRows+extraVisibleRows)*rowHeight)
    const [snappers, setSnappers] = React.useState([])

    React.useEffect(() => {
      let newSnappers = []
      for (let i in props.items) {
        let item = props.items[i]
        let snap = (
          <SnapDraggable
            key={Math.random()}
            pos={gridToPos(item.grid)}
            grid={item.grid}
            size={item.size}
            flipped={false}
            onGrab={(g, x, y) => {preOnGrab(g, x, y)}}
            onMove={(m, x, y) => {preOnMove(m, x, y)}}
            onRelease={(r, x, y) => {preOnRelease(r, x, y)}}
            width={colWidth*item.size.x}
            height={rowHeight*item.size.y}
            onDoubleTap={(tapped, x, y) => {onDoubleTap(tapped, x, y)}}
            onTap={item.onTap}
            renderFront={item.renderFront}
            renderBack={item.renderBack}
            editing={props.editing}
            id={i}
          />
          )
        let footprint = getFootprint(item, item.grid)
        for (let f in footprint) {
          snapGrid[footprint[f].x][footprint[f].y] = {empty: false, id: newSnappers.length}
        }
        newSnappers.push(snap)
      }
      setSnappers(newSnappers)
    }, [props.editing, props.update]);


    const getSquare = (grid) => {
      if (!snapGrid.hasOwnProperty(grid.x)) {
        return undefined
      }
      if (!snapGrid[grid.x].hasOwnProperty(grid.y)){
        return undefined
      }
      return snapGrid[grid.x][grid.y]
    }

    const getSnap = (grid) => {
      let square = getSquare(grid)
      if(square != undefined && !square.empty) {
        if (!snapRefs[square.id]) {
          console.log("SQUARE:")
          console.log(square)
          console.log(square.id)
        }
        else {
          return snapRefs[square.id].current
        }
      }
      else {
        return undefined
      }
    }

    const grabSnap = (snap) => {
      updateSnapGrid(snap.grid, snap, true)
    }

    const placeSnap = (snap, grid) => {
      if (!snapGrid.hasOwnProperty(grid.x)) snapGrid[grid.x] = {}
      updateSnapGrid(grid, snap, false)
      animatePlace(snap, grid)
    }

    const animatePlace = (snap, grid) => {
      let pos = gridToPos(grid)
      snap.snapToPos(pos)
    }

    const onTap = (tapped, x, y) => {

    }

    const onDoubleTap = (tapped, x, y) => {
      //setFlipped(!tapped.flipped)
      //tapped.setState({flipped: !tapped.flipped})
    }


    const preOnGrab = (grabbed, x, y) => {
      if (props.onGrab) props.onGrab()
      grabSnap(grabbed)
    }

    const preOnMove = (moved, x, y) => {
      if (props.onMove) props.onMove()
      let grid = overlapingGrid({x: x, y: y})
      if (waitingGrid && grid != waitingGrid) {
        setWaitingGrid(undefined)
      }
      if (shouldMovePosition(moved, grid)) {
        if (!waitingGrid) {
          setWaitingGrid(grid)
          setTimeout( () => {
            if (waitingGrid && waitingGrid == grid) {
              moveSnap(moved, grid)
              setWaitingGrid(undefined)
            }
          }, 100)
        }
      }
    }

    const preOnRelease = (released, x, y) => {
      if (props.onRelease) props.onRelease()
      setWaitingGrid(undefined)
      let grid = posToGrid({x: x, y: y})
      if (grid.x + released.size.x > props.numColumns) {
        grid.x = props.numColumns - released.size.x
      }
      if (shouldMovePosition(released, grid)) {
        moveSnap(released, grid)
      }
      placeSnap(released, grid)
      cleanRows()
      let newItems = [...props.items]
      newItems[released.id].pos = gridToPos(grid)
      newItems[released.id].grid = grid
      props.onUpdate(newItems)
    }

    const shouldMovePosition = (snap, grid) => {
      if (!grid) return false
      if (snap.grid.x == grid.x && snap.grid.y == grid.y) return false
      return true
    }

    const getSwappedList = (snap, grid) => {
      let swappedList = []
      let footprint = getFootprint(snap,grid)
      for (let f in footprint) {
          let swapped = getSnap(footprint[f])
          if (swapped && !swappedList.includes(swapped)){
            swappedList.push(swapped)
          }
      }
      return swappedList
    }

    const moveSnap = (snap, grid) => {
        if (!spotAvailable(grid, snap)) {
          let swappedList = getSwappedList(snap, grid)
          updateSnapGrid(grid, snap, true)
          let blocked = getFootprint(snap, grid)
          for (let s in swappedList) {
            let swapped = swappedList[s]
            grabSnap(swapped)
            let slot = findEmptySlot(swapped, blocked)
            swapped.setGrid(slot)
            placeSnap(swapped, slot)
          }
        }
        else {
          updateSnapGrid(grid, snap, true)
        }
        snap.setGrid(grid)
    }

    const getFootprint = (snap,grid) => {
      let footprint = []
      for (let dx = 0; dx < snap.size.x; dx++) {
        for (let dy = 0; dy < snap.size.y; dy++) {
          footprint.push({x: grid.x + dx, y: grid.y + dy})	
        }
      }
      return footprint
    }

    const updateSnapGrid = (grid, snap, clear) => {
        let footprint = getFootprint(snap, grid)
        let newNumRows = numRows
        for (let f in footprint) {
          let value = clear ? {empty: true} : {empty: false, id: snap.id, leader: false}
          let newSnapGrid = {...snapGrid}
          if (!newSnapGrid.hasOwnProperty(footprint[f].x)) continue
          newSnapGrid[footprint[f].x][footprint[f].y] = value
          setSnapGrid(newSnapGrid)
          newNumRows = Math.max(newNumRows, footprint[f].y)
        }
        if (newNumRows == numRows) return
        setNumRows(newNumRows)
        Animated.timing(screenSlide, {
          toValue: (newNumRows+extraVisibleRows)*rowHeight ,
          duration: 200,
          useNativeDriver: false,
          }
        ).start();
    }


    const isCloser = (test, closest, snap) => {
      let grid = snap.grid
      if (closest == null) return true
      let testDist = (Math.abs(grid.x - test.x) + Math.abs(grid.y - test.y))
      let closestDist = (Math.abs(grid.x - closest.x) + Math.abs(grid.y - closest.y))
      if (testDist < closestDist) return true
      if (testDist > closestDist) return false
      if (Math.min(Math.abs(grid.x - test.x), Math.abs(grid.y - test.y)) < Math.min(Math.abs(grid.x - closest.x), Math.abs(grid.y - closest.y))) return true
      if (test.y < closest.y) return true
      return false
      if (closest.x == dragging.x && closest.y == dragging.y) return true
      if (test.x == dragging.x && test.y == dragging.y) return false
      if (dragging.x < x < testX) return true
      if (dragging.x > x > testX) return true
      if (dragging.y < y < testY) return true
      if (dragging.y > y > testY) return true
      return false
    }

    const spotAvailable = (grid, snap) => {
        let footprint = getFootprint(snap,grid)
        for (let f in footprint) {
          if (footprint[f].x < 0 || footprint[f].x > props.numColumns) return false
          let square = getSquare(footprint[f])
          if (square && !square.empty) return false
        }
        return true
    }

    const findEmptySlot = (swapped, blocked) => {
      let closest = null
      for (let delX = 0; delX < props.numColumns; delX++) {
        for (let delY = 0; delY < numRows; delY++) {
          let test = {x: (swapped.grid.x + delX) % props.numColumns,
                      y: (swapped.grid.y + delY) % numRows
                     }
          let footprint = getFootprint(swapped, test)
          let clear = true
          for (let f in footprint) {
            if (blocked.some(e => e.x == footprint[f].x && e.y == footprint[f].y)) {
              clear = false
              break
            }
          }
          if (clear && spotAvailable(test, swapped) && isCloser(test, closest, swapped)) {
              closest = test
          }
        }
      }
      if (!closest) {
        return makeEmptySlot(swapped, blocked)
      }
      return closest
    }

    const makeEmptySlot = (swapped, blocked) => {
      let newSnapGrid = {...snapGrid}
      for (let c = 0; c < props.numColumns; c++) {
        for (let r = numRows; r < numRows + swapped.size.y; r++) {
          newSnapGrid[c][r] = emptySquare
        }
      }
      setSnapGrid(newSnapGrid)
      let slot = {x:0, y:numRows}
      let newNumRows = numRows + swapped.size.y
      setNumRows(numRows + swapped.size.y)
      Animated.timing(screenSlide, {
        toValue: (newNumRows+extraVisibleRows)*rowHeight ,
        duration: 200,
        useNativeDriver: false,
        }
      ).start();
      return slot
    }

    const cleanRows = () => {
      let newNumRows = 0
      for (let c = 0; c < props.numColumns; c++) {
        for (let r in snapGrid[c]) {
          if (snapGrid[c][r].empty) continue
          newNumRows = Math.max(r, newNumRows)
        }
      }
      newNumRows++;
      if (newNumRows == numRows) return
      setNumRows(newNumRows)
      Animated.timing(screenSlide, {
        toValue: (newNumRows+extraVisibleRows)*rowHeight ,
        duration: 800,
        useNativeDriver: false,
        isInteraction: false
        }
      ).start();
    }


    const gridToPos = (grid) => {
      return {x: grid.x*colWidth, y: grid.y*rowHeight}
    }

    const posToGrid = (pos) => {
      let grid = {x: Math.floor(pos.x/colWidth + 0.5), y: Math.floor(pos.y/rowHeight + 0.5)}
      grid.x = grid.x > props.numColumns-1 ? props.numColumns-1 : grid.x < 0 ? 0 : grid.x
      grid.y = grid.y < 0 ? 0 : grid.y
      return grid
    }

    const overlapingGrid = (pos) => {
      let closestGrid = posToGrid(pos)
      let closest = gridToPos(closestGrid)
      let normalized = {x: Math.abs(closest.x - pos.x)/colWidth, y: Math.abs(closest.y - pos.y)/rowHeight}
      let normalizedDist = normalized.x**2 + normalized.y**2
      if (normalizedDist > 0.25) return null
      return closestGrid;
    }

    screenSlide.addListener((value) => {
      setScreenHeight(value.value)
    })
    for (let i = 0; i < props.numColumns; i++) {
      snapGrid[i] = {}
    }




    /*let snapVisuals = []
    for (let c in snapGrid) {
      for (let r in snapGrid[c]) {
        let left = c*colWidth
        let top = r*rowHeight
        let text = snapGrid[c][r].id
        let textView = (
          <Text style={{position: 'absolute', left:left, top:top}}>
          {text}
          </Text>
        )
        snapVisuals.push(textView)
      }
    }
    for (let r in snapRefs) {
      let snap = snapRefs[r].current
      if(snap) snap.forceUpdate()
    }
    */
    return (
      <View style={{height: screenHeight, width:props.numColumns*colWidth}}>
        <GestureRecognizer
          style={{position:'absolute', zIndex:-1, width:'100%', height:'100%'}}
          onSwipeRight={props.onSwipeRight}
          onSwipeLeft={props.onSwipeLeft}
          directionalOffsetThreshold={20}
          velocityThreshold={0.6}
        />
        {snappers}
      </View>
    );
}


