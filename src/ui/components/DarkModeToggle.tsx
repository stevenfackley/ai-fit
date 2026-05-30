import React from 'react';
import { HStack, Switch, Text } from 'native-base';

interface DarkModeToggleProps {
  isDark: boolean;
  onToggle: (value: boolean) => void;
  testID?: string;
}

export default function DarkModeToggle({ isDark, onToggle, testID }: DarkModeToggleProps) {
  return (
    <HStack alignItems="center" space="3" testID={testID}>
      <Text color="text" fontSize="sm">
        Dark Mode
      </Text>
      <Switch
        isChecked={isDark}
        onToggle={() => onToggle(!isDark)}
        colorScheme="primary"
        accessibilityLabel="Toggle dark mode"
      />
    </HStack>
  );
}
