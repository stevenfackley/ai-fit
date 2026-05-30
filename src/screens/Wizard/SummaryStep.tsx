import React from 'react';
import { VStack, Text, Button, Spinner, useToast } from 'native-base';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import WizardStep from '../../ui/components/WizardStep';
import { useRecommendation } from '../../hooks/useRecommendation';
import { useWizard } from '../../context/WizardContext';

type Nav = NativeStackNavigationProp<RootStackParamList, 'WizardSummary'>;

export default function SummaryStep() {
  const navigation = useNavigation<Nav>();
  const { recommend, loading } = useRecommendation();
  const { state } = useWizard();
  const toast = useToast();

  const onBack = () => navigation.goBack();

  const onSubmit = async () => {
    try {
      const result = await recommend({
        projectDescription: state.projectDescription,
        // Normalize to lowercase to match worker USE_CASE_REQUIREMENTS keys
        useCases: state.useCases.map((uc) => uc.toLowerCase()),
        budgetUsdPerMonth: state.budget,
        maxLatencyMs: state.maxLatencyMs,
        compliance: state.compliance,
        preferredProviders: state.preferredProviders,
        estimatedRequestsPerMonth: 10_000,
        averageTokensPerRequest: 2_000,
      });
      navigation.navigate('Results', {
        recommendations: result.recommendations,
        totalEstimatedCost: result.totalEstimatedCost,
      });
    } catch (err: any) {
      toast.show({
        title: 'Error',
        description: err.message || 'Failed to get recommendations',
        placement: 'top',
        bg: 'red.500',
      });
    }
  };

  return (
    <WizardStep
      stepNumber={4}
      totalSteps={4}
      title="Review & Submit"
      description="Double-check your answers before we generate recommendations."
      onBack={onBack}
      testID="wizard-summary"
    >
      <VStack space="4" mt="4" flex={1}>
        <Text color="text" fontSize="sm">
          Project: {state.projectDescription || '—'}
        </Text>
        <Text color="text" fontSize="sm">
          Use Cases: {state.useCases.join(', ') || '—'}
        </Text>
        <Text color="text" fontSize="sm">
          Budget: ${state.budget}/mo
        </Text>
        <Text color="text" fontSize="sm">
          Max Latency: {state.maxLatencyMs}ms
        </Text>
        <Text color="text" fontSize="sm">
          Providers: {state.preferredProviders.join(', ')}
        </Text>

        <Button
          mt="auto"
          size="lg"
          onPress={onSubmit}
          isDisabled={loading}
          accessibilityLabel="Submit and get recommendations"
        >
          {loading ? <Spinner color="white" /> : 'Get Recommendations'}
        </Button>
      </VStack>
    </WizardStep>
  );
}
