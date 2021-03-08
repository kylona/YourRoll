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
import TableAdder from '../components/TableAdder';
import TableItem from '../components/TableItem';


export default function TableScreen(props) {

  const [scrollEnabled, setScrollEnabled] = React.useState(true)
  const [tables, setTables] = React.useState(AppState.shared.tables.list)

  React.useEffect(() => {
    let unsubscribe = AppState.shared.addListener(() => {
      setTables({...AppState.shared.tables.list})
      
    })
    return unsubscribe
  }, []);

  let tableItems = []
  tableItems.push(
    <TableAdder key={"adder"}/>
  )
  for (let t in tables) {
    let table = tables[t]
    tableItems.push( 
      <TableItem
        key={table}
        index={t}
        name={table.name}
        onPress={() => {
          AppState.shared.changeTable(table)
          props.navigation.pop()
        }}
        onLongPress={() => {
          console.log(props.context) 
        }}/>
    )
  }
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.contentContainer}
        scrollEnabled={scrollEnabled}
      >
       {tableItems}
      </ScrollView>
    </View>
	);
}


const styles = StyleSheet.create({
  container: {
		width: '100%',
		height: '100%',
    paddingBottom: 40,
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
    flexDirection: 'row',
    width:'100%',
    backgroundColor:Colors['dark'].accent,
    borderRadius: 15,
    alignItems: 'center',
    padding: 5,
    marginTop: 10,
  },
  snapBack: {
    width:'100%',
    height:'100%',
    backgroundColor:Colors['dark'].accentDark,
    borderRadius: 15,
  },
  macroDeleteButton: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    marginRight: 5,
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
	macroText: {
    flex: 10,
    fontSize: 20,
    alignSelf: 'flex-start',
    margin: 10,
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

