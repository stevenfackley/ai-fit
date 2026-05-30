import React from 'react';
import { Box, VStack, Heading, Text, Button, Pressable } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import { useWizard } from '../context/WizardContext';

type WelcomeNav = NativeStackNavigationProp<RootStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
  const navigation = useNavigation<WelcomeNav>();
  const { reset } = useWizard();

  const handleGetStarted = () => {
    reset();
    navigation.navigate('WizardOverview');
  };

  return (
    <Box flex={1} bg="background" justifyContent="center" alignItems="center" px="6">
      <VStack space="6" alignItems="center" width="100%">
        <Box bg="primary.500" rounded="2xl" px="6" py="3" mb="2">
          <Text color="white" fontSize="3xl" fontWeight="700">
            AI-Fit
          </Text>
        </Box>

        <Heading size="xl" color="text" textAlign="center">
          Your AI-to-app fitting service
        </Heading>

        <Text color="muted" fontSize="md" textAlign="center">
          Tell us about your project, and we'll recommend the perfect AI models for every
          part of your application.
        </Text>

        <Button
          size="lg"
          width="100%"
          onPress={handleGetStarted}
          accessibilityLabel="Get started"
        >
          Get Started
        </Button>

        <Pressable onPress={() => navigation.navigate('MainTabs')}>
          <Text color="primary.500" fontSize="sm" fontWeight="500">
            Skip to Dashboard
          </Text>
        </Pressable>
      </VStack>
    </Box>
  );
}
