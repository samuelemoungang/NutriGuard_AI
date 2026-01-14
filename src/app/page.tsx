'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  HeroSection,
  StepNavigation,
  ImageAnalysisStep,
  SignalProcessingStep,
  QualityClassificationStep,
  FinalFeedbackStep,
} from '@/components';
import { AppState, ImageAnalysisResult, SignalProcessingData, QualityClassification, FinalFeedback } from '@/types';
import agentMemoryService from '@/services/agentMemoryService';

const STEP_LABELS = ['Image Analysis', 'Signal Processing', 'Classification', 'Feedback'];

export default function Home() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [appState, setAppState] = useState<AppState>({
    currentStep: 0,
    uploadedImage: null,
    imageFile: null,
    imageAnalysis: null,
    signalData: null,
    classification: null,
    feedback: null,
    isProcessing: false,
  });

  const scrollToStep = useCallback((step: number) => {
    if (scrollContainerRef.current) {
      const targetScroll = step * window.innerWidth;
      scrollContainerRef.current.scrollTo({
        left: targetScroll,
        behavior: 'smooth',
      });
    }
  }, []);

  const handleImageUpload = useCallback((file: File, preview: string) => {
    // Resetta la memoria condivisa quando si carica una nuova immagine
    agentMemoryService.reset();
    agentMemoryService.startSession();
    
    setAppState(prev => ({
      ...prev,
      imageFile: file,
      uploadedImage: preview,
    }));
  }, []);

  const handleStartAnalysis = useCallback(() => {
    setAppState(prev => ({ ...prev, currentStep: 1 }));
    scrollToStep(1);
  }, [scrollToStep]);

  const handleImageAnalysisComplete = useCallback((result: ImageAnalysisResult) => {
    setAppState(prev => ({
      ...prev,
      imageAnalysis: result,
    }));
  }, []);

  const handleSignalProcessingComplete = useCallback((data: SignalProcessingData) => {
    setAppState(prev => ({
      ...prev,
      signalData: data,
    }));
  }, []);

  const handleClassificationComplete = useCallback((result: QualityClassification) => {
    setAppState(prev => ({
      ...prev,
      classification: result,
    }));
  }, []);

  const handleFeedbackComplete = useCallback((result: FinalFeedback) => {
    setAppState(prev => ({
      ...prev,
      feedback: result,
    }));
  }, []);

  const handleNext = useCallback(() => {
    const nextStep = Math.min(appState.currentStep + 1, 4);
    setAppState(prev => ({ ...prev, currentStep: nextStep }));
    scrollToStep(nextStep);
  }, [appState.currentStep, scrollToStep]);

  const handlePrev = useCallback(() => {
    const prevStep = Math.max(appState.currentStep - 1, 0);
    setAppState(prev => ({ ...prev, currentStep: prevStep }));
    scrollToStep(prevStep);
  }, [appState.currentStep, scrollToStep]);

  const canGoNext = useCallback(() => {
    switch (appState.currentStep) {
      case 0:
        return !!appState.uploadedImage;
      case 1:
        return !!appState.imageAnalysis;
      case 2:
        return !!appState.signalData;
      case 3:
        return !!appState.classification;
      case 4:
        return false;
      default:
        return false;
    }
  }, [appState]);

  const canGoPrev = useCallback(() => {
    return appState.currentStep > 0;
  }, [appState.currentStep]);

  // Sync scroll position with current step
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollPosition = container.scrollLeft;
      const sectionWidth = window.innerWidth;
      const newStep = Math.round(scrollPosition / sectionWidth);

      if (newStep !== appState.currentStep && newStep >= 0 && newStep <= 4) {
        setAppState(prev => ({ ...prev, currentStep: newStep }));
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [appState.currentStep]);

  // Environment variables for Flowise endpoints
  const flowiseClassifyUrl = process.env.NEXT_PUBLIC_FLOWISE_CLASSIFY_URL;
  const flowiseFeedbackUrl = process.env.NEXT_PUBLIC_FLOWISE_FEEDBACK_URL;

  return (
    <main className="relative overflow-x-hidden">
      <div
        ref={scrollContainerRef}
        className="horizontal-scroll-container min-h-screen"
      >
        {/* Hero Section - Step 0 */}
        <HeroSection
          onImageUpload={handleImageUpload}
          uploadedImage={appState.uploadedImage}
          onStartAnalysis={handleStartAnalysis}
        />

        {/* Step 1: Image Analysis */}
        <ImageAnalysisStep
          uploadedImage={appState.uploadedImage}
          onComplete={handleImageAnalysisComplete}
          isActive={appState.currentStep === 1}
        />

        {/* Step 2: Signal Processing */}
        <SignalProcessingStep
          imageAnalysis={appState.imageAnalysis}
          onComplete={handleSignalProcessingComplete}
          isActive={appState.currentStep === 2}
        />

        {/* Step 3: Quality Classification (Flowise) */}
        <QualityClassificationStep
          imageAnalysis={appState.imageAnalysis}
          signalData={appState.signalData}
          onComplete={handleClassificationComplete}
          isActive={appState.currentStep === 3}
          flowiseEndpoint={flowiseClassifyUrl}
        />

        {/* Step 4: Final Feedback (Flowise) */}
        <FinalFeedbackStep
          imageAnalysis={appState.imageAnalysis}
          signalData={appState.signalData}
          classification={appState.classification}
          onComplete={handleFeedbackComplete}
          isActive={appState.currentStep === 4}
          flowiseEndpoint={flowiseFeedbackUrl}
        />
      </div>

      {/* Navigation - shown after hero */}
      {appState.currentStep > 0 && (
        <StepNavigation
          currentStep={appState.currentStep - 1}
          totalSteps={4}
          canGoNext={canGoNext()}
          canGoPrev={canGoPrev()}
          onNext={handleNext}
          onPrev={handlePrev}
          stepLabels={STEP_LABELS}
        />
      )}
    </main>
  );
}
