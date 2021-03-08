import React from 'react'
import {Platform, Dimensions, View, Image, StyleSheet, } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import ReactNativeZoomableView from '../components/ZoomableView/src/ReactNativeZoomableView'
import AppState from '../util/AppState';
import Token from './Token';
import TokenControls from '../components/TokenControls.js';
import Colors from '../constants/Colors.ts';
import RNDraw from '../components/draw';
import Fire from '../util/Fire.js';
import ObjectFactory from '../util/ObjectFactory.js';


export default function TokenMap(props) {
  let {gridScale, onTokenUpdate } = props
  let local = null
  let art = null
  if (AppState.shared.map) {
    local = AppState.shared.map.local
    art = AppState.shared.map.art
  }

  const [tokens, setTokens] = React.useState(AppState.shared.tokens)
  const [mapImage, setMap] = React.useState(local)

  React.useEffect(() => {
    let unsubscribe = AppState.shared.addListener(() => {
      if (AppState.shared.map) {
        setMap(AppState.shared.map.local)
      }
      setTokens([...AppState.shared.tokens])
    })
    return unsubscribe
  }, []);



  const [selectedName, setSelectedName] = React.useState(null)
  const [zoomLevel, setZoomLevel] = React.useState(1.3)
  const tokenViews = tokens.map(token => {
    if (!token.size) token.size = 1
    return (
      <Token
        key={token.name+token.x+token.y}
        name={token.name}
        selected={selectedName == token.name}
        xPos={token.x}
        yPos={token.y}
        sensitivity={Platform.OS == 'ios' ? 1 : 1/(zoomLevel**2)}
        image={token.image}
        size={{x: gridScale*token.size, y: gridScale*token.size}}
        onMove={(xPos, yPos) => {
          let index = tokens.findIndex((item) => {return item.name == token.name})
          tokens[index].x = xPos
          tokens[index].y = yPos
          tokens[index].timestamp = Date.now()
          if (onTokenUpdate) onTokenUpdate(tokens, token)
        }}
        onPress={(pressed) => { 
          setSelectedName(pressed)
        }}
        >
        <Image source={{ uri: token.image }} 
        style={tokenStyle(gridScale, selectedName == token.name)}/>
      </Token>
    )
  })

  const findToken = (name) => {
    let index = tokens.findIndex((e) => e.name == name)
    if (index > -1) {
      return tokens[index]
    }
    else {
      return null
    }
  }

  const removeToken = (token) => {
    if (props.onTokenRemove) props.onTokenRemove(token)
  }
  const updateToken = (token) => {
    console.log("Updating Token:" + token)
    if (props.onTokenUpdate) props.onTokenUpdate(tokens, token)
  }

  return(
      <View style={styles.scrollBox}>
         <ReactNativeZoomableView
            initialZoom={zoomLevel}
            minZoom={1}
            maxZoom={2}
            zoomCenteringLevelDistance={1}
            movementSensibility={1.8}
            doubleTapDelay={0}
            zoomStep={0}
            bindToBorders={false}
            style={styles.zoomView}
            onShiftingAfter={(e) => {
              setTimeout(() => {
                setSelectedName('')
              }, 200)
            }}
            onZoomEnd={(e, ges, zoom) => {
              setZoomLevel(zoom.zoomLevel)
            }}
            onStartShouldSetPanResponder={(evt, gs) => {
              if (gs.numberActiveTouches == 1) {
                return !props.drawing
              }
              else {
                return true
              }
            }}
            onMoveShouldSetPanResponder={(evt, gs) => {
              if (gs.numberActiveTouches == 1) {
                return !props.drawing
              }
              else {
                return true
              }
            }}
          >
            {tokenViews}
            <TokenControls
              token={findToken(selectedName)}
              scale={gridScale}
              removeToken={removeToken}
              updateToken={updateToken}
            />
            <RNDraw
              strokes={art}
              containerStyle={{width: 418, height:800, backgroundColor: 'rgba(0,0,0,0.2)'}}
              color={props.drawColor || '#FFFFFF'}
              strokeWidth={4}
              onChangeStrokes={(strokes) => {
                if (strokes) {
                  let strokesBlob = []
                  for (let stroke of strokes) {
                    let key = stroke.key
                    let props = stroke.props
                    strokesBlob.push(JSON.stringify({key, props}))
                  }
                  Fire.shared.sendMap(ObjectFactory.createMap(AppState.shared.map, {art: strokesBlob}))
                }
              }}
              enabled={() => {return props.drawing}}
              clear={props.clearDraw}
              rewind={props.undoDraw}
            />
            <Image style={styles.image} source={{uri: mapImage }} resizeMode="contain"/>
  
          </ReactNativeZoomableView>
      </View>
  );
}

const tokenStyle = (gridScale, selected) => {
  if (selected) return ({
    flex: 0,
    height: gridScale,
    width: gridScale,
    borderRadius: gridScale/5,
    borderWidth: gridScale/15,
    borderColor: 'red'
  })
  else return ({
    flex: 0,
    height: gridScale,
    width: gridScale,
    borderRadius: gridScale/5,
    borderWidth: gridScale/25,
    borderColor: 'black'
  })
}

const styles = StyleSheet.create({
  scrollBox: {
    flex: 0,
    width: 414,
    height: 896,
    overflow: 'visible',
    backgroundColor: Colors['dark'].primaryDark,
  },
  zoomView: {
    flex: 1,
    width: null,
    height: null,
    overflow: 'visible',
  },
  image: {
    flex: 0,
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: -1,
  },
});
