import React from 'react';
import TranslationInterface from './components/TranslationInterface';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  return (
    <ThemeProvider>
      <TranslationInterface />
    </ThemeProvider>
  );
}