import clsx from 'clsx';
import React, { ChangeEvent } from 'react';
import Input from 'shared/components/Input/Input';
import { MAX_ANSWER_LENGTH } from 'shared/constants/surveysConfig';

interface TextAnswersComponentProps {
  handleAnswerChange: (answer: string, questionId: string) => void;
  answer?: string;
  questionId: string;
  isSubmitted: boolean;
}

export default function TextAnswersComponent({
  handleAnswerChange,
  answer,
  questionId,
  isSubmitted,
}: TextAnswersComponentProps) {
  const onAnswerChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    handleAnswerChange(e.target.value, questionId);
  };

  const getAnswerError = () => {
    if ((!answer || answer?.trim() === '') && isSubmitted) {
      return 'Answer is required';
    }
    return undefined;
  };

  return (
    <div>
      <Input
        value={answer}
        onInput={onAnswerChange}
        placeholder="Answer..."
        error={getAnswerError()}
        absoluteError
        className={clsx(getAnswerError() && 'mb-6')}
        maxLength={MAX_ANSWER_LENGTH}
      ></Input>
    </div>
  );
}