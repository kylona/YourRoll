import * as React from 'react';
import {StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';


import EditScreenInfo from '../components/EditScreenInfo';
import {Button, Text, View } from '../components/Themed';
import TokenMap from '../components/TokenMap.js';
import BlobCache from '../util/BlobCache.js';
import Fire from '../util/Fire.js';
import AppState from '../util/AppState.js';
import ImagePicker from '../util/ImagePicker.js'
import ObjectFactory from '../util/ObjectFactory.js'
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';

export default function MapScreen() {
  let scale = 0
  if (AppState.shared.map) {
    scale = AppState.shared.map.scale
  }
  const [gridScale, setGridScale] = React.useState(scale)
  const [drawing, setDrawing] = React.useState(false)
  const [drawColor, setDrawColor] = React.useState('white')
  const clearDraw = React.useRef(() => {})
  const undoDraw = React.useRef(() => {})
  const theme = useColorScheme()

  React.useEffect(() => {
    return AppState.shared.addListener(() => {
      setGridScale(AppState.shared.map.scale) 
    })
  }, []);

  const slider = (
			<Slider
			  value={gridScale}
			  onValueChange={(value) => {
			 	 setGridScale(value)
			  }}
        onSlidingComplete={(value) => {
          Fire.shared.sendMapScale(value)
        }}
				style={{
          top: 0,
          flex: 0,
          position: 'absolute',
          margin: 10,
					width: 200,
          height: 60,
          zIndex: 2
        }}
				minimumValue={5}
				maximumValue={50}
				minimumTrackTintColor={Colors[theme].textDark}
				maximumTrackTintColor={Colors[theme].textDark}
				thumbTintColor={Colors[theme].accent}
			/>
  )
  const palette = (
    <View style={{
      top: 0,
      left: 60,
      right: 60,
      flex: 0,
      zIndex: 2,
      height:60,
      margin: 10,
      position: 'absolute',
      justifyContent: 'center',
      alignItems: 'center',
      flexDirection: 'row',
    }}>
      <Button size={{x: 30, y: 30}} style={{ backgroundColor: 'white'}}
        onPress={() => {
          setDrawColor('white')
        }}
      />
      <Button size={{x: 30, y: 30}} style={{ backgroundColor: 'black'}}
        onPress={() => {
          setDrawColor('black')
        }}
      />
      <Button size={{x: 30, y: 30}} style={{ backgroundColor: Colors['dark'].accent}}
        onPress={() => {
          setDrawColor(Colors['dark'].accent)
        }}
      />
      <Button size={{x: 30, y: 30}} style={{ backgroundColor: '#009900'}}
        onPress={() => {
          setDrawColor('#009900')
        }}
      />
      <Button size={{x: 30, y: 30}} style={{ backgroundColor: '#dd0000'}}
        onPress={() => {
          setDrawColor('#dd0000')
        }}
      />
      <Button size={{x: 30, y: 30}} style={{ backgroundColor: '#0000dd'}}
        onPress={() => {
          setDrawColor('#0000dd')
        }}
      />
    </View>
  )


  return (
    <View style={styles.container}>
      <Button 
        size={{x: 60, y: 60}}
        style={{
          left: 0,
          top: 0,
          flex: 0,
          position: 'absolute',
          margin: 10,
        }}
        onPress={() => {
          if (drawing) {
            undoDraw.current()
          }
          else {
            ImagePicker.pickToken().then(tokenImage => {
              let token = ObjectFactory.createToken(tokenImage)
              Fire.shared.sendToken(token)
            })
          }
        }}
      >
        <Ionicons name={drawing ? 'arrow-undo-outline' : 'ios-add'}  style={{marginTop: 5}} size={40} color={Colors[theme].textDark}/>
      </Button>

      {drawing ? palette:  slider}
      <Button 
        icon='ios-map'
        size={{x: 60, y: 60}}
        style={{
          right: 0,
          top: 0,
          flex: 0,
          position: 'absolute',
          margin: 10,
        }}
        onPress={async () => {
          if (drawing) {
            clearDraw.current()
          }
          else {
            let mapImage = await ImagePicker.pickImage()
            let remoteMapImage = await Fire.shared.upload(mapImage)
            Fire.shared.sendMap(ObjectFactory.createMap(AppState.shared, {image: remoteMapImage}))
          }
        }}
      >
        <Ionicons name={drawing ? 'ios-trash' : 'ios-map'}  style={{marginTop: 5}} size={40} color={Colors[theme].textDark}/>
      </Button>
      <Button 
        size={{x: 60, y: 60}}
        style={{
          right: 0,
          bottom: 0,
          flex: 0,
          position: 'absolute',
          margin: 10,
        }}
        onPress={async () => {
          setDrawing(!drawing)
        }}
      >
        <Ionicons name={drawing ? 'ios-move' : 'ios-brush'} style={{marginTop: 0}} size={40} color={Colors[theme].textDark}/>
      </Button>
      <TokenMap
        gridScale={gridScale} 
        onTokenUpdate={(tokens, token) => {
          Fire.shared.sendToken(token)
        }}
        onTokenRemove={(token) => {
          Fire.shared.removeToken(token)
        }}
        drawing={drawing}
        clearDraw={clearDraw}
        undoDraw={undoDraw}
        drawColor={drawColor}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
});
