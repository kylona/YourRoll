import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';
import { Platform, ColorSchemeName } from 'react-native';
import { TouchableOpacity, RefreshControl, Keyboard, StyleSheet, Text, TextInput, View, Image, AsyncStorage, Linking } from 'react-native';
import NotFoundScreen from '../screens/NotFoundScreen';
import MacroScreen from '../screens/MacroScreen';
import TableScreen from '../screens/TableScreen';
import CharacterSheetScreen from '../screens/CharacterSheetScreen';
import SettingsScreen from '../screens/SettingsScreen';
import { RootStackParamList } from '../types';
import BottomTabNavigator from './BottomTabNavigator';
import LinkingConfiguration from './LinkingConfiguration';
import Colors from '../constants/Colors.ts';
import {HeaderTitle, HeaderRight} from '../components/Header.js';
import AppState from '../util/AppState';
import Avatar from '../components/Avatar';
import { Ionicons } from '@expo/vector-icons';
import {setJSExceptionHandler, setNativeExceptionHandler} from 'react-native-exception-handler';


setJSExceptionHandler((error, isFatal) => {
 //Ignore all errors in mission mode. Let's hope for the best.
 //TODO handle things better
});

// If you are not familiar with React Navigation, we recommend going through the
// "Fundamentals" guide: https://reactnavigation.org/docs/getting-started
export default function Navigation({ colorScheme }: { colorScheme: ColorSchemeName }) {
  const YourRollTheme = {
    colors: {
      primary: Colors[colorScheme].primary,
      notification: Colors[colorScheme].accentDarker,
      background: Colors[colorScheme].primaryDark,
      border: Colors[colorScheme].primary,
      card: Colors[colorScheme].primaryDark,
      text: Colors[colorScheme].textLight,
    },
  };
  return (
    <NavigationContainer
      linking={LinkingConfiguration}
      theme={YourRollTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}

// A root stack navigator is often used for displaying modals on top of all other content
// Read more here: https://reactnavigation.org/docs/modal
const Stack = createStackNavigator<RootStackParamList>();

function RootNavigator() {
  return (
    <Stack.Navigator
        screenOptions={ ({route, navigation}) => ({
          headerTitle: () => {
            return (
              <HeaderTitle/>
            )
          },
          headerShown: true,
          headerTitleAlign: 'center',
          headerStyle: {
            height: Platform.OS == 'ios' ? 90 : 80,
            backgroundColor: Colors['dark'].primary
          },
          headerLeft: () => {
            let currentScreen = route.name
            if (route.name == 'Root') return (
              <HeaderRight
                onPress={() => {
                  navigation.push("TableScreen")
                }}
              >
                <Ionicons name='ios-arrow-back' size={30} color={Colors['dark'].textLight}/>
              </HeaderRight>
            )
            else return (
              <HeaderRight
                onPress={() => {
                  navigation.pop()
                }}
              >
                <Ionicons name='ios-arrow-back' size={30} color={Colors['dark'].textLight}/>
              </HeaderRight>
            )
          },
          headerRight: () => {
            let currentScreen = route.name
            if (route.name == 'Root') {
              currentScreen = 'Character'
              if (route.state) {
                currentScreen = route.state.routeNames[route.state.index]
              }
            }
            switch(currentScreen) {
              case 'Chat': return (
                <HeaderRight
                  onPress={() => {
                    navigation.push("MacroScreen")
                  }}
                >
                  <Text style={{fontSize:30, fontWeight:'bold', color:Colors['dark'].textLight}}>#</Text>
                </HeaderRight>
              )
              case 'Character': return (
                <HeaderRight
                  onPress={() => {
                    navigation.push("MacroScreen")
                  }}
                >
                  <Avatar 
                    image={AppState.shared.character.cachedAvatar}
                    onPress={() => {
                      navigation.navigate("CharacterSheetScreen")
                    }}
                    size={50}
                  />
                </HeaderRight>
              )
              case 'TableScreen': return (
                <HeaderRight
                  onPress={() => {
                    navigation.navigate("SettingsScreen")
                  }}
                >
                  <Avatar 
                    image={AppState.shared.player.cachedAvatar}
                    onPress={() => {
                      navigation.navigate("SettingsScreen")
                    }}
                    size={50}
                  />
                </HeaderRight>
              )
              default: return null
            }
          }
        })}
    >
      <Stack.Screen name="Root" component={BottomTabNavigator} />
      <Stack.Screen name="TableScreen" component={TableScreen} />
      <Stack.Screen name="MacroScreen" component={MacroScreen} />
      <Stack.Screen name="CharacterSheetScreen" component={CharacterSheetScreen} />
      <Stack.Screen name="SettingsScreen" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
