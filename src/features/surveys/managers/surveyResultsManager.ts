import { useCallback, useState, useEffect } from 'react';

import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { BarChartData } from 'features/surveys/components/BarChart/BarChart';
import { AnswerData } from 'features/surveys/interfaces/AnswerData';

import useCopyToClipboard from 'shared/hooks/useCopyToClipboard';

import useTranslation from 'next-translate/useTranslation';
import { getFetch } from '../../../../lib/axiosConfig';
import { SurveyWithAnswers } from 'types/SurveyWithAnswers';

export const useSurveyResultsManager = (initialData: SurveyWithAnswers) => {
  const router = useRouter();
  const { surveyId } = router.query as { surveyId: string };

  const [votes, setVotes] = useState(0);
  const [title, setTitle] = useState('');
  const [createDate, setCreateDate] = useState<string>('');
  const [answersData, setAnswersData] = useState<AnswerData[]>([]);
  const [chartData, setChartData] = useState<BarChartData[]>([]);
  const [isSurveyActive, setIsSurveyActive] = useState<boolean>(false);
  const [showOnlyWithExtraFeedback, setShowOnlyWithExtraFeedback] =
    useState(false);

  const [filteredAnswersData, setFilteredAnswersData] = useState<AnswerData[]>(
    []
  );

  const { copy } = useCopyToClipboard();
  const { t } = useTranslation('surveyAnswer');

  const fillSurveyData = useCallback((surveyData: SurveyWithAnswers) => {
    const mappedDataByQuestion = surveyData.answers.map((answer) => {
      return answer.answerData[0];
    });

    setVotes(surveyData.answers.length);
    setAnswersData(mappedDataByQuestion || []);
    setIsSurveyActive(surveyData.isActive);

    setCreateDate(surveyData.createdAt.toString());
    setTitle(surveyData.title);
  }, []);

  const getSurveyData = useCallback(
    async (displayMessages = false) => {
      const surveyData = await getFetch<SurveyWithAnswers>(
        `/api/survey/${surveyId}`
      );

      if (!surveyData) {
        router.replace('/');
        return;
      }

      fillSurveyData(surveyData);

      if (displayMessages) {
        toast.success(t('refreshSuccess'));
      }
    },
    [surveyId, router, t, fillSurveyData]
  );

  useEffect(() => {
    if (!surveyId) {
      router.replace('/');
      return;
    }

    fillSurveyData(initialData);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateSurveyStatus = async (isActive: boolean) => {
    try {
      setIsSurveyActive(isActive);
      // await updateDoc(doc(db, 'surveys', surveyId), {
      //   isActive,
      // });

      toast.success(
        `${t('toggleChangeActiveStatus')} ${
          isActive ? t('toggleActive') : t('toggleInactive')
        }`
      );
    } catch (error) {
      toast.error(t('toggleChangeActiveStatusError'));
    }
  };

  const getDataToChart = useCallback((): BarChartData[] => {
    if (!answersData.length) {
      return [];
    }

    const uniqueAnswers = Array.from(
      new Set(answersData.map((a) => a.providedAnswer))
    );

    const result: {
      [key: string]: number;
    } = {};

    uniqueAnswers.forEach((answer) => {
      result[answer] = 0;
    });

    answersData.forEach((answer) => {
      result[answer.providedAnswer] += 1;
    });

    return Object.keys(result)
      .map((key) => ({
        name: key,
        value: result[key],
      }))
      .sort((a, b) => b.value - a.value);
  }, [answersData]);

  useEffect(() => {
    setChartData(getDataToChart());
  }, [answersData, getDataToChart]);

  useEffect(() => {
    const filtered = showOnlyWithExtraFeedback
      ? answersData.filter((answer) => answer.providedAnswer.trim() !== '')
      : answersData;
    setFilteredAnswersData(filtered);
  }, [answersData, showOnlyWithExtraFeedback]);

  const navigateToSurveys = useCallback(
    () => router.push('/surveys'),
    [router]
  );

  const handleCopyLink = (id: string) => () => {
    const domain =
      window.location.hostname === 'localhost' ? 'http://' : 'https://';
    const link = `${domain}${window.location.host}/survey/${id}`;
    copy(link);
  };

  return {
    title,
    handleCopyLink,
    surveyId,
    getSurveyData,
    chartData,
    isSurveyActive,
    votes,
    createDate,
    showOnlyWithExtraFeedback,
    filteredAnswersData,
    answersData,
    setShowOnlyWithExtraFeedback,
    navigateToSurveys,
    updateSurveyStatus,
  };
};
