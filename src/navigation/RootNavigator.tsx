import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { House, Gear, ChartBar } from 'phosphor-react-native';
import WelcomeScreen from '../screens/WelcomeScreen';
import OverviewStep from '../screens/Wizard/OverviewStep';
import UseCaseStep from '../screens/Wizard/UseCaseStep';
import ConstraintsStep from '../screens/Wizard/ConstraintsStep';
import SummaryStep from '../screens/Wizard/SummaryStep';
import ResultsScreen from '../screens/ResultsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import type { Recommendation } from '../hooks/useRecommendation';

export type RootStackParamList = {
  Welcome: undefined;
  WizardOverview: undefined;
  WizardUseCase: undefined;
  WizardConstraints: undefined;
  WizardSummary: undefined;
  Results: { recommendations: Recommendation[]; totalEstimatedCost: number };
  MainTabs: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Analytics: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          if (route.name === 'Home') return <House color={color} size={size} weight="regular" />;
          if (route.name === 'Analytics') return <ChartBar color={color} size={size} weight="regular" />;
          if (route.name === 'Settings') return <Gear color={color} size={size} weight="regular" />;
          return null;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={WelcomeScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="WizardOverview" component={OverviewStep} />
      <Stack.Screen name="WizardUseCase" component={UseCaseStep} />
      <Stack.Screen name="WizardConstraints" component={ConstraintsStep} />
      <Stack.Screen name="WizardSummary" component={SummaryStep} />
      <Stack.Screen name="Results" component={ResultsScreen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
    </Stack.Navigator>
  );
}
