import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './Screens/Dashboard';
import ProfileScreen from './Screens/ProfileScreen';
import InboxScreen from './Screens/FindBlood';
import Icon from 'react-native-vector-icons/Ionicons'; // Vector icons
import { StyleSheet, View, Text } from 'react-native';
import AddRequest from './Screens/AddRequest';
import FindBlood from './Screens/FindBlood';
const Tab = createBottomTabNavigator();

const CustomTabBarLabel = ({ focused, label }: { focused: boolean; label: string }) => (
  <Text style={[styles.tabBarLabel, focused ? styles.activeTabBarLabel : styles.inactiveTabBarLabel]}>
    {label}
  </Text>
);

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName: string;

          if (route.name === 'Dashboard') {
            iconName = 'home-outline';
          } else if (route.name === 'Profile') {
            iconName = 'person-outline';
          } else if (route.name === 'FindBlood') {
            iconName = 'search-outline';
          } else if (route.name === 'Request') {
            iconName = 'add-circle-outline';
          } else {
            iconName = 'ellipse-outline'; // Default icon
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarLabel: ({ focused }) => (
          <CustomTabBarLabel focused={focused} label={route.name} />
        ),
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#e74c3c',
        tabBarInactiveTintColor: '#a5a5a5',
        tabBarItemStyle: styles.tabBarItem,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={HomeScreen} />
      <Tab.Screen name="Request" component={AddRequest} />
      <Tab.Screen name="FindBlood" component={FindBlood} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    height: 70, // Increases tab bar height
    paddingBottom: 2.5,
    paddingTop: 2.5,
  },
  tabBarItem: {
    marginVertical: 5,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  activeTabBarLabel: {
    color: '#e74c3c',
  },
  inactiveTabBarLabel: {
    color: '#a5a5a5',
  },
});

export default TabNavigator;
