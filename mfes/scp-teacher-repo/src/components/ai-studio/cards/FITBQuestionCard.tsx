import React from 'react';
import { Box, Card, CardContent, TextField, IconButton, Typography, Stack, Divider, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { FITBQuestion } from '../../../utils/AIContentTypes';

interface FITBQuestionCardProps {
  question: FITBQuestion;
  onUpdate: (q: FITBQuestion) => void;
  onDelete: () => void;
}

const FITBQuestionCard: React.FC<FITBQuestionCardProps> = ({ question, onUpdate, onDelete }) => {
  const handleSentenceChange = (val: string) => {
    // In a real app, we'd parse the sentence to update the blanks array
    onUpdate({ ...question, sentence: val });
  };

  return (
    <Card variant="outlined" sx={{ bgcolor: '#fff', borderRadius: '12px' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h3" sx={{ m: 0 }}>Fill in the Blanks</Typography>
          <IconButton onClick={onDelete} color="error" size="small">
            <DeleteIcon />
          </IconButton>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enclose words in asterisks to create blanks (e.g., *chlorophyll*).
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Sentence with Blanks"
          value={question.sentence}
          onChange={(e) => handleSentenceChange(e.target.value)}
          sx={{ mb: 4 }}
        />

        <Typography variant="h4" gutterBottom>Blank Configuration</Typography>
        <Stack spacing={2}>
          {question.blanks.map((blank, index) => (
            <Box key={index} sx={{ p: 2, border: '1px solid #eee', borderRadius: '8px' }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <TextField
                  fullWidth
                  label="Primary Answer"
                  value={blank.answer}
                  disabled
                />
                <TextField
                  fullWidth
                  label="Tip (Optional)"
                  value={blank.tip}
                  onChange={(e) => {
                    const newBlanks = [...question.blanks];
                    newBlanks[index].tip = e.target.value;
                    onUpdate({ ...question, blanks: newBlanks });
                  }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Alternatives (comma separated):
              </Typography>
              <TextField
                fullWidth
                size="small"
                variant="standard"
                value={blank.alternatives.join(', ')}
                onChange={(e) => {
                  const newBlanks = [...question.blanks];
                  newBlanks[index].alternatives = e.target.value.split(',').map(s => s.trim());
                  onUpdate({ ...question, blanks: newBlanks });
                }}
              />
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default FITBQuestionCard;
