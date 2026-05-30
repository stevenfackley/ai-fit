import React from 'react';
import { Box, VStack, HStack, Heading, Divider } from 'native-base';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  footer?: React.ReactNode;
  testID?: string;
}

export default function Card({ children, title, footer, testID }: CardProps) {
  return (
    <Box
      bg="card"
      rounded="lg"
      shadow="3"
      p="4"
      mb="4"
      testID={testID}
      accessibilityRole="none"
    >
      {title && (
        <>
          <Heading size="sm" color="text" mb="2">
            {title}
          </Heading>
          <Divider mb="3" />
        </>
      )}
      <VStack space="2">{children}</VStack>
      {footer && (
        <>
          <Divider mt="3" mb="2" />
          <HStack justifyContent="flex-end">{footer}</HStack>
        </>
      )}
    </Box>
  );
}
