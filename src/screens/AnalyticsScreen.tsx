import React from 'react';
import { Box, VStack, Heading, Text, ScrollView } from 'native-base';
import Card from '../ui/components/Card';

// TODO: replace with real data from Supabase
const MOCK_STATS = {
  recommendationsThisWeek: 3,
  totalSavedConfigs: 5,
  estimatedMonthlySpend: 42.5,
};

export default function AnalyticsScreen() {
  return (
    <Box flex={1} bg="background">
      <ScrollView px="4" pt="4">
        <Heading size="lg" color="text" mb="4">
          Analytics
        </Heading>

        <Card title="This Week">
          <VStack space="2">
            <Text color="text" fontSize="sm">
              Recommendations generated: {MOCK_STATS.recommendationsThisWeek}
            </Text>
            <Text color="text" fontSize="sm">
              Saved configs: {MOCK_STATS.totalSavedConfigs}
            </Text>
          </VStack>
        </Card>

        <Card title="Estimated Spend">
          <Text color="primary.500" fontSize="2xl" fontWeight="700">
            ${MOCK_STATS.estimatedMonthlySpend.toFixed(2)}
          </Text>
          <Text color="muted" fontSize="sm">
            / month across saved projects
          </Text>
        </Card>

        <Text color="muted" fontSize="xs" mt="4">
          More detailed charts coming soon.
        </Text>
      </ScrollView>
    </Box>
  );
}
