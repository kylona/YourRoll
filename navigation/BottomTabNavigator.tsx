import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import * as React from 'react';

import Colors from '../constants/Colors';
import useColorScheme from '../hooks/useColorScheme';
import MapScreen from '../screens/MapScreen';
import ActionScreen from '../screens/ActionScreen';
import ChatScreen from '../screens/ChatScreen';
import MacroScreen from '../screens/MacroScreen';
import { BottomTabParamList, TabOneParamList, TabTwoParamList } from '../types';
import { TouchableOpacity, Text, View } from 'react-native';
import {HeaderTitle, HeaderRight} from '../components/Header.js';
import AppState from '../util/AppState';

const BottomTab = createBottomTabNavigator<BottomTabParamList>();
let colorScheme = 'dark'

export default function BottomTabNavigator() {
  colorScheme = useColorScheme();
  const [chatBadgeCount, setChatBadgeCount] = React.useState(0)
  React.useEffect(() => {
    AppState.shared.addListener(() => {
      setChatBadgeCount(AppState.shared.unreadMessages)
    })
  }, []);

  return (
    <BottomTab.Navigator
      initialRouteName="Character"
      screenOptions={{headerShown: false}}
      lazy={false}
      tabBarOptions={{
        activeTintColor: Colors[colorScheme].tabIconSelected,
        inactiveTintColor: Colors[colorScheme].tabIconDefault,
      }}>
      <BottomTab.Screen
        name="Map"
        component={MapNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="md-map" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Character"
        component={ActionNavigator}
        options={{
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="ios-body" color={color} />,
        }}
      />
      <BottomTab.Screen
        name="Chat"
        component={ChatNavigator}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon name="ios-text" color={color} />,
          tabBarBadge: AppState.shared.unreadMessages == 0 ? undefined : AppState.shared.unreadMessages
        }}
      />
    </BottomTab.Navigator>
  );
}

// You can explore the built-in icon families and icons on the web at:
// https://icons.expo.fyi/
function TabBarIcon(props: { name: string; color: string }) {
  return <Ionicons size={25} style={{ marginBottom: -3 }} {...props} />;
}

// Each tab has its own navigation stack, you can read more about this pattern here:
// https://reactnavigation.org/docs/tab-based-navigation#a-stack-navigator-for-each-tab
const MapStack = createStackNavigator<TabOneParamList>();

function MapNavigator() {
  return (
    <MapStack.Navigator>
      <MapStack.Screen
        name="MapScreen"
        component={MapScreen}
        options={{
					headerShown:false
				}}
      />
    </MapStack.Navigator>
  );
}

const ActionStack = createStackNavigator<TabTwoParamList>();

function ActionNavigator() {
  return (
    <ActionStack.Navigator>
      <ActionStack.Screen
        name="ActionScreen"
        component={ActionScreen}
        options={{
					headerShown:false
				}}
      />
    </ActionStack.Navigator>
  );
}

const ChatStack = createStackNavigator<TabTwoParamList>();

function ChatNavigator() {
  return (
    <ChatStack.Navigator>
      <ChatStack.Screen
        name="ChatScreen"
        component={ChatScreen}
        options={{
					headerShown:false,
				}}
      />
    </ChatStack.Navigator>
  );
}
