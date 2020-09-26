import * as React from 'react';
import {Animated, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Text, View } from '../components/Themed';
import Recorder from '../util/Recorder';
import Fire from '../util/Fire';
import ObjectFactory from '../util/ObjectFactory';
import Colors from '../constants/Colors.ts';
import { Ionicons } from '@expo/vector-icons';
import AppState from '../util/AppState';

export default function TableAdder(props) {

	const [name, setName] = React.useState('')


  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter a Table ID</Text>
      <View style={styles.inputBox}>
        <TextInput
          //defaultValue={}
          placeholder={"Enter a Table ID"}
          placeholderTextColor={Colors['dark'].textLight}
          style={styles.inputText}
          onChangeText={(text) => {
						setName(text.toLowerCase())					
          }}
        />
      </View>
			<TouchableOpacity
				style={styles.tableAddButton}
				onPress={ () => {
					if (name != '') {
            let cleanName = name.replace("Table_", "").replace(" ", "").trim().toLowerCase()
            let newTable = ObjectFactory.createTable({
              id: "Table_" + cleanName,
              name: "",
            })

            if (AppState.shared.tables.list.findIndex((e) => {e.id == newTable.id}) == -1) {
              AppState.shared.tables.list.push(newTable)
              AppState.shared.changeTable(newTable)
							let getNotified = async () => {
								let notificationToken = await AppState.shared.registerForPushNotificationsAsync()
								let user = {
									id: notificationToken.replace("ExponentPushToken", "").replace("[","").replace("]",""),
								}
								Fire.shared.addUser(user)
                console.log("Pushing Notification Token")
							}
              getNotified()
						}
					}
				}}
			>
        <Text style={styles.inputText}>Join</Text>
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    backgroundColor: Colors['dark'].primary,
    borderRadius: 20,
    padding: 10,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors['dark'].textDark,
    margin: 15,
  },
  inputBox: {
    width: '100%',
    backgroundColor: Colors['dark'].primaryLight,
    margin: 10,
    marginTop: 20,
    borderRadius: 15,
  },
  playbackControl: {
    flex: 0,
    flexDirection: 'row',
    backgroundColor: Colors['dark'].primaryLight,
    width: 200,
    margin: 10,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: Colors['dark'].textLight,
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  textWrapper: {
    flex: 0,
    backgroundColor: Colors['dark'].primaryLight,
    margin: 10,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
