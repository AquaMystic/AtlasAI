import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';
import { AZURE_CONFIG, validateAzureConfig } from './config';

export class SpeechRecognitionService {
  private recognizer: speechsdk.SpeechRecognizer | null = null;

  constructor() {
    validateAzureConfig();
  }

  public async startRecognition(
    language: string,
    onRecognized: (text: string) => void,
    onInterim: (text: string) => void
  ): Promise<void> {
    try {
      const speechConfig = speechsdk.SpeechConfig.fromSubscription(
        AZURE_CONFIG.speechKey,
        AZURE_CONFIG.speechRegion
      );
      
      speechConfig.speechRecognitionLanguage = language;
      
      const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
      this.recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

      this.recognizer.recognizing = (_, event) => {
        onInterim(event.result.text);
      };

      this.recognizer.recognized = (_, event) => {
        if (event.result.reason === speechsdk.ResultReason.RecognizedSpeech) {
          onRecognized(event.result.text);
        }
      };

      await this.recognizer.startContinuousRecognitionAsync();
    } catch (error) {
      this.cleanup();
      throw error;
    }
  }

  public async stopRecognition(): Promise<void> {
    if (this.recognizer) {
      await this.recognizer.stopContinuousRecognitionAsync();
      this.cleanup();
    }
  }

  private cleanup(): void {
    if (this.recognizer) {
      this.recognizer.close();
      this.recognizer = null;
    }
  }
}