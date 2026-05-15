import React from 'react';
import { Box, Card, CardContent, TextField, IconButton, Typography, Stack, Grid, Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { MatchQuestion, MatchPair } from '../../../utils/AIContentTypes';

interface MatchPairCardProps {
  question: MatchQuestion;
  onUpdate: (q: MatchQuestion) => void;
  onDelete: () => void;
}

const MatchPairCard: React.FC<MatchPairCardProps> = ({ question, onUpdate, onDelete }) => {
  const handleUpdatePair = (index: number, field: keyof MatchPair, val: string) => {
    const newPairs = question.pairs.map((p, i) => 
      i === index ? { ...p, [field]: val } : p
    );
    onUpdate({ ...question, pairs: newPairs });
  };

  const handleAddPair = () => {
    onUpdate({ ...question, pairs: [...question.pairs, { left: '', right: '' }] });
  };

  return (
    <Card variant="outlined" sx={{ bgcolor: '#fff', borderRadius: '12px' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h3" sx={{ m: 0 }}>Match the Pair</Typography>
          <IconButton onClick={onDelete} color="error" size="small">
            <DeleteIcon />
          </IconButton>
        </Box>

        <TextField
          fullWidth
          label="Instructions"
          value={question.instruction}
          onChange={(e) => onUpdate({ ...question, instruction: e.target.value })}
          sx={{ mb: 4 }}
        />

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={5}><Typography variant="subtitle2">Left Item</Typography></Grid>
          <Grid item xs={5}><Typography variant="subtitle2">Right (Matching) Item</Typography></Grid>
          <Grid item xs={2}></Grid>
        </Grid>

        <Stack spacing={1}>
          {question.pairs.map((pair, index) => (
            <Grid container spacing={2} key={index} alignItems="center">
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  size="small"
                  value={pair.left}
                  onChange={(e) => handleUpdatePair(index, 'left', e.target.value)}
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  fullWidth
                  size="small"
                  value={pair.right}
                  onChange={(e) => handleUpdatePair(index, 'right', e.target.value)}
                />
              </Grid>
              <Grid item xs={2}>
                <IconButton 
                  size="small" 
                  onClick={() => {
                    const newPairs = question.pairs.filter((_, i) => i !== index);
                    onUpdate({ ...question, pairs: newPairs });
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>
            </Grid>
          ))}
        </Stack>

        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={handleAddPair}
          sx={{ mt: 2 }}
        >
          Add Pair
        </Button>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h4" gutterBottom>Distractors (Optional)</Typography>
        <TextField
          fullWidth
          size="small"
          label="Distractor Items (comma separated)"
          value={question.distractors.join(', ')}
          onChange={(e) => onUpdate({ ...question, distractors: e.target.value.split(',').map(s => s.trim()) })}
        />
      </CardContent>
    </Card>
  );
};

export default MatchPairCard;
