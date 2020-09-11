import React from 'react'
import {Platform, Dimensions, View, Image, StyleSheet, } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'
import ReactNativeZoomableView from '@dudigital/react-native-zoomable-view/src/ReactNativeZoomableView'
import Token from './Token';
import TokenControls from '../components/TokenControls.js';
import Colors from '../constants/Colors.ts';

export default function TokenMap(props) {
  let { tokens, mapImage, gridScale, onTokenUpdate } = props
  const [selectedName, setSelectedName] = React.useState(null)
  const [zoomLevel, setZoomLevel] = React.useState(1.3)
  const tokenViews = tokens.map(token => {
    return (
      <Token
        key={token.name+token.x+token.y}
        name={token.name}
        selected={selectedName == token.name}
        xPos={token.x}
        yPos={token.y}
        sensitivity={Platform.OS == 'ios' ? 1 : 1/(zoomLevel**2)}
        image={token.image}
        size={{x: gridScale, y: gridScale}}
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
            onShiftingBefore={() => {setSelectedName('')}}
            onZoomEnd={(e, ges, zoom) => {
              setZoomLevel(zoom.zoomLevel)
            }}
          >
            {tokenViews}
            <TokenControls
              token={findToken(selectedName)}
              scale={gridScale}
              removeToken={removeToken}
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
    marginLeft: '-40%',
  },
});
