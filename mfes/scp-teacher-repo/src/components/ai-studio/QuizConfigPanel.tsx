import React, { useState } from 'react';
import { Box, Button, Typography, Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, Slider, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useAIStudioStore from '@/store/aiStudioStore';
import { QuestionType, Difficulty } from '../../utils/AIContentTypes';
import { MOCK_KEY_TAKEAWAYS, MOCK_GLOSSARY, MOCK_QUIZ_MCQ, MOCK_QUIZ_FITB, MOCK_QUIZ_MATCH } from '../../data/mockData';
import Loader from '../Loader';

const QuizConfigPanel = () => {
  const theme = useTheme<any>();
  const [isGenerating, setIsGenerating] = useState(false);
  const { 
    quizConfig, 
    setQuizConfig, 
    setStep, 
    selectedOutputTypes,
    setGeneratedOutputs
  } = useAIStudioStore();

  const handleTypeChange = (event: React.MouseEvent<HTMLElement>, newType: QuestionType) => {
    if (newType !== null) {
      setQuizConfig({ questionType: newType });
    }
  };

  const handleDifficultyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuizConfig({ difficulty: (event.target as HTMLInputElement).value as Difficulty });
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    
    // Simulate AI Latency
    setTimeout(() => {
      const outputs: any = {};
      
      if (selectedOutputTypes.includes('key_takeaways')) {
        outputs.key_takeaways = MOCK_KEY_TAKEAWAYS;
      }
      
      if (selectedOutputTypes.includes('glossary')) {
        outputs.glossary = MOCK_GLOSSARY;
      }
      
      if (selectedOutputTypes.includes('quiz')) {
        if (quizConfig.questionType === 'mcq') outputs.quiz = MOCK_QUIZ_MCQ;
        if (quizConfig.questionType === 'fill_in_the_blanks') outputs.quiz = MOCK_QUIZ_FITB;
        if (quizConfig.questionType === 'match_the_pair') outputs.quiz = MOCK_QUIZ_MATCH;
      }

      setGeneratedOutputs(outputs);
      setIsGenerating(false);
      setStep(2);
    }, 2000);
  };

  const hasQuizSelected = selectedOutputTypes.includes('quiz');

  return (
    <Box>
      <Loader showBackdrop={isGenerating} loadingText="AI is analyzing your content..." />
      
      <Typography variant="h2" gutterBottom>
        Configuration & Parameters
      </Typography>
      
      {!hasQuizSelected ? (
        <Box sx={{ py: 4, textAlign: 'center' }}>
          <Typography variant="body1" sx={{ mb: 4 }}>
            You've selected non-interactive outputs. Click generate to begin extraction.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ mt: 4 }}>
          <Box sx={{ mb: 6 }}>
            <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>Question Format</FormLabel>
            <ToggleButtonGroup
              value={quizConfig.questionType}
              exclusive
              onChange={handleTypeChange}
              aria-label="question type"
              fullWidth
              sx={{ gap: 2, '& .MuiToggleButton-root': { borderRadius: '8px !important', border: '1px solid #ddd !important' } }}
            >
              <ToggleButton value="mcq">Multiple Choice</ToggleButton>
              <ToggleButton value="fill_in_the_blanks">Fill in Blanks</ToggleButton>
              <ToggleButton value="match_the_pair">Match Pair</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Box sx={{ mb: 6 }}>
            <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>Question Count: {quizConfig.count}</FormLabel>
            <Slider
              value={quizConfig.count}
              onChange={(e, val) => setQuizConfig({ count: val as number })}
              min={1}
              max={20}
              step={1}
              marks
              valueLabelDisplay="auto"
              sx={{ color: theme.palette.primary.main }}
            />
          </Box>

          <Box sx={{ mb: 6 }}>
            <FormLabel component="legend" sx={{ mb: 2, fontWeight: 600 }}>Difficulty Level</FormLabel>
            <RadioGroup
              row
              value={quizConfig.difficulty}
              onChange={handleDifficultyChange}
            >
              <FormControlLabel value="easy" control={<Radio />} label="Easy" />
              <FormControlLabel value="medium" control={<Radio />} label="Medium" />
              <FormControlLabel value="hard" control={<Radio />} label="Hard" />
            </RadioGroup>
          </Box>
        </Box>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button onClick={() => setStep(0)}>Back</Button>
        <Button
          variant="contained"
          onClick={handleGenerate}
          sx={{ px: 6, borderRadius: '100px' }}
        >
          Generate AI Content
        </Button>
      </Box>
    </Box>
  );
};

export default QuizConfigPanel;
