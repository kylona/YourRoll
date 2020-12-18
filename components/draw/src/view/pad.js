import React from 'react'
import {
  View,
  PanResponder,
  StyleSheet,
  Platform
} from 'react-native'
import Svg, {Path} from 'react-native-svg'
import Pen from '../tools/pen'
import Point from '../tools/point'
const {OS} = Platform
// import Bezier from '../tools/bezier'
export default function Whiteboard(props) {

    const [tracker, setTracker] = React.useState(0)
    const [currentPoints, setCurrentPoints] = React.useState([])
    const [previousStrokes, setPreviousStrokes] = React.useState([])
    const [newStroke, setNewStroke] = React.useState([])
    const [pen, setPen] = React.useState(new Pen())
    React.useEffect(() => {
      if (props.strokes) {
        let strokes = []
        for (let stroke of props.strokes) {
          strokes.push(<Path key={stroke.key} {...stroke.props} />)
        }
        setPreviousStrokes(strokes)
      }
    }, [props.strokes])

    const _panResponder = PanResponder.create({
      onStartShouldSetPanResponder: (evt, gs) => {
        return gs.numberActiveTouches == 1 && props.enabled()
      },
      onMoveShouldSetPanResponder: (evt, gs) => {
        return gs.numberActiveTouches == 1 && props.enabled()
      },
      onPanResponderGrant: (evt, gs) => onResponderGrant(evt, gs),
      onPanResponderMove: (evt, gs) => onResponderMove(evt, gs),
      onPanResponderRelease: (evt, gs) => onResponderRelease(evt, gs)
    })
    const onChangeStrokes = props.onChangeStrokes || function (){}

    const rewind = () => {
      if (currentPoints.length > 0 || previousStrokes.length < 1) return
      let strokes = previousStrokes
      strokes.pop()
      pen.rewindStroke()
      setPreviousStrokes([...strokes])
      setCurrentPoints([])
      setTracker(tracker - 1)
      onChangeStrokes(strokes)
    }

    const clear = () => {
      setPreviousStrokes([])
      setCurrentPoints([])
      setNewStroke([])
      setTracker(0)
      pen.clear()
      onChangeStrokes([])
    }


    React.useEffect(() => {
      props.rewind.current = rewind
      props.clear.current = clear
    })

    const onTouch = (evt, gs) => {
      if (gs.numberActiveTouches != 1) {
        setCurrentPoints([])
        return
      }
      let x, y, timestamp
      [x, y, timestamp] = [evt.nativeEvent.locationX, evt.nativeEvent.locationY, evt.nativeEvent.timestamp]
      let newPoint = new Point(x, y, timestamp)
      let newCurrentPoints = [...currentPoints]
      newCurrentPoints.push(newPoint)
      setCurrentPoints(newCurrentPoints)
    }

    const onResponderGrant = (evt, gs) => {
      onTouch(evt, gs);
    }

    const onResponderMove = (evt, gs) => {
      onTouch(evt, gs);
    }

    const onResponderRelease = () => {
      let strokes = previousStrokes
      if (currentPoints.length < 1) return
      let newElement = (
        <Path
          key={tracker}
          d={pen.pointsToSvg(currentPoints)}
          stroke={props.color || '#000000'}
          strokeWidth={props.strokeWidth || 4}
          fill="none"
        />
      )

      pen.addStroke(currentPoints)
      
      onChangeStrokes([...previousStrokes, newElement])
      setPreviousStrokes([...previousStrokes, newElement])
      setCurrentPoints([])
      setTracker(tracker + 1)
    }

    const _onLayoutContainer = (e) => {
      pen.setOffset(e.nativeEvent.layout);
    }

    return (
      <View
        onLayout={_onLayoutContainer}
        style={[
          styles.drawContainer,
          props.containerStyle,
        ]}>
        {props.children}
        <View style={styles.svgContainer} {..._panResponder.panHandlers}>
          <Svg style={styles.drawSurface}>
              {previousStrokes}
              <Path
                key={tracker}
                d={pen.pointsToSvg(currentPoints)}
                stroke={props.color || "#000000"}
                strokeWidth={props.strokeWidth || 4}
                fill="none"
              />
          </Svg>
        </View>
      </View>
    )
}

let styles = StyleSheet.create({
  drawContainer: {
    flex: 1,
    display: 'flex',
  },
  svgContainer: {
    flex: 1,
  },
  drawSurface: {
    flex: 1,
  },
})
