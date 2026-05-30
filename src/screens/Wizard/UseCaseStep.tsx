import React from 'react';
import { VStack, Text } from 'native-base';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import WizardStep from '../../ui/components/WizardStep';
import ChipGroup from '../../ui/components/ChipGroup';
import { useWizard } from '../../context/WizardContext';

const USE_CASES = [
  'Chat',
  'Code-assist',
  'Image-generation',
  'Embeddings',
  'Search',
  'Function-calling',
];

const schema = z.object({
  useCases: z.array(z.string()).min(1, 'Select at least one use case'),
});

type FormData = z.infer<typeof schema>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'WizardUseCase'>;

export default function UseCaseStep() {
  const navigation = useNavigation<Nav>();
  const { update } = useWizard();
  const {
    control,
    handleSubmit,
    formState: { isValid, errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: { useCases: [] },
  });

  const onBack = () => navigation.goBack();
  const onNext = (data: FormData) => {
    update({ useCases: data.useCases });
    navigation.navigate('WizardConstraints');
  };

  return (
    <WizardStep
      stepNumber={2}
      totalSteps={4}
      title="Use Cases"
      description="What will your app do with AI?"
      onNext={handleSubmit(onNext)}
      onBack={onBack}
      isNextDisabled={!isValid}
      testID="wizard-use-case"
    >
      <VStack space="4" mt="4">
        <Controller
          control={control}
          name="useCases"
          render={({ field: { onChange, value } }) => (
            <ChipGroup
              options={USE_CASES}
              selected={value}
              onChange={onChange}
              testID="use-case-chips"
            />
          )}
        />
        {errors.useCases && (
          <Text color="red.500" fontSize="sm">
            {errors.useCases.message}
          </Text>
        )}
      </VStack>
    </WizardStep>
  );
}
