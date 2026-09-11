import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  X,
  Sparkles,
  Camera,
  Image as ImageIcon,
  Volume2,
  Copy,
  Check,
  CheckSquare,
  Square,
  Trash2,
  Layers,
  ChevronDown,
  ChevronUp,
  Wand2,
  AlertTriangle,
  ExternalLink,
  RotateCw,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import {
  translateWord,
  extractVocabSheetFromImage,
  batchTranslateWords,
  generateVocabFromPrompt,
} from '../../services/aiService';
import { speakWord } from '../../services/ttsService';
import { getThaiPhonetic } from '../../services/phoneticService';
import { processAndCompressImage, processCanvasSnapshot, type ProcessedImage } from '../../utils/imageUtils';
import { liffService } from '../../services/liffService';
import { addLiffLog, getLiffLogs, subscribeLiffLogs, clearLiffLogs } from '../../utils/liffDebug';
import type { PartOfSpeech, TranslationResponse } from '../../types';

export interface VocabEntryDraft {
  id: string;
  word_en: string;
  word_th: string;
  reading_th?: string;
  part_of_speech: PartOfSpeech;
  example_sentence_en: string;
  example_sentence_th: string;
  selected: boolean;
  isExpanded?: boolean;
  isDuplicate?: boolean;
}

export interface AddVocabModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingWords?: string[];
  initialTab?: 'type' | 'prompt' | 'photo';
  onSave: (entry: {
    word_en: string;
    word_th: string;
    reading_th: string;
    part_of_speech: PartOfSpeech;
    example_sentence_en: string;
    example_sentence_th: string;
  }) => Promise<void>;
  onBatchSave?: (
    entries: Array<{
      word_en: string;
      word_th: string;
      reading_th: string;
      part_of_speech: PartOfSpeech;
      example_sentence_en: string;
      example_sentence_th: string;
    }>
  ) => Promise<void>;
}

