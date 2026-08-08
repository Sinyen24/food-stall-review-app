import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

// ─── Theme Hook ───────────────────────────────────────────────────────────────
import { useTheme } from '../theme/useTheme';

// ─── Real Screens ─────────────────────────────────────────────────────────────
import HomeScreen      from '../screens/HomeScreen';
import MyReviewsScreen from '../screens/MyReviewsScreen';
import ProfileScreen   from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,

        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home')      iconName = focused ? 'home'   : 'home-outline';
          if (route.name === 'MyReviews') iconName = focused ? 'star'   : 'star-outline';
          if (route.name === 'Profile')   iconName = focused ? 'person' : 'person-outline';

          return (
            <View style={focused ? styles.activeIcon : styles.icon}>
              <Icon name={iconName} size={focused ? 22 : 20} color={color} />
            </View>
          );
        },

        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor:   colors.primary,
        tabBarInactiveTintColor: colors.text.quaternary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      })}
    >
      <Tab.Screen name="Home"      component={HomeScreen}      options={{ tabBarLabel: 'Home' }} />
      <Tab.Screen name="MyReviews" component={MyReviewsScreen} options={{ tabBarLabel: 'My Reviews' }} />
      <Tab.Screen name="Profile"   component={ProfileScreen}   options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  icon:       { alignItems: 'center', justifyContent: 'center', width: 40, height: 28 },
  activeIcon: { alignItems: 'center', justifyContent: 'center', width: 40, height: 28, borderRadius: 14 },
});

export default MainTabNavigator;
