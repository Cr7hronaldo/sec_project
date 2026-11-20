import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { OFFICIAL_SERVICES } from './src/data/officialServices';
import {
  analyzeSituationWithGemini,
  askGroundedQuestionWithGemini,
  fetchLatestIndianStudentUpdates,
  generateSpeechWithGemini,
  transcribeAudioWithGemini,
  translateServiceGuideWithGemini,
} from './server/geminiService';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '15mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true });
  });

  app.get('/api/services', (_req, res) => {
    res.json({ services: OFFICIAL_SERVICES });
  });

  app.post('/api/analyze-situation', async (req, res) => {
    try {
      const { situation, language } = req.body ?? {};
      if (!situation || typeof situation !== 'string' || !situation.trim()) {
        res.status(400).json({
          error: 'Please describe your situation before running an eligibility check.',
        });
        return;
      }

      const targetLanguage =
        typeof language === 'string' && language.trim() ? language.trim() : 'English';
      const result = await analyzeSituationWithGemini(situation.trim(), targetLanguage);
      res.json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to analyze situation right now.';
      console.error('[/api/analyze-situation] Error:', message);
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/translate-guide', async (req, res) => {
    try {
      const { serviceId, targetLanguage } = req.body ?? {};
      const service = OFFICIAL_SERVICES.find((s) => s.id === serviceId);
      if (!service) {
        res.status(404).json({ error: 'Official service record not found.' });
        return;
      }
      if (!targetLanguage || typeof targetLanguage !== 'string') {
        res.status(400).json({ error: 'Target language is required.' });
        return;
      }

      const translated = await translateServiceGuideWithGemini(service, targetLanguage);
      res.json(translated);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Translation failed.';
      console.error('[/api/translate-guide] Error:', message);
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/ask-grounded', async (req, res) => {
    try {
      const { serviceId, question, language, situationContext } = req.body ?? {};
      const service = OFFICIAL_SERVICES.find((s) => s.id === serviceId);
      if (!service) {
        res.status(404).json({ error: 'Official service record not found.' });
        return;
      }
      if (!question || typeof question !== 'string' || !question.trim()) {
        res.status(400).json({ error: 'Please enter a question to ask.' });
        return;
      }

      const targetLanguage =
        typeof language === 'string' && language.trim() ? language.trim() : 'English';
      const answer = await askGroundedQuestionWithGemini(
        service,
        question.trim(),
        targetLanguage,
        typeof situationContext === 'string' ? situationContext : undefined
      );
      res.json(answer);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to answer question.';
      console.error('[/api/ask-grounded] Error:', message);
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/transcribe', async (req, res) => {
    try {
      const { audioBase64, mimeType } = req.body ?? {};
      if (!audioBase64 || typeof audioBase64 !== 'string') {
        res.status(400).json({ error: 'Audio recording payload is missing.' });
        return;
      }
      const cleanMime =
        typeof mimeType === 'string' && mimeType.trim() ? mimeType.trim() : 'audio/webm';
      const result = await transcribeAudioWithGemini(audioBase64, cleanMime);
      res.json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Audio transcription failed.';
      console.error('[/api/transcribe] Error:', message);
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/tts', async (req, res) => {
    try {
      const { text } = req.body ?? {};
      if (!text || typeof text !== 'string' || !text.trim()) {
        res.status(400).json({ error: 'Text is required for audio narration.' });
        return;
      }
      const result = await generateSpeechWithGemini(text.trim().slice(0, 1800));
      res.json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Speech generation failed.';
      console.error('[/api/tts] Error:', message);
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/latest-updates', async (req, res) => {
    try {
      const { focusQuery, language } = req.body ?? {};
      const cleanFocus =
        typeof focusQuery === 'string' ? focusQuery.trim() : '';
      const targetLanguage =
        typeof language === 'string' && language.trim() ? language.trim() : 'English';
      const updates = await fetchLatestIndianStudentUpdates(
        cleanFocus,
        targetLanguage
      );
      res.json(updates);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to fetch live student updates right now.';
      console.error('[/api/latest-updates] Error:', message);
      res.status(500).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CivicLedger server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
