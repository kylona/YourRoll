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


export default function ActionScreen(props) {

  const numColumns = 6
  const numRows = 10
  const navigation = props.navigation
  const [scrollEnabled, setScrollEnabled] = React.useState(true)
  const [update, forceUpdate] = React.useState(true)
  const [editing, setEditing] = React.useState(false)
  React.useEffect(() => {
    AppState.shared.addListener((state) => {
      forceUpdate(!update)
    })
  }, []);
  const newItems = [
    {grid: {x: 0, y: 0}, size: {x:4, y:1},
    renderFront: () => { return (
      <View style={styles.snapFront}>
        <TextInput
          defaultValue={AppState.shared.character.name}
           placeholder={"Name..."}
          style={styles.inputText}
          onEndEditing={(e) => {
            if (text == '') return
            var text = e.nativeEvent.text
            if (AppState.shared.character.name != text) {
              AppState.shared.character.name = text
              AppState.shared.saveState()
            }
          }}
        />
      </View>
    )},
    renderBack: () => {return(<View style={styles.snapBack}/>)}
    },
    {grid: {x: 4, y: 0}, size: {x:2, y:2},
    renderFront: () => {return (
			<View style={styles.snapFront}>
        <Avatar
          onPress={async () => {
						const image = await ImagePicker.pickToken()
						if (image != null) {
              const remoteImage = await Fire.shared.upload(image)
              AppState.shared.character.avatar = remoteImage
              AppState.shared.character.cachedAvatar = image
              AppState.shared.saveState()
						}
					}}
          size='100%'
          image={AppState.shared.character.cachedAvatar}
        />
			</View>

		)},
    renderBack: () => {return(<View style={styles.snapBack}/>)}
    },
    ]
    let count = 0
    for (let s in AppState.shared.character.coreStats) {
      let stat = AppState.shared.character.coreStats[s]
      newItems.push(
        {grid: {x: count%numColumns, y: 2+Math.floor(count/numColumns)}, size: {x:2, y:1},
        renderFront: () => { return (<View style={styles.snapFront}>
          <Text style={styles.labelText}>{stat}:</Text>
          <TextInput
            defaultValue={AppState.shared.character[stat]}
            placeholder={stat+ '...'}
            style={styles.inputText}
            onEndEditing={(e) => {
              if (text == '') return
              var text = e.nativeEvent.text
              if (AppState.shared.character[stat] != text) {
                AppState.shared.character[stat] = text
                AppState.shared.saveState()
              }
            }}
          />
          </View>
        )},
        renderBack: () => {return(<View style={styles.snapBack}/>)}
        }
      )
      count += 2
    }
    for (let s in AppState.shared.character.computedStats) {
      let stat = AppState.shared.character.computedStats[s]
      newItems.push(
        {grid: {x: count%numColumns, y: 2+Math.floor(count/numColumns)}, size: {x:2, y:1},
        renderFront: () => { return (<View style={styles.snapFront}>
          <Text style={styles.labelText}>{stat}:</Text>
          <Text style={styles.labelText}>{AppState.shared.character[stat]}</Text>
          </View>
        )},
        renderBack: () => {return(<View style={styles.snapBack}/>)}
        }
      )
      count += 2
    }
  const [items, setItems] = React.useState(newItems)

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
				items={items} 
				onSwipeRight={() => {navigation.jumpTo('Map');Keyboard.dismiss()}}
				onSwipeLeft={() => {navigation.jumpTo('Chat');Keyboard.dismiss()}}
        update={update} //for forced update
			/>
		</ScrollView>
    <TouchableOpacity
      style={styles.editButton(true)}
      onPress={() => {
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
    backgroundColor: Colors['dark'].accent,
    zIndex: 10,
  })},
});

