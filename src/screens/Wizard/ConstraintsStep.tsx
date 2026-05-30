import React from 'react';
import { VStack, HStack, Checkbox, Text } from 'native-base';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import WizardStep from '../../ui/components/WizardStep';
import Slider from '../../ui/components/Slider';
import { useWizard } from '../../context/WizardContext';

const schema = z.object({
  budget: z.number().min(0),
  latency: z.number().min(0),
  compliance: z.array(z.string()).optional(),
  providers: z.array(z.string()).min(1, 'Select at least one provider'),
});

type FormData = z.infer<typeof schema>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'WizardConstraints'>;

export default function ConstraintsStep() {
  const navigation = useNavigation<Nav>();
  const { update } = useWizard();
  const {
    control,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { budget: 50, latency: 1000, compliance: [], providers: ['openai', 'anthropic'] },
  });

  const onBack = () => navigation.goBack();
  const onNext = (data: FormData) => {
    update({
      budget: data.budget,
      maxLatencyMs: data.latency,
      compliance: data.compliance ?? [],
      preferredProviders: data.providers,
    });
    navigation.navigate('WizardSummary');
  };

  return (
    <WizardStep
      stepNumber={3}
      totalSteps={4}
      title="Constraints"
      description="Set your budget, latency, and compliance requirements."
      onNext={handleSubmit(onNext)}
      onBack={onBack}
      isNextDisabled={!isValid}
      testID="wizard-constraints"
    >
      <VStack space="5" mt="4">
        <Controller
          control={control}
          name="budget"
          render={({ field: { value, onChange } }) => (
            <Slider
              label="Monthly Budget"
              value={value}
              min={0}
              max={500}
              step={5}
              unit=" USD"
              onChange={onChange}
              testID="budget-slider"
            />
          )}
        />

        <Controller
          control={control}
          name="latency"
          render={({ field: { value, onChange } }) => (
            <Slider
              label="Max Latency"
              value={value}
              min={100}
              max={3000}
              step={50}
              unit=" ms"
              onChange={onChange}
              testID="latency-slider"
            />
          )}
        />

        <VStack space="2">
          <Text color="text" fontSize="sm" fontWeight="500">
            Compliance
          </Text>
          <Controller
            control={control}
            name="compliance"
            render={({ field: { value, onChange } }) => (
              <HStack space="4">
                <Checkbox
                  value="gdpr"
                  isChecked={value?.includes('gdpr')}
                  onChange={(checked) => {
                    const next = checked
                      ? [...(value || []), 'gdpr']
                      : (value || []).filter((v) => v !== 'gdpr');
                    onChange(next);
                  }}
                >
                  <Text fontSize="sm">GDPR</Text>
                </Checkbox>
                <Checkbox
                  value="hipaa"
                  isChecked={value?.includes('hipaa')}
                  onChange={(checked) => {
                    const next = checked
                      ? [...(value || []), 'hipaa']
                      : (value || []).filter((v) => v !== 'hipaa');
                    onChange(next);
                  }}
                >
                  <Text fontSize="sm">HIPAA</Text>
                </Checkbox>
              </HStack>
            )}
          />
        </VStack>

        <VStack space="2">
          <Text color="text" fontSize="sm" fontWeight="500">
            Preferred Providers
          </Text>
          <Controller
            control={control}
            name="providers"
            render={({ field: { value, onChange } }) => (
              <HStack space="4">
                <Checkbox
                  value="openai"
                  isChecked={value.includes('openai')}
                  onChange={(checked) => {
                    const next = checked
                      ? [...value, 'openai']
                      : value.filter((v) => v !== 'openai');
                    onChange(next);
                  }}
                >
                  <Text fontSize="sm">OpenAI</Text>
                </Checkbox>
                <Checkbox
                  value="anthropic"
                  isChecked={value.includes('anthropic')}
                  onChange={(checked) => {
                    const next = checked
                      ? [...value, 'anthropic']
                      : value.filter((v) => v !== 'anthropic');
                    onChange(next);
                  }}
                >
                  <Text fontSize="sm">Anthropic</Text>
                </Checkbox>
              </HStack>
            )}
          />
          {errors.providers && (
            <Text color="red.500" fontSize="sm">
              {errors.providers.message}
            </Text>
          )}
        </VStack>
      </VStack>
    </WizardStep>
  );
}