export const AddVocabModal: React.FC<AddVocabModalProps> = ({
  isOpen,
  onClose,
  existingWords = [],
  initialTab,
  onSave,
  onBatchSave,
}) => {
  const [activeTab, setActiveTab] = useState<'type' | 'prompt' | 'photo'>(() => {
    if (initialTab) return initialTab;
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('add_vocab_modal_tab') : null;
    if (saved === 'photo' || saved === 'prompt' || saved === 'type') {
      return saved;
    }
    return 'type';
  });

  const handleTabChange = (tab: 'type' | 'prompt' | 'photo') => {
    setActiveTab(tab);
    try {
      sessionStorage.setItem('add_vocab_modal_tab', tab);
    } catch {
      // ignore
    }
    setError(null);
  };

  // Existing words set for instant duplicate lookup
  const existingSet = useMemo(() => {
    return new Set(existingWords.map((w) => w.trim().toLowerCase()).filter(Boolean));
  }, [existingWords]);

  // Tab 1: Single word form state
  const [wordEn, setWordEn] = useState('');
  const [wordTh, setWordTh] = useState('');
  const [readingTh, setReadingTh] = useState('');
  const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech>('noun');
  const [exampleEn, setExampleEn] = useState('');
  const [exampleTh, setExampleTh] = useState('');

  // Tab 2: AI Prompt generation state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiCount, setAiCount] = useState<number>(10);
  const [promptDrafts, setPromptDrafts] = useState<VocabEntryDraft[]>([]);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);

  // Tab 3: Batch Photo/Worksheet OCR state
  const [extractedWords, setExtractedWords] = useState<VocabEntryDraft[]>([]);
  const [detectedSheetTitle, setDetectedSheetTitle] = useState<string | null>(null);
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);
  const [batchStepMessage, setBatchStepMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // In-App WebRTC Camera state (prevents Android WebView process kill)
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach((track) => track.stop());
      cameraStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsStartingCamera(false);
  }, []);

  // Cleanup camera stream when modal is closed or unmounted
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Common UI state
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Track whether we returned from a camera capture where the WebView was killed
  const [showCameraRetryHint, setShowCameraRetryHint] = useState(false);

  // LIFF on-screen debugger state
  const [debugLogs, setDebugLogs] = useState<string[]>(() => getLiffLogs());
  const [copiedLogs, setCopiedLogs] = useState(false);

  useEffect(() => {
    return subscribeLiffLogs((newLogs) => {
      setDebugLogs([...newLogs]);
    });
  }, []);

  // Fallback file detector: Android WebView often populates input.files without dispatching DOM 'change'
  const handleProcessFileRef = useRef<(file: File) => Promise<void>>(async () => {});
  const isCheckingFilesRef = useRef(false);

  const checkInputFiles = useCallback((source: string) => {
    const input = galleryInputRef.current;
    if (!input) return;
    const files = input.files;
    const count = files?.length ?? 0;
    addLiffLog(`🔍 Check (${source}): input.files count = ${count}`);
    if (files && count > 0 && !isCheckingFilesRef.current) {
      const f = files[0];
      isCheckingFilesRef.current = true;
      addLiffLog(`🎯 Detected file via ${source}: "${f.name}" (${((f.size || 0) / 1024).toFixed(1)} KB)`);
      handleProcessFileRef.current(f).finally(() => {
        isCheckingFilesRef.current = false;
        try {
          if (galleryInputRef.current) galleryInputRef.current.value = '';
        } catch {}
      });
    }
  }, []);

  useEffect(() => {
    const runChecks = (reason: string) => {
      checkInputFiles(`${reason}-0ms`);
      setTimeout(() => checkInputFiles(`${reason}-150ms`), 150);
      setTimeout(() => checkInputFiles(`${reason}-400ms`), 400);
      setTimeout(() => checkInputFiles(`${reason}-800ms`), 800);
      setTimeout(() => checkInputFiles(`${reason}-1500ms`), 1500);
    };

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        addLiffLog('👁️ App visible: Running delayed file checks...');
        runChecks('vis');
      }
    };

    const handleFocus = () => {
      addLiffLog('🪟 Window focus: Running delayed file checks...');
      runChecks('focus');
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('focus', handleFocus);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('focus', handleFocus);
    };
  }, [checkInputFiles]);

  useEffect(() => {
    const input = galleryInputRef.current;
    if (!input) return;
    const handleCancel = () => {
      addLiffLog('⚠️ galleryInput cancel event fired (picker closed without file)');
    };
    input.addEventListener('cancel', handleCancel);
    return () => {
      input.removeEventListener('cancel', handleCancel);
    };
  }, []);

  const startInAppCamera = async (facing: 'environment' | 'user' = 'environment') => {
    setError(null);
    setShowCameraRetryHint(false);

    // If WebRTC is not supported or not secure context, fallback to native file input
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn('[In-App Camera] getUserMedia not supported, falling back to native file input.');
      cameraInputRef.current?.click();
      return;
    }

    stopCamera();
    setIsStartingCamera(true);
    setIsCameraActive(true);
    setCameraFacingMode(facing);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      cameraStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('[In-App Camera] Camera access failed:', err);
      stopCamera();
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setError('กรุณาอนุญาตสิทธิ์เข้าถึงกล้องใน LINE หรือเลือกรูปภาพจากคลังภาพแทน');
      } else {
        // Fallback to native camera input
        cameraInputRef.current?.click();
      }
    } finally {
      setIsStartingCamera(false);
    }
  };

  const handleFlipCamera = () => {
    const nextFacing = cameraFacingMode === 'environment' ? 'user' : 'environment';
    startInAppCamera(nextFacing);
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Stop camera stream immediately
      stopCamera();

      // Compress snapshot directly from canvas
      const processed = processCanvasSnapshot(canvas, 1600, 0.85);
      handleProcessProcessedImage(processed);
    } catch (err: any) {
      console.error('Failed to capture snapshot from canvas:', err);
      setError('ไม่สามารถถ่ายภาพได้ กรุณาลองใหม่อีกครั้ง');
    }
  };

  // ---------------------------------------------------------------------------
  // LINE WebView Camera Lifecycle Recovery
  // ---------------------------------------------------------------------------
  // On Android, opening the camera from LINE in-app browser may cause the OS
  // to kill the WebView process to free RAM. When the user returns after
  // confirming the photo, the page reloads from scratch, losing all JS state
  // including the onChange handler. We detect this by setting a sessionStorage
  // flag before the camera opens, and checking for it on mount.
  // ---------------------------------------------------------------------------
  const CAMERA_PENDING_KEY = 'wb_camera_pending';

  useEffect(() => {
    try {
      const pending = sessionStorage.getItem(CAMERA_PENDING_KEY);
      if (pending) {
        // Page was reloaded by Android after camera capture
        sessionStorage.removeItem(CAMERA_PENDING_KEY);
        console.warn('[AddVocabModal] Detected page reload after camera capture (LINE WebView lifecycle). Showing retry hint.');
        setActiveTab('photo');
        setShowCameraRetryHint(true);
      }
    } catch {
      // sessionStorage unavailable
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Mark that we are about to open camera/gallery so we can detect reload
  const markCameraPending = useCallback(() => {
    try {
      sessionStorage.setItem(CAMERA_PENDING_KEY, Date.now().toString());
    } catch {
      // ignore
    }
  }, []);

  const clearCameraPending = useCallback(() => {
    try {
      sessionStorage.removeItem(CAMERA_PENDING_KEY);
    } catch {
      // ignore
    }
    setShowCameraRetryHint(false);
  }, []);

  // Listen for visibilitychange — when user returns from camera without page
  // reload, the change event may still fire normally. But if it doesn't, we
  // can at least re-check and log.
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        console.log('[AddVocabModal] Page became visible again (returned from camera/gallery).');
        // Clear pending flag since the page wasn't killed
        clearCameraPending();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [clearCameraPending]);

  if (!isOpen) return null;

  // Single word duplicate check
  const isSingleWordDuplicate = wordEn.trim() ? existingSet.has(wordEn.trim().toLowerCase()) : false;

  const handleTranslate = async () => {
    if (!wordEn.trim()) {
      setError('Please type an English word first.');
      return;
    }

    setError(null);
    setIsTranslating(true);
    try {
      const res = await translateWord(wordEn.trim());
      setWordTh(res.word_th);
      setReadingTh(res.reading_th || getThaiPhonetic(wordEn.trim()));
      setPartOfSpeech(res.part_of_speech || 'noun');
      setExampleEn(res.example_sentence_en || '');
      setExampleTh(res.example_sentence_th || '');
    } catch (err: unknown) {
      const e = err as Error;
      setError(e.message || 'Translation failed.');
    } finally {
      setIsTranslating(false);
    }
  };

  // --------------------------------------------------------------------------
  // Tab 2: AI Prompt Generator
  // --------------------------------------------------------------------------
  const handleGeneratePromptVocab = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiPrompt.trim()) {
      setError('Please describe what vocabulary you would like AI to generate.');
      return;
    }

    setError(null);
    setIsGeneratingPrompt(true);
    try {
      const safeCount = Math.min(Math.max(Number(aiCount) || 10, 1), 50);
      const results = await generateVocabFromPrompt(aiPrompt.trim(), safeCount, existingWords);

      if (!results || results.length === 0) {
        throw new Error('AI could not generate vocabulary for this topic. Please try a more specific topic.');
      }

      const drafts: VocabEntryDraft[] = results.map((t, idx) => {
        const isDup = existingSet.has(t.word_en.trim().toLowerCase());
        return {
          id: `prompt-draft-${idx}-${Date.now()}`,
          word_en: t.word_en,
          word_th: t.word_th,
          reading_th: t.reading_th || '',
          part_of_speech: t.part_of_speech,
          example_sentence_en: t.example_sentence_en,
          example_sentence_th: t.example_sentence_th,
          selected: !isDup, // Automatically uncheck duplicate words
          isExpanded: false,
          isDuplicate: isDup,
        };
      });

      setPromptDrafts(drafts);
    } catch (err: unknown) {
      const errObj = err as Error;
      setError(errObj.message || 'Failed to generate vocabulary with AI.');
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleToggleSelectPromptWord = (id: string) => {
    setPromptDrafts((prev) =>
      prev.map((w) => (w.id === id ? { ...w, selected: !w.selected } : w))
    );
  };

  const handleToggleSelectAllPrompt = () => {
    const allSelected = promptDrafts.every((w) => w.selected);
    setPromptDrafts((prev) => prev.map((w) => ({ ...w, selected: !allSelected })));
  };

  const handleUpdatePromptDraftWord = (id: string, field: keyof VocabEntryDraft, value: any) => {
    setPromptDrafts((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    );
  };

  const handleDeletePromptDraftWord = (id: string) => {
    setPromptDrafts((prev) => prev.filter((w) => w.id !== id));
  };

  const handleToggleExpandPromptWord = (id: string) => {
    setPromptDrafts((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isExpanded: !w.isExpanded } : w))
    );
  };

  const handleBatchSavePromptWords = async () => {
    const selectedWords = promptDrafts.filter((w) => w.selected);
    if (selectedWords.length === 0) {
      setError('Please select at least one word to import.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const payload = selectedWords.map((w) => ({
        word_en: w.word_en.trim(),
        word_th: w.word_th.trim(),
        reading_th: w.reading_th?.trim() || getThaiPhonetic(w.word_en.trim()),
        part_of_speech: w.part_of_speech,
        example_sentence_en: w.example_sentence_en.trim(),
        example_sentence_th: w.example_sentence_th.trim(),
      }));

      if (onBatchSave) {
        await onBatchSave(payload);
      } else {
        for (const item of payload) {
          await onSave(item);
        }
      }

      setPromptDrafts([]);
      setAiPrompt('');
      onClose();
    } catch (err: unknown) {
      const errObj = err as Error;
      setError(errObj.message || 'Failed to import words.');
    } finally {
      setIsSaving(false);
    }
  };

  // --------------------------------------------------------------------------
  // Tab 3: Photo / Worksheet Scan (Camera + Gallery Upload)
  // --------------------------------------------------------------------------
  const executeVisionScan = async (processed: ProcessedImage) => {
    addLiffLog(`📸 executeVisionScan called: ${processed.width}x${processed.height}px, Base64: ${(processed.base64.length / 1024).toFixed(1)} KB`);
    setBatchStepMessage('กำลังสแกนใบงานด้วย Multimodal AI Vision...');

    // Extract vocabulary words & sheet title using Multimodal Vision AI
    const sheetResult = await extractVocabSheetFromImage(processed.base64, processed.mimeType);
    addLiffLog(`🤖 AI Vision finished. Title: "${sheetResult.title || ''}", Entries: ${sheetResult.entries?.length ?? 0}, Words: ${sheetResult.words?.length ?? 0}`);

    if (sheetResult.title) {
      setDetectedSheetTitle(sheetResult.title);
    }

    let drafts: VocabEntryDraft[] = [];

    // Check if 1-shot full translations are returned directly by AI Vision
    if (sheetResult.entries && sheetResult.entries.length > 0) {
      drafts = sheetResult.entries.map((t, idx) => {
        const isDup = existingSet.has(t.word_en.trim().toLowerCase());
        return {
          id: `draft-${idx}-${Date.now()}`,
          word_en: t.word_en,
          word_th: t.word_th,
          reading_th: t.reading_th || getThaiPhonetic(t.word_en),
          part_of_speech: t.part_of_speech || 'noun',
          example_sentence_en: t.example_sentence_en || '',
          example_sentence_th: t.example_sentence_th || '',
          selected: !isDup,
          isExpanded: false,
          isDuplicate: isDup,
        };
      });
    } else if (sheetResult.words && sheetResult.words.length > 0) {
      setBatchStepMessage(`AI พบ ${sheetResult.words.length} คำศัพท์! กำลังแปลความหมายและคำอ่านไทย...`);
      addLiffLog(`🌐 Translating ${sheetResult.words.length} extracted words...`);

      // Batch translate all extracted words
      const translations: TranslationResponse[] = await batchTranslateWords(sheetResult.words);

      // Populate batch draft list with duplicate check
      drafts = translations.map((t, idx) => {
        const isDup = existingSet.has(t.word_en.trim().toLowerCase());
        return {
          id: `draft-${idx}-${Date.now()}`,
          word_en: t.word_en,
          word_th: t.word_th,
          reading_th: t.reading_th || getThaiPhonetic(t.word_en),
          part_of_speech: t.part_of_speech || 'noun',
          example_sentence_en: t.example_sentence_en || '',
          example_sentence_th: t.example_sentence_th || '',
          selected: !isDup,
          isExpanded: false,
          isDuplicate: isDup,
        };
      });
    } else {
      addLiffLog(`⚠️ No vocabulary detected in image`);
      setError('ไม่พบคำศัพท์ภาษาอังกฤษที่ชัดเจนในภาพ กรุณาถ่ายใหม่อีกครั้งให้ตัวหนังสือชัดเจน');
      setIsProcessingBatch(false);
      return;
    }

    addLiffLog(`✅ Extracted ${drafts.length} words ready for review`);
    setExtractedWords(drafts);
  };

  const handleProcessProcessedImage = async (processed: ProcessedImage) => {
    setActiveTab('photo');
    setError(null);
    setDetectedSheetTitle(null);
    setIsProcessingBatch(true);
    setImagePreview(processed.base64);

    try {
      await executeVisionScan(processed);
    } catch (err: unknown) {
      const errObj = err as Error;
      addLiffLog(`❌ handleProcessProcessedImage error: ${errObj?.message || String(errObj)}`);
      console.error('Image scan error:', errObj);
      setError(errObj.message || 'ไม่สามารถสกัดคำศัพท์จากภาพได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsProcessingBatch(false);
      setBatchStepMessage(null);
    }
  };

  const handleProcessFile = async (file: File) => {
    addLiffLog(`📂 handleProcessFile called: "${file?.name}" (${((file?.size || 0) / 1024).toFixed(1)} KB, type: "${file?.type}")`);
    if (!file || file.size === 0) {
      addLiffLog(`❌ File is invalid or 0 byte`);
      setError('ไฟล์ภาพไม่ถูกต้องหรือมีขนาด 0 byte กรุณาลองใหม่อีกครั้ง');
      return;
    }

    // Ensure tab remains on photo scan
    setActiveTab('photo');
    try {
      sessionStorage.setItem('add_vocab_modal_tab', 'photo');
    } catch {
      // ignore
    }

    setError(null);
    setDetectedSheetTitle(null);
    setIsProcessingBatch(true);
    setBatchStepMessage('กำลังเตรียมรูปภาพและอ่านข้อมูล...');

    try {
      // 1. Resize and compress image client-side to prevent memory crashes & payload size issues
      setBatchStepMessage('กำลังบีบอัดรูปภาพให้เหมาะสมกับ AI...');
      addLiffLog(`⏳ Starting processAndCompressImage...`);
      const processed = await processAndCompressImage(file, 1600, 0.85);
      addLiffLog(`✅ Compressed image ready. Base64 len: ${(processed.base64.length / 1024).toFixed(1)} KB`);
      setImagePreview(processed.base64);

      // 2. Extract vocabulary words & sheet title using Multimodal Vision AI
      addLiffLog(`⏳ Calling executeVisionScan...`);
      await executeVisionScan(processed);
      addLiffLog(`🎉 executeVisionScan finished!`);
    } catch (err: unknown) {
      const errObj = err as Error;
      addLiffLog(`❌ Image scan error: ${errObj?.message || String(errObj)}`);
      console.error('[AddVocabModal] Image scan error:', errObj);
      setError(errObj.message || 'ไม่สามารถประมวลผลรูปภาพได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsProcessingBatch(false);
      setBatchStepMessage(null);
      if (galleryInputRef.current) {
        try {
          galleryInputRef.current.value = '';
        } catch {
          // ignore
        }
      }
    }
  };
  handleProcessFileRef.current = handleProcessFile;

  const handleToggleSelectWord = (id: string) => {
    setExtractedWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, selected: !w.selected } : w))
    );
  };

  const handleToggleSelectAll = () => {
    const allSelected = extractedWords.every((w) => w.selected);
    setExtractedWords((prev) => prev.map((w) => ({ ...w, selected: !allSelected })));
  };

  const handleToggleExpandWord = (id: string) => {
    setExtractedWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isExpanded: !w.isExpanded } : w))
    );
  };

  const handleUpdateDraftWord = (id: string, field: keyof VocabEntryDraft, value: any) => {
    setExtractedWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, [field]: value } : w))
    );
  };

  const handleDeleteDraftWord = (id: string) => {
    setExtractedWords((prev) => prev.filter((w) => w.id !== id));
  };

  // Single word save
  const handleSingleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordEn.trim() || !wordTh.trim()) {
      setError('Both English word and Thai translation are required.');
      return;
    }

    if (isSingleWordDuplicate) {
      setError(`Word "${wordEn.trim()}" already exists in this set.`);
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const finalReading = readingTh.trim() || getThaiPhonetic(wordEn.trim());
      await onSave({
        word_en: wordEn.trim(),
        word_th: wordTh.trim(),
        reading_th: finalReading,
        part_of_speech: partOfSpeech,
        example_sentence_en: exampleEn.trim(),
        example_sentence_th: exampleTh.trim(),
      });
      // Reset
      setWordEn('');
      setWordTh('');
      setReadingTh('');
      setExampleEn('');
      setExampleTh('');
      setImagePreview(null);
      onClose();
    } catch (err: unknown) {
      const errObj = err as Error;
      setError(errObj.message || 'Failed to save vocabulary.');
    } finally {
      setIsSaving(false);
    }
  };

  // Batch multi-word save from photo scan
  const handleBatchSavePhoto = async () => {
    const selectedWords = extractedWords.filter((w) => w.selected);
    if (selectedWords.length === 0) {
      setError('Please select at least one word to import.');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const payload = selectedWords.map((w) => ({
        word_en: w.word_en.trim(),
        word_th: w.word_th.trim(),
        reading_th: w.reading_th?.trim() || getThaiPhonetic(w.word_en.trim()),
        part_of_speech: w.part_of_speech,
        example_sentence_en: w.example_sentence_en.trim(),
        example_sentence_th: w.example_sentence_th.trim(),
      }));

      if (onBatchSave) {
        await onBatchSave(payload);
      } else {
        for (const item of payload) {
          await onSave(item);
        }
      }

      setExtractedWords([]);
      setImagePreview(null);
      onClose();
    } catch (err: unknown) {
      const errObj = err as Error;
      setError(errObj.message || 'Failed to import words.');
    } finally {
      setIsSaving(false);
    }
  };

  const posOptions: PartOfSpeech[] = ['noun', 'verb', 'adj', 'adv', 'gerund', 'past_participle', 'other'];
  const selectedPhotoCount = extractedWords.filter((w) => w.selected).length;
  const selectedPromptCount = promptDrafts.filter((w) => w.selected).length;

  const handleCopyThai = () => {
    navigator.clipboard.writeText(wordTh);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const promptSuggestions = [
    { label: '✈️ Airport & Travel (สนามบิน)', prompt: 'Airport and air travel vocabulary with practical examples for junior high students' },
    { label: '💼 Business & Meetings (ธุรกิจ)', prompt: 'Essential business English verbs and phrases for team meetings and discussions' },
    { label: '🌿 Animals & Habitats (สัตว์ป่า)', prompt: 'Wildlife, animal habitats, and environmental ecology vocabulary' },
    { label: '🍳 Restaurant & Food (อาหาร)', prompt: 'Ordering food, restaurant dining, cooking ingredients, and kitchen vocabulary' },
    { label: '🏥 Health & Hospital (การแพทย์)', prompt: 'Common medical terms, symptoms, doctor visits, and healthy living vocabulary' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-text-primary/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl my-auto max-h-[calc(100dvh-2.5rem)] flex flex-col">
        <Card className="p-4 sm:p-6 shadow-modal border-primary/20 relative flex flex-col flex-1 max-h-[calc(100dvh-2.5rem)] overflow-hidden bg-white">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-text-secondary hover:text-text-primary hover:bg-surface transition-colors z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="mb-3 pr-8 flex-shrink-0">
            <h2 className="text-lg sm:text-2xl font-outfit font-bold text-text-primary">Add Vocabulary</h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Add words by typing, AI Prompt generation, or scanning worksheets with <span className="font-semibold text-primary">คำอ่านภาษาไทย</span>!
            </p>
          </div>

          {/* 3 Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-surface rounded-2xl border border-border mb-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => handleTabChange('type')}
              className={`py-2 px-1.5 sm:px-3 rounded-xl text-[11px] sm:text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 text-center ${
                activeTab === 'type'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="truncate">Type Word</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('prompt')}
              className={`py-2 px-1.5 sm:px-3 rounded-xl text-[11px] sm:text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 text-center ${
                activeTab === 'prompt'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Wand2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="truncate">AI Prompt</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabChange('photo')}
              className={`py-2 px-1.5 sm:px-3 rounded-xl text-[11px] sm:text-xs md:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 text-center ${
                activeTab === 'photo'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="truncate">Photo Scan</span>
            </button>
          </div>

          {error && (
            <div className="mb-3 p-3 rounded-xl bg-secondary-light border border-secondary/20 text-xs text-secondary flex items-start gap-2 flex-shrink-0">
              <AlertTriangle className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 1: TYPE SINGLE WORD                                          */}
          {/* ================================================================= */}
          {activeTab === 'type' && (
            <form onSubmit={handleSingleSave} className="flex flex-col flex-1 min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 pb-2">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Input
                      label="English Word / Phrase"
                      placeholder="e.g. reading, bat, play"
                      value={wordEn}
                      onChange={(e) => setWordEn(e.target.value)}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      onClick={handleTranslate}
                      isLoading={isTranslating}
                      className="h-11"
                    >
                      <Sparkles className="w-4 h-4 mr-1 text-primary" />
                      Translate
                    </Button>
                  </div>
                </div>

                {/* Duplicate Word Warning Banner */}
                {isSingleWordDuplicate && (
                  <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <span>
                      คำว่า <strong className="font-bold font-outfit">"{wordEn.trim()}"</strong> มีอยู่ในชุดคำศัพท์นี้แล้ว
                    </span>
                  </div>
                )}

                {wordEn && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => speakWord(wordEn)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-light text-primary hover:bg-primary-light/80 transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      Pronounce English
                    </button>
                  </div>
                )}

                {/* Thai Phonetic Reading (คำอ่าน) */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-1">
                    Thai Pronunciation / คำอ่านภาษาไทย (เช่น อ่านว่า แบท)
                  </label>
                  <div className="flex rounded-input border border-border overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 bg-white transition-all">
                    <span className="inline-flex items-center px-3.5 bg-primary-light text-primary text-sm font-bold font-sarabun border-r border-border/80 flex-shrink-0 select-none">
                      อ่านว่า:
                    </span>
                    <input
                      type="text"
                      placeholder="e.g. แบท, รีดดิ้ง, เพลย์"
                      className="w-full h-11 px-3.5 bg-transparent text-primary font-sarabun text-base font-semibold focus:outline-none placeholder:text-text-muted"
                      value={readingTh}
                      onChange={(e) => setReadingTh(e.target.value)}
                    />
                  </div>
                </div>

                {/* Thai Meaning */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-text-primary">
                      Thai Meaning (ความหมายภาษาไทย)
                    </label>
                    {wordTh && (
                      <button
                        type="button"
                        onClick={handleCopyThai}
                        className="text-xs text-text-secondary hover:text-primary flex items-center gap-1"
                      >
                        {copied ? <Check className="w-3 h-3 text-accent-green" /> : <Copy className="w-3 h-3" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                    )}
                  </div>
                  <Input
                    placeholder="e.g. การอ่านหนังสือ, เล่น"
                    className="font-sarabun text-base"
                    value={wordTh}
                    onChange={(e) => setWordTh(e.target.value)}
                    required
                  />
                </div>

                {/* POS Chips */}
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Part of Speech (ชนิดของคำ)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {posOptions.map((pos) => (
                      <button
                        type="button"
                        key={pos}
                        onClick={() => setPartOfSpeech(pos)}
                        className={`cursor-pointer transition-transform active:scale-95 ${
                          partOfSpeech === pos ? 'ring-2 ring-primary ring-offset-1 scale-105' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Badge pos={pos} size="md">
                          {pos}
                        </Badge>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Example Sentences */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      English Example Sentence
                    </label>
                    <textarea
                      rows={2}
                      className="w-full p-2.5 rounded-input bg-white border border-border text-text-primary text-xs focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder="e.g. Reading helps students learn new English words every day."
                      value={exampleEn}
                      onChange={(e) => setExampleEn(e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-secondary mb-1">
                      Thai Example Sentence (ประโยคตัวอย่างภาษาไทย)
                    </label>
                    <textarea
                      rows={2}
                      className="w-full p-2.5 rounded-input bg-white border border-border text-text-primary text-xs font-sarabun focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder="e.g. การอ่านช่วยให้นักเรียนได้เรียนรู้คำศัพท์ใหม่ๆ ทุกวัน"
                      value={exampleTh}
                      onChange={(e) => setExampleTh(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons (Fixed Footer) */}
              <div className="flex justify-end gap-3 pt-3 border-t border-border mt-3 flex-shrink-0">
                <Button type="button" variant="ghost" size="md" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  isLoading={isSaving}
                  disabled={isSingleWordDuplicate}
                >
                  Save Word
                </Button>
              </div>
            </form>
          )}

          {/* ================================================================= */}
          {/* TAB 2: AI PROMPT GENERATOR                                       */}
          {/* ================================================================= */}
          {activeTab === 'prompt' && (
            <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
              {promptDrafts.length === 0 ? (
                <form
                  onSubmit={handleGeneratePromptVocab}
                  className="flex flex-col flex-1 min-h-0 overflow-hidden"
                >
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 pb-2">
                    {/* Prompt description */}
                    <div>
                      <label className="block text-sm font-semibold text-text-primary mb-1">
                        Topic or Prompt for AI Vocabulary Generation
                      </label>
                      <textarea
                        rows={3}
                        className="w-full p-3 rounded-xl bg-white border border-border text-text-primary text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                        placeholder="e.g. คำศัพท์เกี่ยวกับการเดินทางในสนามบินสำหรับนักเรียน ม.ต้น พร้อมตัวอย่างประโยค หรือ Daily conversation verbs"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        required
                        autoFocus
                      />
                    </div>

                    {/* Word Count Selector (Max 50) */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-sm font-semibold text-text-primary">
                          Number of Words (จำนวนคำ: 1 - 50 คำ)
                        </label>
                        <span className="text-xs font-bold text-primary px-2 py-0.5 rounded-full bg-primary-light">
                          {aiCount} words
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={50}
                          value={aiCount}
                          onChange={(e) => setAiCount(Math.min(Math.max(Number(e.target.value) || 1, 1), 50))}
                          className="w-24 px-3 py-2 text-sm font-bold text-text-primary bg-white rounded-xl border border-border focus:outline-none focus:border-primary text-center"
                        />
                        <div className="flex flex-wrap gap-1.5">
                          {[5, 10, 15, 20, 30, 50].map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setAiCount(c)}
                              className={`px-2.5 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                                aiCount === c
                                  ? 'bg-primary text-white border-primary shadow-sm'
                                  : 'bg-surface text-text-secondary border-border hover:bg-white'
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Quick Suggestion Chips */}
                    <div>
                      <label className="block text-xs font-semibold text-text-secondary mb-2">
                        Quick Topic Ideas (กดเลือกเพื่อใส่หัวข้อทันที):
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {promptSuggestions.map((s, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setAiPrompt(s.prompt)}
                            className="text-xs font-medium px-2.5 py-1 rounded-lg bg-surface border border-border/80 text-text-primary hover:border-primary hover:text-primary transition-colors text-left"
                          >
                            {s.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end gap-3 pt-3 border-t border-border mt-3 flex-shrink-0">
                    <Button type="button" variant="ghost" size="md" onClick={onClose}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="md"
                      isLoading={isGeneratingPrompt}
                      disabled={!aiPrompt.trim()}
                    >
                      <Wand2 className="w-4 h-4 mr-1.5" />
                      Generate {aiCount} Words
                    </Button>
                  </div>
                </form>
              ) : (
                /* AI Prompt Review List */
                <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                  <div className="flex items-center justify-between bg-primary-light/40 p-3 rounded-xl border border-primary/20 mb-3 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-text-primary">
                          AI Generated {promptDrafts.length} Words
                        </p>
                        <p className="text-xs text-text-secondary">
                          {selectedPromptCount} words selected to add to set
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleToggleSelectAllPrompt}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        {promptDrafts.every((w) => w.selected) ? (
                          <>
                            <Square className="w-3.5 h-3.5" /> Deselect All
                          </>
                        ) : (
                          <>
                            <CheckSquare className="w-3.5 h-3.5" /> Select All
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => setPromptDrafts([])}
                        className="text-xs font-semibold text-secondary hover:underline ml-2"
                      >
                        New Prompt
                      </button>
                    </div>
                  </div>

                  {/* Draft Items List */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 pb-2">
                    {promptDrafts.map((item, index) => (
                      <div
                        key={item.id}
                        className={`p-3 rounded-xl border transition-all ${
                          item.selected
                            ? 'bg-white border-primary/30 shadow-sm'
                            : 'bg-surface/60 border-border opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 flex-1">
                            <button
                              type="button"
                              onClick={() => handleToggleSelectPromptWord(item.id)}
                              className="mt-0.5 text-primary flex-shrink-0"
                            >
                              {item.selected ? (
                                <CheckSquare className="w-4 h-4" />
                              ) : (
                                <Square className="w-4 h-4 text-text-secondary" />
                              )}
                            </button>

                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-text-muted">{index + 1}.</span>
                                <input
                                  type="text"
                                  value={item.word_en}
                                  onChange={(e) =>
                                    handleUpdatePromptDraftWord(item.id, 'word_en', e.target.value)
                                  }
                                  className="font-bold text-sm text-text-primary bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-1 py-0.5"
                                />
                                {item.isDuplicate && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                    ⚠️ มีแล้วในชุดนี้
                                  </span>
                                )}
                                <Badge pos={item.part_of_speech} size="sm">
                                  {item.part_of_speech}
                                </Badge>
                                <button
                                  type="button"
                                  onClick={() => speakWord(item.word_en)}
                                  className="text-text-secondary hover:text-primary transition-colors"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                                <div className="flex items-center gap-1 bg-surface px-2.5 py-1 rounded-lg border border-border/60">
                                  <span className="text-[11px] font-bold text-primary font-sarabun flex-shrink-0">
                                    อ่านว่า:
                                  </span>
                                  <input
                                    type="text"
                                    value={item.reading_th || ''}
                                    placeholder="คำอ่านไทย"
                                    onChange={(e) =>
                                      handleUpdatePromptDraftWord(item.id, 'reading_th', e.target.value)
                                    }
                                    className="text-xs text-primary font-semibold font-sarabun bg-transparent focus:outline-none w-full"
                                  />
                                </div>

                                <input
                                  type="text"
                                  value={item.word_th}
                                  placeholder="ความหมายภาษาไทย"
                                  onChange={(e) =>
                                    handleUpdatePromptDraftWord(item.id, 'word_th', e.target.value)
                                  }
                                  className="text-xs text-text-secondary font-sarabun bg-surface px-2.5 py-1 rounded-lg border border-border/60 focus:outline-none focus:border-primary w-full"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleExpandPromptWord(item.id)}
                              className="p-1 text-text-secondary hover:text-primary rounded-lg"
                              title="Edit example sentences"
                            >
                              {item.isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePromptDraftWord(item.id)}
                              className="p-1 text-secondary/70 hover:text-secondary rounded-lg"
                              title="Remove word"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Expandable Example Sentences */}
                        {item.isExpanded && (
                          <div className="mt-3 pt-3 border-t border-border/80 space-y-2 text-xs">
                            <div>
                              <label className="font-semibold text-text-secondary block mb-0.5">
                                Part of Speech
                              </label>
                              <select
                                value={item.part_of_speech}
                                onChange={(e) =>
                                  handleUpdatePromptDraftWord(
                                    item.id,
                                    'part_of_speech',
                                    e.target.value as PartOfSpeech
                                  )
                                }
                                className="p-1.5 rounded-lg border border-border bg-white text-xs"
                              >
                                {posOptions.map((p) => (
                                  <option key={p} value={p}>
                                    {p}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="font-semibold text-text-secondary block mb-0.5">
                                Example Sentence (EN)
                              </label>
                              <input
                                type="text"
                                value={item.example_sentence_en}
                                onChange={(e) =>
                                  handleUpdatePromptDraftWord(item.id, 'example_sentence_en', e.target.value)
                                }
                                className="w-full p-1.5 rounded-lg border border-border text-xs focus:outline-none focus:border-primary"
                              />
                            </div>

                            <div>
                              <label className="font-semibold text-text-secondary block mb-0.5">
                                Example Sentence (TH)
                              </label>
                              <input
                                type="text"
                                value={item.example_sentence_th}
                                onChange={(e) =>
                                  handleUpdatePromptDraftWord(item.id, 'example_sentence_th', e.target.value)
                                }
                                className="w-full p-1.5 rounded-lg border border-border text-xs font-sarabun focus:outline-none focus:border-primary"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-border flex-shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="md"
                      onClick={() => setPromptDrafts([])}
                    >
                      Back to Prompt
                    </Button>

                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={handleBatchSavePromptWords}
                      isLoading={isSaving}
                      disabled={selectedPromptCount === 0}
                    >
                      Add {selectedPromptCount} Words to Set
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================================================================= */}
          {/* TAB 3: PHOTO / WORKSHEET SCAN                                    */}
          {/* ================================================================= */}
          {activeTab === 'photo' && (
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {extractedWords.length === 0 ? (
                <div className="space-y-4">
                  {isCameraActive ? (
                    /* In-App Camera Viewfinder (WebRTC - Prevents Android WebView Process Kill) */
                    <div className="relative w-full rounded-2xl overflow-hidden bg-black flex flex-col items-center justify-center shadow-lg border border-primary/30 animate-fade-in">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-80 object-cover"
                      />

                      {/* Viewfinder Framing Guidelines */}
                      <div className="absolute inset-x-6 inset-y-12 border-2 border-white/60 border-dashed rounded-xl pointer-events-none flex items-center justify-center">
                        <span className="text-white text-xs font-semibold px-3 py-1 bg-black/50 backdrop-blur-sm rounded-full">
                          เล็งคำศัพท์หรือใบงานให้อยู่ในกรอบ
                        </span>
                      </div>

                      {/* Top Action Controls: Flip & Close */}
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between z-20">
                        <button
                          type="button"
                          onClick={handleFlipCamera}
                          className="p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm transition-all active:scale-95"
                          title="สลับกล้องหน้า / กล้องหลัง"
                        >
                          <RotateCw className="w-5 h-5" />
                        </button>

                        <button
                          type="button"
                          onClick={stopCamera}
                          className="p-2.5 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-sm transition-all active:scale-95"
                          title="ปิดกล้อง"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Bottom Action Controls: Shutter Button */}
                      <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 z-20">
                        <button
                          type="button"
                          onClick={handleCaptureSnapshot}
                          className="w-16 h-16 rounded-full bg-white border-4 border-primary shadow-2xl hover:scale-105 active:scale-90 transition-all flex items-center justify-center cursor-pointer"
                          title="กดเพื่อถ่ายภาพ"
                        >
                          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                        </button>
                      </div>
                    </div>
                  ) : isProcessingBatch ? (
                    /* Processing State with Preview Overlay - Instant Feedback */
                    <div className="relative w-full h-64 rounded-2xl overflow-hidden border-2 border-primary/40 bg-slate-900/10 flex items-center justify-center p-3 shadow-inner">
                      {imagePreview && (
                        <img
                          src={imagePreview}
                          alt="Worksheet Preview"
                          className="max-h-60 max-w-full rounded-xl object-contain opacity-60 filter blur-[1px]"
                        />
                      )}
                      <div className="absolute inset-0 bg-white/85 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-3 p-6 text-center animate-fade-in">
                        <div className="w-14 h-14 rounded-2xl bg-primary-light flex items-center justify-center text-primary shadow-sm animate-pulse">
                          <Sparkles className="w-7 h-7 animate-spin" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm sm:text-base font-outfit font-bold text-text-primary">
                            AI Vision Processing
                          </p>
                          <p className="text-xs sm:text-sm font-medium text-primary max-w-sm mx-auto">
                            {batchStepMessage || 'กำลังอ่านและค้นหาคำศัพท์จากภาพ...'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Dual Action Upload & Camera Dropzone */
                    <div
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragOver(true);
                      }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDragOver(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleProcessFile(file);
                      }}
                      className={`w-full rounded-2xl border-2 border-dashed transition-all p-5 sm:p-7 text-center ${
                        isDragOver
                          ? 'border-primary bg-primary-light/30 scale-[1.01]'
                          : 'border-primary/30 bg-primary-light/10 hover:border-primary/60'
                      }`}
                    >
                      <div className="max-w-md mx-auto space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-white text-primary flex items-center justify-center mx-auto shadow-sm">
                          <Camera className="w-7 h-7 text-primary" />
                        </div>

                        <div>
                          <h3 className="text-base sm:text-lg font-outfit font-bold text-text-primary">
                            Photo & Worksheet Scanner
                          </h3>
                          <p className="text-xs text-text-secondary mt-1">
                            สกัดคำศัพท์ภาษาอังกฤษจากใบงาน แบบฝึกหัด หรือหนังสือเรียน พร้อมคำแปลและคำอ่านไทยด้วย AI
                          </p>
                        </div>

                        {/* Camera Retry Hint — shown when external camera caused reload */}
                        {showCameraRetryHint && (
                          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs space-y-2 animate-fade-in">
                            <div className="flex items-start gap-2">
                              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <p className="font-bold">ภาพที่ถ่ายไม่ถูกส่งเข้ามา</p>
                                <p className="mt-1">
                                  เนื่องจาก LINE App ทำการ reload หน้าระหว่างเปิดกล้องภายนอก แนะนำให้ใช้ปุ่ม <strong>ถ่ายภาพทันที (In-App Camera)</strong> หรือ <strong>เลือกรูปจากเครื่อง</strong> แทน
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowCameraRetryHint(false)}
                              className="text-xs font-semibold text-amber-700 underline"
                            >
                              ปิดข้อความนี้
                            </button>
                          </div>
                        )}

                        {/* Dual Action Buttons */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          {/* 1. Take Photo (In-App WebRTC Camera) */}
                          <button
                            type="button"
                            onClick={() => startInAppCamera('environment')}
                            disabled={isStartingCamera}
                            className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-primary text-white font-bold text-sm shadow-md hover:bg-primary-hover active:scale-95 transition-all cursor-pointer select-none"
                          >
                            <Camera className="w-4 h-4 flex-shrink-0" />
                            <span>{isStartingCamera ? 'กำลังเปิดกล้อง...' : 'ถ่ายภาพทันที'}</span>
                          </button>

                          {/* Fallback hidden camera input */}
                          <input
                            id="camera-upload-input"
                            ref={cameraInputRef}
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onClick={() => markCameraPending()}
                            onChange={(e) => {
                              clearCameraPending();
                              const file = e.target.files?.[0];
                              e.target.value = '';
                              if (file) handleProcessFile(file);
                            }}
                          />

                          {/* 2. Upload Image (Gallery / Files) - Direct native input overlay guarantees genuine touch event in mobile WebViews */}
                          <div className="relative overflow-hidden flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-white border-2 border-primary/30 text-primary font-bold text-sm shadow-sm hover:border-primary hover:bg-primary-light/20 active:scale-95 transition-all cursor-pointer select-none text-center">
                            <ImageIcon className="w-4 h-4 flex-shrink-0" />
                            <span>เลือกรูปจากเครื่อง</span>
                            <input
                              id="gallery-upload-input"
                              ref={galleryInputRef}
                              type="file"
                              accept="image/*,image/jpeg,image/jpg,image/png,image/webp"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              onClick={() => {
                                addLiffLog('📱 galleryInput touched (native picker opening)');
                                // Do NOT clear value here, let Android file chooser intent fire uninhibited
                              }}
                              onChange={(e) => {
                                const files = e.target.files;
                                addLiffLog(`📥 galleryInput onChange fired: ${files?.length ?? 0} file(s)`);
                                if (files && files.length > 0 && files[0]) {
                                  const f = files[0];
                                  addLiffLog(`📄 Picked: "${f.name}", ${((f.size || 0) / 1024).toFixed(1)} KB, type: "${f.type}"`);
                                  handleProcessFile(f);
                                } else {
                                  addLiffLog('⚠️ onChange fired but 0 files found');
                                }
                              }}
                            />
                          </div>
                        </div>

                        {/* Secondary Alternative for Android devices where PhotoPicker suppresses files */}
                        <div className="flex justify-center pt-1">
                          <div className="relative overflow-hidden inline-flex items-center justify-center gap-1.5 text-xs text-primary/80 hover:text-primary font-medium underline cursor-pointer py-1">
                            <span>📂 หรือแตะที่นี่เพื่อเลือกผ่านตัวจัดการไฟล์ทั่วไป (*/*)</span>
                            <input
                              type="file"
                              accept="*/*"
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                              onClick={() => {
                                addLiffLog('📱 wildcardInput (*/*) touched');
                              }}
                              onChange={(e) => {
                                const files = e.target.files;
                                addLiffLog(`📥 wildcardInput onChange: ${files?.length ?? 0} file(s)`);
                                if (files && files.length > 0 && files[0]) {
                                  const f = files[0];
                                  addLiffLog(`📄 Wildcard Picked: "${f.name}", ${((f.size || 0) / 1024).toFixed(1)} KB`);
                                  handleProcessFile(f);
                                }
                              }}
                            />
                          </div>
                        </div>

                        {/* LINE In-App Browser Helper: Open in External Browser if device restricts WebView uploads */}
                        {liffService.isInClient() && (
                          <div className="mt-3 p-2.5 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-800 text-xs flex flex-col sm:flex-row items-center justify-between gap-2 text-left">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium">💡 เล่นผ่าน LINE: ต้องการใช้กล้องหลักของเครื่อง</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => liffService.openExternal()}
                              className="inline-flex items-center gap-1 font-bold text-blue-700 hover:text-blue-900 underline whitespace-nowrap"
                            >
                              เปิดใน Chrome / Safari <ExternalLink className="w-3.5 h-3.5 ml-0.5" />
                            </button>
                          </div>
                        )}

                        <p className="text-[11px] text-text-muted pt-1">
                          รองรับการถ่ายรูปในแอป, เลือกรูปจากคลังภาพ, หรือลากไฟล์มาวาง (JPG, PNG, WebP)
                        </p>

                        {/* LIFF Live Diagnostics Debug Box */}
                        <div className="mt-4 p-3 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono shadow-md border border-slate-700 text-left">
                          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                            <div className="flex items-center gap-2">
                              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                              <span className="font-bold text-slate-200 text-xs">LIFF Live Debugger</span>
                              <span className="text-[10px] text-slate-400">({debugLogs.length})</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  try {
                                    navigator.clipboard.writeText(debugLogs.join('\n'));
                                    setCopiedLogs(true);
                                    setTimeout(() => setCopiedLogs(false), 2000);
                                  } catch (err) {
                                    addLiffLog(`Clipboard copy error: ${err}`);
                                  }
                                }}
                                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded text-[11px] font-bold border border-slate-600 active:scale-95 transition-all"
                              >
                                {copiedLogs ? '✓ คัดลอกแล้ว!' : '📋 คัดลอก Logs'}
                              </button>
                              <button
                                type="button"
                                onClick={() => clearLiffLogs()}
                                className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded text-[11px] border border-slate-600 active:scale-95 transition-all"
                              >
                                ล้าง
                              </button>
                            </div>
                          </div>
                          <div className="mt-2 max-h-40 overflow-y-auto space-y-1 text-[10px] text-slate-300 select-all font-mono leading-relaxed">
                            {debugLogs.length === 0 ? (
                              <p className="text-slate-500 italic">ยังไม่มี logs บันทึก...</p>
                            ) : (
                              debugLogs.map((log, i) => (
                                <div key={i} className="border-b border-slate-800/40 pb-0.5 break-all">
                                  {log}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Multi-Word Review List */
                <div className="space-y-4">
                  <div className="flex items-center justify-between bg-primary-light/40 p-3 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-2">
                      <Layers className="w-5 h-5 text-primary flex-shrink-0" />
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-text-primary">
                            Detected {extractedWords.length} Words
                          </p>
                          {detectedSheetTitle && (
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary text-white">
                              {detectedSheetTitle}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-text-secondary">
                          {selectedPhotoCount} selected for import
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleToggleSelectAll}
                        className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
                      >
                        {extractedWords.every((w) => w.selected) ? (
                          <>
                            <Square className="w-3.5 h-3.5" /> Deselect All
                          </>
                        ) : (
                          <>
                            <CheckSquare className="w-3.5 h-3.5" /> Select All
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setExtractedWords([]);
                          setImagePreview(null);
                        }}
                        className="text-xs font-semibold text-secondary hover:underline ml-2"
                      >
                        Scan New Photo
                      </button>
                    </div>
                  </div>

                  {/* Extracted Words Items */}
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {extractedWords.map((item, index) => (
                      <div
                        key={item.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          item.selected
                            ? 'bg-white border-primary/30 shadow-sm'
                            : 'bg-surface/60 border-border opacity-60'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5 flex-1">
                            <button
                              type="button"
                              onClick={() => handleToggleSelectWord(item.id)}
                              className="mt-0.5 text-primary flex-shrink-0"
                            >
                              {item.selected ? (
                                <CheckSquare className="w-4 h-4" />
                              ) : (
                                <Square className="w-4 h-4 text-text-secondary" />
                              )}
                            </button>

                            <div className="space-y-1 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-bold text-text-muted">{index + 1}.</span>
                                <input
                                  type="text"
                                  value={item.word_en}
                                  onChange={(e) =>
                                    handleUpdateDraftWord(item.id, 'word_en', e.target.value)
                                  }
                                  className="font-bold text-sm text-text-primary bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none px-1 py-0.5"
                                />
                                {item.isDuplicate && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                    ⚠️ มีแล้วในชุดนี้
                                  </span>
                                )}
                                <Badge pos={item.part_of_speech} size="sm">
                                  {item.part_of_speech}
                                </Badge>
                                <button
                                  type="button"
                                  onClick={() => speakWord(item.word_en)}
                                  className="text-text-secondary hover:text-primary transition-colors"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                                <div className="flex items-center gap-1 bg-surface px-2.5 py-1 rounded-lg border border-border/60">
                                  <span className="text-[11px] font-bold text-primary font-sarabun flex-shrink-0">
                                    อ่านว่า:
                                  </span>
                                  <input
                                    type="text"
                                    value={item.reading_th || ''}
                                    placeholder="คำอ่านไทย"
                                    onChange={(e) =>
                                      handleUpdateDraftWord(item.id, 'reading_th', e.target.value)
                                    }
                                    className="text-xs text-primary font-semibold font-sarabun bg-transparent focus:outline-none w-full"
                                  />
                                </div>

                                <input
                                  type="text"
                                  value={item.word_th}
                                  placeholder="ความหมายภาษาไทย"
                                  onChange={(e) =>
                                    handleUpdateDraftWord(item.id, 'word_th', e.target.value)
                                  }
                                  className="text-xs text-text-secondary font-sarabun bg-surface px-2.5 py-1 rounded-lg border border-border/60 focus:outline-none focus:border-primary w-full"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleToggleExpandWord(item.id)}
                              className="p-1 text-text-secondary hover:text-primary rounded-lg"
                              title="Edit example sentences"
                            >
                              {item.isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteDraftWord(item.id)}
                              className="p-1 text-secondary/70 hover:text-secondary rounded-lg"
                              title="Remove word"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Expandable Example Sentence Details */}
                        {item.isExpanded && (
                          <div className="mt-3 pt-3 border-t border-border/80 space-y-2 text-xs">
                            <div>
                              <label className="font-semibold text-text-secondary block mb-0.5">
                                Part of Speech
                              </label>
                              <select
                                value={item.part_of_speech}
                                onChange={(e) =>
                                  handleUpdateDraftWord(
                                    item.id,
                                    'part_of_speech',
                                    e.target.value as PartOfSpeech
                                  )
                                }
                                className="p-1.5 rounded-lg border border-border bg-white text-xs"
                              >
                                {posOptions.map((p) => (
                                  <option key={p} value={p}>
                                    {p}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="font-semibold text-text-secondary block mb-0.5">
                                Example Sentence (EN)
                              </label>
                              <input
                                type="text"
                                value={item.example_sentence_en}
                                onChange={(e) =>
                                  handleUpdateDraftWord(item.id, 'example_sentence_en', e.target.value)
                                }
                                className="w-full p-1.5 rounded-lg border border-border text-xs focus:outline-none focus:border-primary"
                              />
                            </div>

                            <div>
                              <label className="font-semibold text-text-secondary block mb-0.5">
                                Example Sentence (TH)
                              </label>
                              <input
                                type="text"
                                value={item.example_sentence_th}
                                onChange={(e) =>
                                  handleUpdateDraftWord(item.id, 'example_sentence_th', e.target.value)
                                }
                                className="w-full p-1.5 rounded-lg border border-border text-xs font-sarabun focus:outline-none focus:border-primary"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border flex-shrink-0">
                    <Button
                      type="button"
                      variant="ghost"
                      size="md"
                      onClick={() => {
                        setExtractedWords([]);
                        setImagePreview(null);
                      }}
                    >
                      Cancel
                    </Button>

                    <Button
                      type="button"
                      variant="primary"
                      size="md"
                      onClick={handleBatchSavePhoto}
                      isLoading={isSaving}
                      disabled={selectedPhotoCount === 0}
                    >
                      Import {selectedPhotoCount} Selected Words
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
