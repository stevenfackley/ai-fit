import React from 'react';
import { NativeBaseProvider, StorageManager, ColorMode } from 'native-base';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RootNavigator from './navigation/RootNavigator';
import nativebaseTheme from './ui/theme/nativebaseTheme';
import { WizardProvider } from './context/WizardContext';

const colorModeManager: StorageManager = {
  get: async () => {
    const val = await AsyncStorage.getItem('theme');
    return (val === 'dark' ? 'dark' : 'light') as ColorMode;
  },
  set: async (value: ColorMode) => {
    await AsyncStorage.setItem('theme', value ?? 'light');
  },
};

export default function App() {
  return (
    <SafeAreaProvider>
      <NativeBaseProvider theme={nativebaseTheme} colorModeManager={colorModeManager}>
        <WizardProvider>
          <NavigationContainer>
            <StatusBar style="auto" />
            <RootNavigator />
          </NavigationContainer>
        </WizardProvider>
      </NativeBaseProvider>
    </SafeAreaProvider>
  );
}
