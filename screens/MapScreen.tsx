import * as React from 'react';
import { Slider, StyleSheet } from 'react-native';

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
  const [gridScale, setGridScale] = React.useState(25)
  const theme = useColorScheme()


  return (
    <View style={styles.container}>
      <Button 
        icon='ios-add'
        size={{x: 60, y: 60}}
        style={{
          left: 0,
          top: 0,
          flex: 0,
          position: 'absolute',
          margin: 10,
        }}
        onPress={() => {
          ImagePicker.pickToken().then(tokenImage => {
            let token = ObjectFactory.createToken(tokenImage)
            Fire.shared.sendToken(token)
          })
        }}
      >
        <Ionicons name='ios-add' style={{marginTop: 5}} size={48} color={Colors[theme].textDark}/>
      </Button>

			<Slider
			  value={gridScale}
			  onValueChange={(value) => {
			 	 setGridScale(value)
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
          let mapImage = await ImagePicker.pickImage()
          let remoteMapImage = await Fire.shared.upload(mapImage)
          Fire.shared.sendMap(remoteMapImage)
        }}
      >
        <Ionicons name='ios-map' style={{marginTop: 5}} size={40} color={Colors[theme].textDark}/>
      </Button>
      <TokenMap
        gridScale={gridScale} 
        onTokenUpdate={(tokens, token) => {
          Fire.shared.sendToken(token)
        }}
        onTokenRemove={(token) => {
          Fire.shared.removeToken(token)
        }}
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
