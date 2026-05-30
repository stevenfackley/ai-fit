import React from 'react';
import { VStack, HStack, Text, Progress, Box, Heading } from 'native-base';

interface WizardStepProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  description?: string;
  children: React.ReactNode;
  onNext?: () => void;
  onBack?: () => void;
  isNextDisabled?: boolean;
  testID?: string;
}

export default function WizardStep({
  stepNumber,
  totalSteps,
  title,
  description,
  children,
  onNext,
  onBack,
  isNextDisabled,
  testID,
}: WizardStepProps) {
  const progress = (stepNumber / totalSteps) * 100;

  return (
    <Box flex={1} bg="background" p="4" testID={testID}>
      <VStack space="4" flex={1}>
        <HStack justifyContent="space-between" alignItems="center">
          <Text color="muted" fontSize="sm">
            Step {stepNumber} of {totalSteps}
          </Text>
          <Text color="muted" fontSize="sm">
            {Math.round(progress)}%
          </Text>
        </HStack>
        <Progress value={progress} colorScheme="primary" size="xs" />

        <Heading size="lg" color="text">
          {title}
        </Heading>
        {description && (
          <Text color="muted" fontSize="sm">
            {description}
          </Text>
        )}

        <Box flex={1}>{children}</Box>

        <HStack justifyContent="space-between" mt="4">
          {onBack ? (
            <Text
              color="primary.500"
              fontSize="md"
              fontWeight="500"
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              Back
            </Text>
          ) : (
            <Box />
          )}
          {onNext && (
            <Text
              color={isNextDisabled ? 'muted.400' : 'primary.500'}
              fontSize="md"
              fontWeight="600"
              onPress={isNextDisabled ? undefined : onNext}
              accessibilityRole="button"
              accessibilityLabel="Next step"
            >
              Next
            </Text>
          )}
        </HStack>
      </VStack>
    </Box>
  );
}
