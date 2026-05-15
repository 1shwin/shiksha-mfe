import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import useAIStudioStore from '@/store/aiStudioStore';
import { QuizOutput, QuizQuestion } from '../../utils/AIContentTypes';
import MCQQuestionCard from './cards/MCQQuestionCard';
import FITBQuestionCard from './cards/FITBQuestionCard';
import MatchPairCard from './cards/MatchPairCard';

const QuizEditor = () => {
  const { generatedOutputs, updateOutput } = useAIStudioStore();
  const output = generatedOutputs['quiz'] as QuizOutput;

  if (!output) return null;

  const renderQuestionCard = (question: QuizQuestion) => {
    switch (output.questionType) {
      case 'mcq':
        return <MCQQuestionCard key={question.id} question={question as any} onUpdate={(q) => handleUpdate(q)} onDelete={() => handleDelete(question.id)} />;
      case 'fill_in_the_blanks':
        return <FITBQuestionCard key={question.id} question={question as any} onUpdate={(q) => handleUpdate(q)} onDelete={() => handleDelete(question.id)} />;
      case 'match_the_pair':
        return <MatchPairCard key={question.id} question={question as any} onUpdate={(q) => handleUpdate(q)} onDelete={() => handleDelete(question.id)} />;
      default:
        return null;
    }
  };

  const handleUpdate = (updatedQuestion: QuizQuestion) => {
    const newQuestions = output.questions.map(q => 
      q.id === updatedQuestion.id ? updatedQuestion : q
    );
    updateOutput('quiz', { ...output, questions: newQuestions });
  };

  const handleDelete = (id: string) => {
    const newQuestions = output.questions.filter(q => q.id !== id);
    updateOutput('quiz', { ...output, questions: newQuestions });
  };

  const handleAdd = () => {
    // Basic template based on type
    let newItem: any;
    if (output.questionType === 'mcq') {
      newItem = { id: Date.now().toString(), question: 'New Question?', answers: [{ text: '', correct: true, feedback: '' }], difficulty: 'medium' };
    } else if (output.questionType === 'fill_in_the_blanks') {
      newItem = { id: Date.now().toString(), sentence: 'The *answer* is here.', blanks: [{ answer: 'answer', tip: '' }], difficulty: 'medium' };
    } else {
      newItem = { id: Date.now().toString(), instruction: 'Match the following:', pairs: [{ left: '', right: '' }], distractors: [], difficulty: 'medium' };
    }
    
    updateOutput('quiz', { ...output, questions: [...output.questions, newItem] });
  };

  return (
    <Box>
      <Stack spacing={4}>
        {output.questions.map((q) => renderQuestionCard(q))}
      </Stack>

      <Button
        fullWidth
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={handleAdd}
        sx={{ mt: 4, py: 2, borderStyle: 'dashed' }}
      >
        Add Question
      </Button>
    </Box>
  );
};

export default QuizEditor;
