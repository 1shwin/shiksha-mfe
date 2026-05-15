import React, { useState } from 'react';
import { Box, Typography, Button, Card, CardContent, Grid, CircularProgress, Alert } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { useTheme } from '@mui/material/styles';
import useAIStudioStore from '@/store/aiStudioStore';
import { downloadH5P } from '../../utils/h5pPackager';

const ExportPanel = () => {
  const theme = useTheme<any>();
  const { generatedOutputs, selectedOutputTypes, setStep } = useAIStudioStore();
  const [isPacking, setIsPacking] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleExportH5P = async () => {
    setIsPacking(true);
    try {
      await downloadH5P(generatedOutputs);
      setSuccess(true);
    } catch (error) {
      console.error('Export failed', error);
    } finally {
      setIsPacking(false);
    }
  };

  const getSummaryText = () => {
    const parts = [];
    if (generatedOutputs['key_takeaways']) parts.push(`${(generatedOutputs['key_takeaways'] as any).takeaways.length} Takeaways`);
    if (generatedOutputs['glossary']) parts.push(`${(generatedOutputs['glossary'] as any).terms.length} Glossary Terms`);
    if (generatedOutputs['quiz']) parts.push(`${(generatedOutputs['quiz'] as any).questions.length} Quiz Questions`);
    return parts.join(', ');
  };

  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <CheckCircleOutlineIcon sx={{ fontSize: 64, color: theme.palette.success.main, mb: 2 }} />
      <Typography variant="h1" gutterBottom>Content Ready for Export!</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 6 }}>
        Your interactive micro-lesson has been compiled. You can now download it as a standards-compliant H5P package.
      </Typography>

      <Grid container spacing={4} justifyContent="center">
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ bgcolor: theme.palette.primary.light + '08', borderColor: theme.palette.primary.main }}>
            <CardContent sx={{ py: 4 }}>
              <Typography variant="h3" gutterBottom>H5P Package (.h5p)</Typography>
              <Typography variant="body2" sx={{ mb: 4 }}>
                Best for LMS integration (Moodle, Canvas, etc.). Includes {getSummaryText()}.
              </Typography>
              <Button
                variant="contained"
                size="large"
                startIcon={isPacking ? <CircularProgress size={20} color="inherit" /> : <FileDownloadIcon />}
                disabled={isPacking}
                onClick={handleExportH5P}
                sx={{ px: 6, borderRadius: '100px' }}
              >
                {isPacking ? 'Compiling...' : 'Download H5P'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent sx={{ py: 4 }}>
              <Typography variant="h3" gutterBottom>Raw JSON Output</Typography>
              <Typography variant="body2" sx={{ mb: 4 }}>
                Best for developers or custom platform integrations.
              </Typography>
              <Button
                variant="outlined"
                size="large"
                startIcon={<FileDownloadIcon />}
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(generatedOutputs, null, 2));
                  const downloadAnchorNode = document.createElement('a');
                  downloadAnchorNode.setAttribute("href",     dataStr);
                  downloadAnchorNode.setAttribute("download", "ai_content.json");
                  document.body.appendChild(downloadAnchorNode);
                  downloadAnchorNode.click();
                  downloadAnchorNode.remove();
                }}
                sx={{ px: 6, borderRadius: '100px' }}
              >
                Download JSON
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {success && (
        <Alert severity="success" sx={{ mt: 6, borderRadius: '12px' }}>
          Export successful! You can now import this file into any H5P-compliant LMS.
        </Alert>
      )}

      <Box sx={{ mt: 8 }}>
        <Button onClick={() => setStep(2)}>Back to Review</Button>
      </Box>
    </Box>
  );
};

export default ExportPanel;
