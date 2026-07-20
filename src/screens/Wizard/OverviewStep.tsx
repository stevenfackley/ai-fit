import React from 'react';
import { VStack, TextArea, Text } from 'native-base';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import WizardStep from '../../ui/components/WizardStep';
import { useWizard } from '../../context/WizardContext';

const schema = z.object({
  projectDescription: z.string().min(10, 'Please describe your project in at least 10 characters'),
});

type FormData = z.infer<typeof schema>;
type Nav = NativeStackNavigationProp<RootStackParamList, 'WizardOverview'>;

export default function OverviewStep() {
  const navigation = useNavigation<Nav>();
  const { update } = useWizard();
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
  });

  const onNext = (data: FormData) => {
    update({ projectDescription: data.projectDescription });
    navigation.navigate('WizardUseCase');
  };

  return (
    <WizardStep
      stepNumber={1}
      totalSteps={4}
      title="Project Overview"
      description="Describe your project idea in a sentence or two."
      onNext={handleSubmit(onNext)}
      testID="wizard-overview"
      isNextDisabled={!isValid}
    >
      <VStack space="3" mt="4">
        <Controller
          control={control}
          name="projectDescription"
          render={({ field: { onChange, value } }) => (
            <TextArea
              value={value}
              onChangeText={onChange}
              placeholder="e.g., A chatbot that helps users debug code with image uploads..."
              autoCompleteType="off"
              h="40"
              accessibilityLabel="Project description"
              tvParallaxProperties={undefined}
              onTextInput={undefined}
            />
          )}
        />
        {errors.projectDescription && (
          <Text color="red.500" fontSize="sm">
            {errors.projectDescription.message}
          </Text>
        )}
      </VStack>
    </WizardStep>
  );
}
