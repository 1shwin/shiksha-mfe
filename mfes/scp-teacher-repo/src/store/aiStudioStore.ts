import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AIGenerationOutput, QuestionType, Difficulty } from '../utils/AIContentTypes';

interface HistoryState {
  outputs: Record<string, AIGenerationOutput>;
}

interface AIStudioStore {
  currentStep: number;
  selectedFile: { name: string; size: number } | null;
  selectedOutputTypes: string[];
  quizConfig: {
    questionType: QuestionType;
    count: number;
    difficulty: Difficulty;
  };
  generatedOutputs: Record<string, AIGenerationOutput>;
  originalOutputs: Record<string, AIGenerationOutput>;
  
  // History for Undo/Redo
  history: HistoryState[];
  historyIndex: number;

  // Actions
  setStep: (step: number) => void;
  setSelectedFile: (file: { name: string; size: number } | null) => void;
  toggleOutputType: (type: string) => void;
  setQuizConfig: (config: Partial<AIStudioStore['quizConfig']>) => void;
  setGeneratedOutputs: (outputs: Record<string, AIGenerationOutput>) => void;
  updateOutput: (type: string, output: AIGenerationOutput) => void;
  
  // Undo/Redo Actions
  saveToHistory: () => void;
  undo: () => void;
  redo: () => void;
  resetToOriginal: (type: string) => void;
}

const useAIStudioStore = create<AIStudioStore>((set, get) => ({
  currentStep: 0,
  selectedFile: null,
  selectedOutputTypes: [],
  quizConfig: {
    questionType: 'mcq',
    count: 5,
    difficulty: 'medium',
  },
  generatedOutputs: {},
  originalOutputs: {},
  history: [],
  historyIndex: -1,

  setStep: (step) => set({ currentStep: step }),
  
  setSelectedFile: (file) => set({ selectedFile: file }),
  
  toggleOutputType: (type) => set((state) => ({
    selectedOutputTypes: state.selectedOutputTypes.includes(type)
      ? state.selectedOutputTypes.filter((t) => t !== type)
      : [...state.selectedOutputTypes, type]
  })),

  setQuizConfig: (config) => set((state) => ({
    quizConfig: { ...state.quizConfig, ...config }
  })),

  setGeneratedOutputs: (outputs) => set({ 
    generatedOutputs: outputs, 
    originalOutputs: JSON.parse(JSON.stringify(outputs)),
    history: [{ outputs: JSON.parse(JSON.stringify(outputs)) }],
    historyIndex: 0
  }),

  updateOutput: (type, output) => {
    const { generatedOutputs, saveToHistory } = get();
    const newOutputs = { ...generatedOutputs, [type]: output };
    set({ generatedOutputs: newOutputs });
    saveToHistory();
  },

  saveToHistory: () => {
    const { generatedOutputs, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ outputs: JSON.parse(JSON.stringify(generatedOutputs)) });
    
    // Limit history to 30 states
    if (newHistory.length > 30) newHistory.shift();
    
    set({ 
      history: newHistory,
      historyIndex: newHistory.length - 1
    });
  },

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      set({ 
        historyIndex: prevIndex,
        generatedOutputs: JSON.parse(JSON.stringify(history[prevIndex].outputs))
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const nextIndex = historyIndex + 1;
      set({ 
        historyIndex: nextIndex,
        generatedOutputs: JSON.parse(JSON.stringify(history[nextIndex].outputs))
      });
    }
  },

  resetToOriginal: (type) => {
    const { originalOutputs, generatedOutputs, saveToHistory } = get();
    if (originalOutputs[type]) {
      const newOutputs = { ...generatedOutputs, [type]: JSON.parse(JSON.stringify(originalOutputs[type])) };
      set({ generatedOutputs: newOutputs });
      saveToHistory();
    }
  }
}));

export default useAIStudioStore;
