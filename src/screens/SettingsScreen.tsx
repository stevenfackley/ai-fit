import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Input,
  ScrollView,
  useToast,
  useColorMode,
} from 'native-base';
import DarkModeToggle from '../ui/components/DarkModeToggle';
import * as SecureStore from 'expo-secure-store';

const OPENAI_KEY_STORE = 'openai_api_key';
const ANTHROPIC_KEY_STORE = 'anthropic_api_key';

export default function SettingsScreen() {
  const [openAiKey, setOpenAiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const { colorMode, toggleColorMode } = useColorMode();
  const toast = useToast();

  useEffect(() => {
    SecureStore.getItemAsync(OPENAI_KEY_STORE).then((val) => setOpenAiKey(val ?? ''));
    SecureStore.getItemAsync(ANTHROPIC_KEY_STORE).then((val) => setAnthropicKey(val ?? ''));
  }, []);

  const saveKeys = async () => {
    await Promise.all([
      SecureStore.setItemAsync(OPENAI_KEY_STORE, openAiKey),
      SecureStore.setItemAsync(ANTHROPIC_KEY_STORE, anthropicKey),
    ]);
    toast.show({
      title: 'Saved',
      description: 'API keys stored securely',
      placement: 'top',
      bg: 'secondary.500',
    });
  };

  return (
    <Box flex={1} bg="background">
      <ScrollView px="4" pt="4">
        <Heading size="lg" color="text" mb="4">
          Settings
        </Heading>

        <VStack space="6" mb="8">
          <Box>
            <Text color="text" fontSize="sm" fontWeight="600" mb="2">
              OpenAI API Key
            </Text>
            <Input
              value={openAiKey}
              onChangeText={setOpenAiKey}
              placeholder="sk-..."
              secureTextEntry
              accessibilityLabel="OpenAI API key"
            />
          </Box>

          <Box>
            <Text color="text" fontSize="sm" fontWeight="600" mb="2">
              Anthropic API Key
            </Text>
            <Input
              value={anthropicKey}
              onChangeText={setAnthropicKey}
              placeholder="sk-ant-..."
              secureTextEntry
              accessibilityLabel="Anthropic API key"
            />
          </Box>

          <Button onPress={saveKeys}>Save Keys</Button>
        </VStack>

        <Box mb="6">
          <DarkModeToggle
            isDark={colorMode === 'dark'}
            onToggle={() => toggleColorMode()}
          />
        </Box>

        <Text color="muted" fontSize="xs">
          Version 0.1.0
        </Text>
      </ScrollView>
    </Box>
  );
}
