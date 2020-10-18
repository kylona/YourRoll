import * as React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, RefreshControl, Keyboard, StyleSheet, Text, TextInput, View, Image, AsyncStorage, Linking } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import GestureRecognizer, {swipeDirections} from 'react-native-swipe-gestures';
import SnapGrid from '../components/SnapGrid.js';
import Fire from '../util/Fire';
import AppState from '../util/AppState';
import Colors from '../constants/Colors.ts'
import ImagePicker from '../util/ImagePicker';
import BlobCache from '../util/BlobCache';
import Avatar from '../components/Avatar';
import StatText from '../components/snaps/StatText';


export default function ActionScreen(props) {

  const numColumns = 6
  const numRows = 20
  const navigation = props.navigation
  const [scrollEnabled, setScrollEnabled] = React.useState(true)

  const [update, forceUpdate] = React.useState(false)
  const [character, setCharacter] = React.useState(AppState.shared.character)

  React.useEffect(() => {
    AppState.shared.addListener((state) => {
      setCharacter(AppState.shared.character)
      forceUpdate(!update)
    })
  }, []);
  const [editing, setEditing] = React.useState(false)


  return (
    <View style={styles.container}>
		<ScrollView style={styles.scroll} contentContainerStyle={styles.contentContainer}
			scrollEnabled={scrollEnabled}
		>
			<SnapGrid 
				numRows={numRows}
				numColumns={numColumns}
				onGrab={() => {setScrollEnabled(false)}}
				onRelease={() => { setScrollEnabled(true);}}
        onUpdate={(newItems) => {
          setItems(newItems)
        }}
        editing={editing}
				onSwipeRight={() => {navigation.jumpTo('Map');Keyboard.dismiss()}}
				onSwipeLeft={() => {navigation.jumpTo('Chat');Keyboard.dismiss()}}
        onDoubleTap={() => {setEditing(!editing)}}
        update={update} //for forced update
        scrollEnabled={scrollEnabled}
			/>
		</ScrollView>
    <TouchableOpacity
      style={styles.editButton(true)}
      onPress={() => {
        Keyboard.dismiss()
        setEditing(!editing)
      }}
    >
      <Ionicons name={editing ? 'md-save' : 'md-create' } size={30} color={Colors['dark'].textDark}/>
    </TouchableOpacity>
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
    height:'100%',
		justifyContent: 'center',
    backgroundColor:Colors['dark'].accent,
    borderRadius: 15,
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
  editButton: () => {return({
    position: 'absolute',
    right: 15,
    bottom: 15,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors['dark'].primaryLight,
    zIndex: 10,
  })},
});

