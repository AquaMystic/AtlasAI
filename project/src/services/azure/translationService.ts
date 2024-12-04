import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';
import { AZURE_CONFIG, validateAzureConfig } from './config';

export class TranslationService {
  private translator: speechsdk.TranslationRecognizer | null = null;

  constructor() {
    validateAzureConfig();
  }

  public async startTranslation(
    fromLanguage: string,
    toLanguage: string,
    onRecognized: (text: string) => void,
    onTranslated: (translation: string) => void
  ): Promise<void> {
    try {
      const speechConfig = speechsdk.SpeechTranslationConfig.fromSubscription(
        AZURE_CONFIG.speechKey,
        AZURE_CONFIG.speechRegion
      );

      // Configure translation
      speechConfig.speechRecognitionLanguage = fromLanguage;
      const targetLang = toLanguage.split('-')[0]; // Remove region code
      speechConfig.addTargetLanguage(targetLang);

      // Create audio config for microphone
      const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
      
      // Create translator
      this.translator = new speechsdk.TranslationRecognizer(speechConfig, audioConfig);

      // Set up event handlers
      this.translator.recognizing = (_, event) => {
        if (event.result.text) {
          onRecognized(event.result.text);
        }
      };

      this.translator.recognized = (_, event) => {
        if (event.result.reason === speechsdk.ResultReason.TranslatedSpeech) {
          const translation = event.result.translations.get(targetLang);
          if (translation) {
            onTranslated(translation);
          }
        }
      };

      // Start continuous translation
      await this.translator.startContinuousRecognitionAsync();
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  public async stopTranslation(): Promise<void> {
    if (this.translator) {
      await this.translator.stopContinuousRecognitionAsync();
      this.cleanup();
    }
  }

  private cleanup(): void {
    if (this.translator) {
      this.translator.close();
      this.translator = null;
    }
  }
}