import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AudioVisualizer from './AudioVisualizer';
import TranscriptPanel from './TranscriptPanel';
import ThemeToggle from './ThemeToggle';
import SettingsMenu from './SettingsMenu';
import SwapLanguages from './SwapLanguages';
import Logo from './Logo';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useTranslation } from '../hooks/useTranslation';
import { getVoiceConfig } from '../services/azure/voiceMap';

const TranslationInterface = () => {
  const [isMuted, setIsMuted] = useState(false);
  const [sourceLanguage, setSourceLanguage] = useState('en-US');
  const [targetLanguage, setTargetLanguage] = useState('es-ES');
  const [transcript, setTranscript] = useState('');
  const [translation, setTranslation] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('friendly');
  const [isRepeating, setIsRepeating] = useState(false);
  const [canStartListening, setCanStartListening] = useState(true);
  const [isTranslationMode, setIsTranslationMode] = useState(false);
  
  const { speak, isSpeaking, error: speechError } = useSpeechSynthesis();
  const { isTranslating, error: translationError, startTranslation, stopTranslation } = useTranslation();

  useEffect(() => {
    const voiceConfig = getVoiceConfig(targetLanguage);
    setSelectedVoice(voiceConfig.name);
  }, [targetLanguage]);

  useEffect(() => {
    setCanStartListening(!isTranslating);
    setIsTranslationMode(isTranslating && !isSpeaking);
  }, [isTranslating, isSpeaking]);

  const handleToggleListening = useCallback(async () => {
    if (!canStartListening && isTranslationMode) {
      setTranslation('');
      setTranscript('');
      setIsTranslationMode(false);
      return;
    }

    if (!canStartListening) return;

    try {
      if (isTranslating) {
        await stopTranslation();
      } else {
        setIsInitializing(true);
        await startTranslation(
          sourceLanguage,
          targetLanguage,
          (text) => setTranscript(text),
          async (translatedText) => {
            setTranslation(translatedText);
            await stopTranslation();
            if (!isMuted) {
              await speak(translatedText, targetLanguage, selectedStyle);
            }
          }
        );
      }
    } finally {
      setIsInitializing(false);
    }
  }, [isTranslating, sourceLanguage, targetLanguage, isMuted, selectedStyle, startTranslation, stopTranslation, speak, canStartListening, isTranslationMode]);

  const handleRepeatTranslation = useCallback(async () => {
    if (translation && !isRepeating && !isMuted) {
      setIsRepeating(true);
      try {
        await speak(translation, targetLanguage, selectedStyle);
      } finally {
        setIsRepeating(false);
      }
    }
  }, [translation, isRepeating, isMuted, targetLanguage, selectedStyle, speak]);

  const handleSwapLanguages = useCallback(() => {
    if (!isTranslating) {
      setSourceLanguage(targetLanguage);
      setTargetLanguage(sourceLanguage);
      setTranscript('');
      setTranslation('');
    }
  }, [sourceLanguage, targetLanguage, isTranslating]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background transition-colors"
    >
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <div className="fixed top-6 left-6 z-50">
        <SettingsMenu
          sourceLanguage={sourceLanguage}
          targetLanguage={targetLanguage}
          onSourceLanguageChange={setSourceLanguage}
          onTargetLanguageChange={setTargetLanguage}
          selectedVoice={selectedVoice}
          selectedStyle={selectedStyle}
          onVoiceChange={setSelectedVoice}
          onStyleChange={setSelectedStyle}
        />
      </div>
      
      <div className="max-w-4xl mx-auto px-6 flex flex-col items-center justify-center min-h-screen">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Logo />
        </motion.div>
        
        <div className="flex flex-col items-center gap-8 w-full max-w-2xl mx-auto">
          <div className="relative w-[300px] h-[300px] mx-auto">
            <AudioVisualizer 
              isListening={isTranslating} 
              isSpeaking={isSpeaking}
              isTranslationMode={isTranslationMode}
              onToggleListening={handleToggleListening}
            />
          </div>

          <AnimatePresence>
            {(speechError || translationError) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="w-full bg-red-500/20 text-red-400 p-3 text-sm text-center rounded-lg"
              >
                {speechError || translationError}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="w-full"
          >
            <div className="flex items-center justify-center mb-4">
              <SwapLanguages onSwap={handleSwapLanguages} disabled={isTranslating} />
            </div>
            <TranscriptPanel
              transcript={transcript}
              translation={translation}
              sourceLanguage={sourceLanguage}
              targetLanguage={targetLanguage}
              onRepeatTranslation={handleRepeatTranslation}
              isRepeating={isRepeating}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default TranslationInterface;