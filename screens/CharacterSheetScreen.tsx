import * as React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, RefreshControl, Keyboard, StyleSheet, Text, TextInput, View, Image, AsyncStorage, Linking } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import SnapGrid from '../components/SnapGrid.js';
import Fire from '../util/Fire';
import AppState from '../util/AppState';
import ObjectFactory from '../util/ObjectFactory';
import Colors from '../constants/Colors.ts'
import ImagePicker from '../util/ImagePicker';
import BlobCache from '../util/BlobCache';


export default function CharacterSheetScreen(props) {

  const [scrollEnabled, setScrollEnabled] = React.useState(true)
  const [characterStats, setCharacterStats] = React.useState(AppState.shared.character.stats) //code to remember characterStats
  const [statCalculations, setStatCalculations] = React.useState(AppState.shared.character.statCalculations)

  React.useEffect(() => {
    let unsubscribe = AppState.shared.addListener(() => {
      setCharacterStats({...AppState.shared.character.stats})
      setStatCalculations({...AppState.shared.character.statCalculations})

    })
    return unsubscribe
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.contentContainer}
        scrollEnabled={scrollEnabled}
      >
       <View style={styles.snapFront}>
       <Text style={{fontSize:30}}>This is the Character Sheet Screen</Text> 
       </View>
       <TouchableOpacity style={{...styles.snapFront, marginTop: 10}}
        onPress={async () => {
					let notificationToken = await AppState.shared.registerForPushNotificationsAsync()
          let user = ObjectFactory.createUser(AppState.shared)
          Fire.shared.sendUser(user)
        }}
        >
        <Text style={{fontSize:30}}>Push this to register for notifications</Text> 
        </TouchableOpacity>
       <TouchableOpacity style={{...styles.snapFront, marginTop: 10}}
        onPress={async () => {
          AsyncStorage.clear()
        }}
        >
        <Text style={{fontSize:30}}>Push this to wipe saved data</Text> 
        </TouchableOpacity>

      </ScrollView>
    </View>
	);
}


const styles = StyleSheet.create({
  container: {
		width: '100%',
		height: '100%',
  },
  scroll: {
		width: '100%',
		height: '100%',
    backgroundColor: Colors['dark'].primaryDark,
		position:'absolute',
  },
  contentContainer: {
    paddingTop: 15,
  },
  snapFront: {
    width:'100%',
    height:100,
		justifyContent: 'center',
    backgroundColor:Colors['dark'].accent,
    borderRadius: 15,
    alignItems: 'center',
  },
  snapBack: {
    width:'100%',
    height:'100%',
    backgroundColor:Colors['dark'].accentDark,
    borderRadius: 15,
  },
	leftEdge: {
    flex: 0,
    position: 'absolute',
    left: 0,
    width: 20,
    height: '100%',
    backgroundColor: 'black',
		zIndex: 5
  },
  rightEdge: {
    flex: 0,
    position: 'absolute',
    right: 0,
    width: 30,
    height: '100%',
    backgroundColor: 'black',
		zIndex: 5
	},
	inputText: {
    fontSize: 20,
    alignSelf: 'center',
    marginTop: 1,
    color: Colors['dark'].textDark
  },
	labelText: {
    fontSize: 20,
    alignSelf: 'center',
    marginTop: 1,
    color: Colors['dark'].textDark
  },
  avatar: {
    flex: 0,
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  editButton: () => {return({
    position: 'absolute',
    right: 15,
    bottom: 15,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors['dark'].accent,
    zIndex: 10,
  })},
});

