import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  ScrollView,
  useToast,
  Pressable,
} from 'native-base';
import { useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';
import Card from '../ui/components/Card';
import { Copy } from 'phosphor-react-native';
import * as Clipboard from 'expo-clipboard';
import type { Recommendation } from '../hooks/useRecommendation';

type ResultsRoute = {
  params: { recommendations: Recommendation[]; totalEstimatedCost: number };
};
type ResultsNav = NativeStackNavigationProp<RootStackParamList, 'Results'>;

export default function ResultsScreen() {
  const route = useRoute() as ResultsRoute;
  const navigation = useNavigation<ResultsNav>();
  const toast = useToast();
  const { recommendations = [], totalEstimatedCost = 0 } = route.params ?? {};

  const copySnippet = (snippet: string) => {
    Clipboard.setStringAsync(snippet);
    toast.show({
      title: 'Copied',
      description: 'Snippet copied to clipboard',
      placement: 'top',
      bg: 'secondary.500',
    });
  };

  const exportConfig = () => {
    const config = {
      generatedAt: new Date().toISOString(),
      recommendations,
      totalEstimatedCost,
    };
    Clipboard.setStringAsync(JSON.stringify(config, null, 2));
    toast.show({
      title: 'Exported',
      description: 'Config JSON copied to clipboard',
      placement: 'top',
      bg: 'secondary.500',
    });
  };

  return (
    <Box flex={1} bg="background">
      <ScrollView px="4" pt="4" pb="20">
        <Heading size="lg" color="text" mb="2">
          Your Recommendations
        </Heading>
        <Text color="muted" fontSize="sm" mb="4">
          Estimated total cost: ${totalEstimatedCost.toFixed(2)}/mo
        </Text>

        {recommendations.map((rec) => (
          <Card key={rec.task} title={`${rec.task} — ${rec.displayName}`}>
            <HStack space="2" alignItems="center">
              <Box bg="primary.100" px="2" py="0.5" rounded="md">
                <Text color="primary.600" fontSize="xs" fontWeight="600">
                  {rec.provider}
                </Text>
              </Box>
              <Text color="muted" fontSize="xs">
                ~{rec.estimatedLatencyMs}ms
              </Text>
            </HStack>

            <VStack space="1" mt="2">
              {rec.reasons.map((reason, rIdx) => (
                <Text key={rIdx} color="text" fontSize="sm">
                  • {reason}
                </Text>
              ))}
            </VStack>

            <Text color="primary.500" fontSize="sm" fontWeight="600" mt="2">
              ${rec.estimatedMonthlyCost.toFixed(2)}/mo
            </Text>

            {rec.snippet && (
              <Box bg="muted.50" rounded="md" p="3" mt="2">
                <HStack justifyContent="space-between" alignItems="center" mb="1">
                  <Text color="muted" fontSize="xs" fontWeight="500">
                    SDK Snippet
                  </Text>
                  <Pressable
                    onPress={() => copySnippet(rec.snippet)}
                    accessibilityLabel="Copy snippet"
                  >
                    <Copy size={16} color="#6B7280" />
                  </Pressable>
                </HStack>
                <Text color="text" fontSize="xs" fontFamily="mono">
                  {rec.snippet}
                </Text>
              </Box>
            )}
          </Card>
        ))}

        <Button size="lg" onPress={exportConfig} mb="6">
          Export Config
        </Button>

        <Button variant="ghost" onPress={() => navigation.navigate('Welcome')}>
          Start Over
        </Button>
      </ScrollView>
    </Box>
  );
}
