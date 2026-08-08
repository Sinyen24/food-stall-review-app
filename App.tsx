import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// ─── Theme Provider ───────────────────────────────────────────────────────────
import { ThemeProvider } from './theme/ThemeContext';

// ─── Auth Screens ─────────────────────────────────────────────────────────────
import LoginScreen    from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';

// ─── Main App (Drawer → Tabs → Screens) ──────────────────────────────────────
import DrawerNavigator from './navigation/DrawerNavigator';

// ─── Detail Screens (pushed onto Stack) ──────────────────────────────────────
import StallDetailScreen   from './screens/StallDetailScreen';
import AddReviewScreen     from './screens/AddReviewScreen';
import ManageStallsScreen  from './screens/ManageStallsScreen';
import StallFormScreen     from './screens/StallFormScreen';

// ─── Stack Param List ─────────────────────────────────────────────────────────
export type RootStackParamList = {
  Login:         undefined;
  Register:      undefined;
  MainApp:       undefined;
  StallDetail:   { stallId: string; stall: object };  // MongoDB string ObjectId
  AddReview:     { stallId: string; stallName: string };  // MongoDB string ObjectId
  ManageStalls:  undefined;
  StallForm:     { stall: object | null };
};

const Stack = createStackNavigator<RootStackParamList>();

// ─── App ──────────────────────────────────────────────────────────────────────
const App = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Login"
              screenOptions={({ navigation }) => {
                // Note: Theme colors will be used in individual screens
                // cardStyle will be overridden by screen backgrounds
                return {
                  headerShown: false,
                  cardStyle: { backgroundColor: '#F9F6F2' },
                };
              }}
            >
            {/* ── Auth Flow ── */}
            <Stack.Screen name="Login"    component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />

            {/* ── Main App (Drawer wraps Tabs) ── */}
            <Stack.Screen name="MainApp"  component={DrawerNavigator} />

            {/* ── Detail Screens (pushed from Home / StallDetail) ── */}
            <Stack.Screen
              name="StallDetail"
              component={StallDetailScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="AddReview"
              component={AddReviewScreen}
              options={{ headerShown: false }}
            />

            {/* ── Admin Screens ── */}
            <Stack.Screen
              name="ManageStalls"
              component={ManageStallsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="StallForm"
              component={StallFormScreen}
              options={{ headerShown: false }}
            />
            </Stack.Navigator>
          </NavigationContainer>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
