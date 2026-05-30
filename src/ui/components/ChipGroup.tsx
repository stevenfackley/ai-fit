import React from 'react';
import { Box, HStack, Pressable, Text } from 'native-base';

interface ChipGroupProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  testID?: string;
}

export default function ChipGroup({ options, selected, onChange, testID }: ChipGroupProps) {
  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((s) => s !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <HStack flexWrap="wrap" space="2" testID={testID}>
      {options.map((opt) => {
        const isSelected = selected.includes(opt);
        return (
          <Pressable
            key={opt}
            onPress={() => toggle(opt)}
            accessibilityRole="button"
            accessibilityLabel={opt}
            accessibilityState={{ selected: isSelected }}
          >
            <Box
              px="3"
              py="1.5"
              rounded="full"
              bg={isSelected ? 'primary.500' : 'muted.100'}
              borderWidth={1}
              borderColor={isSelected ? 'primary.500' : 'muted.300'}
              mb="2"
            >
              <Text
                fontSize="sm"
                color={isSelected ? 'white' : 'text'}
                fontWeight={isSelected ? '600' : '400'}
              >
                {opt}
              </Text>
            </Box>
          </Pressable>
        );
      })}
    </HStack>
  );
}
