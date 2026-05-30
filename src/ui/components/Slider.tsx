import React from 'react';
import { VStack, Slider as NBSlider, Text, HStack } from 'native-base';

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  testID?: string;
}

export default function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  testID,
}: SliderProps) {
  return (
    <VStack space="2" testID={testID}>
      <HStack justifyContent="space-between">
        <Text color="text" fontSize="sm" fontWeight="500">
          {label}
        </Text>
        <Text color="primary.500" fontSize="sm" fontWeight="600">
          {value}
          {unit}
        </Text>
      </HStack>
      <NBSlider
        value={value}
        minValue={min}
        maxValue={max}
        step={step}
        onChange={onChange}
        colorScheme="primary"
        accessibilityLabel={label}
      >
        <NBSlider.Track>
          <NBSlider.FilledTrack />
        </NBSlider.Track>
        <NBSlider.Thumb />
      </NBSlider>
    </VStack>
  );
}
