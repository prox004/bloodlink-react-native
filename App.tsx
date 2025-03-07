import 'react-native-get-random-values';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider, useAuth } from './app/Auth/AuthContext';
import OnboardingScreen from './app/Onboarding/OnboardingScreen';
import LoginScreen from './app/Auth/LoginScreen';
import AdditionalDataScreen from './app/Auth/AdditionalDataScreen';
import TabNavigator from './app/TabNavigator';
import { ActivityIndicator, View } from 'react-native';
import { db } from './app/Auth/config/firebase';

const Stack = createStackNavigator();

function LoadingScreen() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#e74c3c" />
    </View>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();
  const [profileCompleted, setProfileCompleted] = React.useState<boolean | null>(null);
  const [isFirstLaunch, setIsFirstLaunch] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    // Check if user has completed profile
    const checkProfile = async () => {
      if (user) {
        const userDoc = await db.collection('users').doc(user.uid).get();
        setProfileCompleted(userDoc.exists);
      } else {
        setProfileCompleted(null);
      }
    };

    // Check if it's first launch
    const checkFirstLaunch = async () => {
      try {
        // You can use AsyncStorage to check first launch
        setIsFirstLaunch(false); // For now, setting to false
      } catch (error) {
        setIsFirstLaunch(false);
      }
    };

    checkFirstLaunch();
    checkProfile();
  }, [user]);

  if (loading || isFirstLaunch === null || (user && profileCompleted === null)) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          // Authenticated stack
          profileCompleted ? (
            // User with completed profile
            <Stack.Screen name="TabNavigator" component={TabNavigator} />
          ) : (
            // User needs to complete profile
            <Stack.Screen 
              name="AdditionalData" 
              component={AdditionalDataScreen}
              options={{ headerShown: true, title: 'Complete Profile' }}
            />
          )
        ) : (
          // Non-authenticated stack
          <>
            {isFirstLaunch && (
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
            )}
            <Stack.Screen name="Login" component={LoginScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
} 