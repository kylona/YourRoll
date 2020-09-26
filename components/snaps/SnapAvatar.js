import * as React from 'react';
import {Animated, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Text, View } from '../../components/Themed';
import Recorder from '../../util/Recorder';
import Fire from '../../util/Fire';
import ObjectFactory from '../../util/ObjectFactory';
import MessageParser from '../../util/MessageParser';
import ImagePicker from '../../util/ImagePicker';
import Avatar from '../../components/Avatar';
import Colors from '../../constants/Colors.ts';
import { Ionicons } from '@expo/vector-icons';
import AppState from '../../util/AppState';

export default function SnapAvatar(props) {

  const [character, setCharacter] = React.useState(AppState.shared.character)

  React.useEffect(() => {
    let unsubscribe = AppState.shared.addListener(() => {
      setCharacter(AppState.shared.character)
    })
    return unsubscribe
  },[])

	if (!props.back) {
		
		return (
			<View style={styles.snapFront}>
        <TouchableOpacity
          style={{width:'90%', height:'90%', borderRadius: 100}}
          onPress={async () => {
            const image = await ImagePicker.pickToken()
            if (image != null) {
              AppState.shared.character.cachedAvatar = image
              AppState.shared.saveState()
              const remoteImage = await Fire.shared.upload(image)
              AppState.shared.character.avatar = remoteImage
              AppState.shared.saveState()
            }
          }}
          delayLongPress={50}
          onLongPress={props.onLongPress}
          onPressOut={props.onPressOut}
          >
            <Image style={styles.avatar} source={{uri: character.cachedAvatar}} />
          </TouchableOpacity>
      </View>
		);

	}

	else return (
		<View style={styles.snapBack}>
				<Text key={"AvatarImage"} multiline={true} style={styles.inputText}>Avatar Image</Text>
		</View>
	)
}


const styles = StyleSheet.create({
  snapFront: {
		width:'100%',
		height:'100%',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor:Colors['dark'].accent,
		borderRadius: 15,
    padding: 5,
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
    margin: 5,
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
	avatar: {
    flex: 0,
    width: '100%',
    height: '100%',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
});
