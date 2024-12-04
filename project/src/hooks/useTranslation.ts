import { useState, useCallback, useEffect } from 'react';
import { TranslationService } from '../services/azure/translationService';

export function useTranslation() {
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [translationService, setTranslationService] = useState<TranslationService | null>(null);

  useEffect(() => {
    setTranslationService(new TranslationService());
    return () => {
      translationService?.stopTranslation();
    };
  }, []);

  const startTranslation = useCallback(async (
    fromLanguage: string,
    toLanguage: string,
    onRecognized: (text: string) => void,
    onTranslated: (translation: string) => void
  ) => {
    try {
      if (!translationService) {
        throw new Error('Translation service not initialized');
      }

      setError(null);
      await translationService.startTranslation(
        fromLanguage,
        toLanguage,
        onRecognized,
        onTranslated
      );
      setIsTranslating(true);
    } catch (err: any) {
      setError(err.message);
      setIsTranslating(false);
      console.error('Translation error:', err);
    }
  }, [translationService]);

  const stopTranslation = useCallback(async () => {
    try {
      await translationService?.stopTranslation();
    } finally {
      setIsTranslating(false);
    }
  }, [translationService]);

  return {
    isTranslating,
    error,
    startTranslation,
    stopTranslation
  };
}