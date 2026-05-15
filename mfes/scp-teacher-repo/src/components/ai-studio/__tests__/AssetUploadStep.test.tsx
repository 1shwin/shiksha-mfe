import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import AssetUploadStep from '../AssetUploadStep';
import useAIStudioStore from '../../../store/aiStudioStore';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const theme = createTheme();

// Mock the store
jest.mock('../../../store/aiStudioStore');
const mockStore = useAIStudioStore as jest.MockedFunction<typeof useAIStudioStore>;

describe('AssetUploadStep Component', () => {
  const mockSetLanguage = jest.fn();
  const mockSetSelectedFile = jest.fn();
  const mockToggleOutputType = jest.fn();

  beforeEach(() => {
    mockStore.mockReturnValue({
      selectedFile: null,
      setSelectedFile: mockSetSelectedFile,
      selectedOutputTypes: [],
      toggleOutputType: mockToggleOutputType,
      setStep: jest.fn(),
      selectedLanguage: 'auto',
      setLanguage: mockSetLanguage,
    } as any);
  });

  it('renders language selector with 3 options when a video is selected', () => {
    const videoFile = new File([''], 'video.mp4', { type: 'video/mp4' });
    mockStore.mockReturnValue({
      selectedFile: videoFile,
      setSelectedFile: mockSetSelectedFile,
      selectedOutputTypes: [],
      toggleOutputType: mockToggleOutputType,
      setStep: jest.fn(),
      selectedLanguage: 'auto',
      setLanguage: mockSetLanguage,
    } as any);

    render(
      <ThemeProvider theme={theme}>
        <AssetUploadStep />
      </ThemeProvider>
    );
    
    expect(screen.getByText('Transcription Language')).toBeInTheDocument();
    expect(screen.getByText('Auto-detect')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Hindi (Hinglish output)')).toBeInTheDocument();
  });

  it('does not render language selector when no file is selected', () => {
    render(
      <ThemeProvider theme={theme}>
        <AssetUploadStep />
      </ThemeProvider>
    );
    expect(screen.queryByText('Transcription Language')).not.toBeInTheDocument();
  });

  it('shows Hindi info chip when Hindi is selected', () => {
    const videoFile = new File([''], 'video.mp4', { type: 'video/mp4' });
    mockStore.mockReturnValue({
      selectedFile: videoFile,
      setSelectedFile: mockSetSelectedFile,
      selectedOutputTypes: [],
      toggleOutputType: mockToggleOutputType,
      setStep: jest.fn(),
      selectedLanguage: 'hi',
      setLanguage: mockSetLanguage,
    } as any);

    render(
      <ThemeProvider theme={theme}>
        <AssetUploadStep />
      </ThemeProvider>
    );
    expect(screen.getByText('Powered by Whisper-Hindi2Hinglish-Swift')).toBeInTheDocument();
  });

  it('calls setLanguage when a language is selected', () => {
    const videoFile = new File([''], 'video.mp4', { type: 'video/mp4' });
    mockStore.mockReturnValue({
      selectedFile: videoFile,
      setSelectedFile: mockSetSelectedFile,
      selectedOutputTypes: [],
      toggleOutputType: mockToggleOutputType,
      setStep: jest.fn(),
      selectedLanguage: 'auto',
      setLanguage: mockSetLanguage,
    } as any);

    render(
      <ThemeProvider theme={theme}>
        <AssetUploadStep />
      </ThemeProvider>
    );
    const hindiButton = screen.getByText('Hindi (Hinglish output)');
    fireEvent.click(hindiButton);
    
    expect(mockSetLanguage).toHaveBeenCalledWith('hi');
  });
});
