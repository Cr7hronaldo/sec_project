import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Loader2, Mic, RefreshCw, Square } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../types/civic';

interface SituationDeskProps {
  situationText: string;
  onSituationChange: (value: string) => void;
  language: string;
  onLanguageChange: (language: string) => void;
  onSubmitSituation: (overrideText?: string) => void;
  isAnalyzing: boolean;
  onBrowseDirectory: () => void;
  onOpenLiveUpdates: () => void;
}

const SAMPLE_SITUATIONS = [
  {
    label: 'BTech girl student · Scholarship & internship',
    text: 'I am a BTech first-year female student in India with family income under 4 lakh. I need college tuition scholarships, a DigiLocker income certificate, and future internship opportunities.',
  },
  {
    label: 'Hostel student · Ration, food & post-matric aid',
    text: 'I moved to another city for college, belong to OBC/EWS category with family income 2.2 lakh, and need hostel mess/food ration support and a post-matric scholarship.',
  },
  {
    label: 'Graduate · Ayushman health cover & job portal',
    text: 'I recently completed graduation, am 22 years old looking for a paid government internship or job, and need Ayushman Bharat cashless hospital cover for my parents.',
  },
];

export const SituationDesk: React.FC<SituationDeskProps> = ({
  situationText,
  onSituationChange,
  language,
  onLanguageChange,
  onSubmitSituation,
  isAnalyzing,
  onBrowseDirectory,
  onOpenLiveUpdates,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [voiceNotice, setVoiceNotice] = useState<string | null>(null);
  const [imgFailed, setImgFailed] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== 'inactive'
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleToggleVoice = async () => {
    setVoiceNotice(null);

    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setVoiceNotice(
        'Voice recording is unavailable in this browser. Please type your situation above.'
      );
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredMime = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : 'audio/mp4';
      const recorder = new MediaRecorder(stream, { mimeType: preferredMime });
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(chunksRef.current, { type: preferredMime });
        if (audioBlob.size < 256) {
          setVoiceNotice('Recording was too short. Please try speaking again.');
          return;
        }

        setIsTranscribing(true);
        try {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const result = String(reader.result || '');
              const commaIndex = result.indexOf(',');
              resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
            };
            reader.onerror = () =>
              reject(new Error('Unable to read recorded audio.'));
            reader.readAsDataURL(audioBlob);
          });

          const res = await fetch('/api/transcribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              audioBase64: base64,
              mimeType: preferredMime,
            }),
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(data.error || 'Voice transcription failed.');
          }
          const combined = situationText.trim()
            ? `${situationText.trim()} ${data.transcript}`
            : data.transcript;
          onSituationChange(combined);
        } catch (err) {
          setVoiceNotice(
            err instanceof Error
              ? err.message
              : 'Could not transcribe voice audio.'
          );
        } finally {
          setIsTranscribing(false);
        }
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecordingSeconds(0);
      setIsRecording(true);
      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch {
      setVoiceNotice(
        'Microphone access was declined or is unavailable. You can type your situation in Hindi, English, or any regional language.'
      );
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!situationText.trim() || isAnalyzing) return;
    onSubmitSituation();
  };

  return (
    <section className="border-b border-neutral-200 bg-white">
      <div className="mx-auto max-w-[1240px] px-6 py-10 lg:py-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-stretch">
          {/* Left Column: Editorial Headline + Situation Intake Desk */}
          <div className="flex flex-col justify-between lg:col-span-7">
            <div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                <span>India Student Portal Desk</span>
                <span aria-hidden="true">·</span>
                <span>Scholarships, Food, Certificates, Health &amp; Jobs</span>
                <span aria-hidden="true">·</span>
                <span>Live Web Updates</span>
              </div>

              <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight text-neutral-950 sm:text-5xl lg:text-[3.15rem] lg:leading-[1.08]">
                Indian student schemes &amp; portals, made legible.
              </h1>

              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-neutral-600">
                Describe your course, family income, or needs in ordinary words or
                by voice. CivicLedger finds matching scholarships, NFSA food
                benefits, DigiLocker certificates, Ayushman healthcare, and
                internships—with direct official portal links and live search
                updates.
              </p>
            </div>

            <form
              onSubmit={handleFormSubmit}
              className="mt-7 border border-neutral-300 bg-neutral-50/70 p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <label
                  htmlFor="situation-input"
                  className="text-xs font-semibold tracking-wide text-neutral-900"
                >
                  Describe your situation
                </label>

                <div className="flex items-center gap-2">
                  <label
                    htmlFor="output-language-select"
                    className="text-xs text-neutral-500"
                  >
                    Guide language
                  </label>
                  <select
                    id="output-language-select"
                    value={language}
                    onChange={(e) => onLanguageChange(e.target.value)}
                    className="border border-neutral-300 bg-white px-2.5 py-1.5 text-xs font-medium text-neutral-950 focus-visible:outline-2 focus-visible:outline-neutral-950"
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.nativeLabel} ({lang.label})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <textarea
                id="situation-input"
                rows={4}
                value={situationText}
                onChange={(e) => onSituationChange(e.target.value)}
                placeholder="Example: I am a BTech student with family income ₹3 lakh needing NSP/AICTE scholarships, income certificate, or paid internships..."
                className="mt-3 w-full resize-y border border-neutral-300 bg-white px-4 py-3 text-[15px] leading-relaxed text-neutral-950 placeholder:text-neutral-400 focus:border-neutral-950 focus:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950"
              />

              {voiceNotice && (
                <p role="status" className="mt-2.5 text-xs text-neutral-700">
                  {voiceNotice}
                </p>
              )}

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleToggleVoice}
                    disabled={isTranscribing || isAnalyzing}
                    className={`inline-flex items-center gap-2 border px-4 py-2.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-neutral-950 ${
                      isRecording
                        ? 'border-neutral-950 bg-neutral-950 text-white'
                        : 'border-neutral-300 bg-white text-neutral-900 hover:border-neutral-950'
                    }`}
                  >
                    {isTranscribing ? (
                      <>
                        <Loader2
                          className="h-3.5 w-3.5 animate-spin"
                          aria-hidden="true"
                        />
                        <span>Transcribing...</span>
                      </>
                    ) : isRecording ? (
                      <>
                        <Square className="h-3 w-3 fill-current" aria-hidden="true" />
                        <span className="font-mono tabular-nums">
                          Stop ({formatTimer(recordingSeconds)})
                        </span>
                      </>
                    ) : (
                      <>
                        <Mic className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Speak Situation</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={onOpenLiveUpdates}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-900 underline underline-offset-4 hover:text-neutral-600 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <RefreshCw className="h-3 w-3" aria-hidden="true" />
                    <span>Live Student Updates</span>
                  </button>

                  <button
                    type="button"
                    onClick={onBrowseDirectory}
                    className="text-xs font-medium text-neutral-600 underline underline-offset-4 hover:text-neutral-950 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    All 11 portals
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={!situationText.trim() || isAnalyzing}
                  className="inline-flex w-full items-center justify-center gap-2 bg-neutral-950 px-5 py-2.5 text-xs font-medium text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:bg-neutral-300 disabled:text-neutral-500 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-950 sm:w-auto"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2
                        className="h-3.5 w-3.5 animate-spin"
                        aria-hidden="true"
                      />
                      <span>Matching Official Portals...</span>
                    </>
                  ) : (
                    <>
                      <span>Find Eligible Opportunities</span>
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Quick Sample Scenarios */}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-neutral-500">
              <span className="font-medium text-neutral-700">Try a situation:</span>
              {SAMPLE_SITUATIONS.map((sample) => (
                <button
                  key={sample.label}
                  type="button"
                  onClick={() => {
                    onSituationChange(sample.text);
                    onSubmitSituation(sample.text);
                  }}
                  className="text-left text-neutral-700 underline decoration-neutral-300 underline-offset-4 transition-colors hover:text-neutral-950 hover:decoration-neutral-950 cursor-pointer"
                >
                  {sample.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Monochrome Editorial Architectural Plate */}
          <div className="flex flex-col lg:col-span-5">
            <figure className="flex flex-1 flex-col border border-neutral-200 bg-neutral-100">
              <div className="relative flex-1 min-h-[260px] overflow-hidden bg-neutral-900">
                {!imgFailed ? (
                  <img
                    src="/src/assets/images/monochrome_civic_columns_1795157443273.jpg"
                    alt="Monochrome colonnade of a public university and civic hall representing transparent access to Indian student portals"
                    referrerPolicy="no-referrer"
                    onError={() => setImgFailed(true)}
                    className="h-full w-full object-cover grayscale contrast-110"
                  />
                ) : (
                  <div className="flex h-full min-h-[260px] flex-col items-center justify-center bg-neutral-950 p-8 text-center text-white">
                    <span className="font-serif text-2xl">
                      CivicLedger India
                    </span>
                    <span className="mt-2 font-mono text-xs text-neutral-400">
                      NSP · AICTE · DigiLocker · PM-JAY · NCS
                    </span>
                  </div>
                )}
              </div>
              <figcaption className="border-t border-neutral-200 bg-white px-4 py-3 text-xs text-neutral-500">
                <span className="font-serif italic text-neutral-700">
                  Fig. 1 — Indian Student Access Desk.
                </span>{' '}
                Direct links to NSP, AICTE, NFSA, DigiLocker, PM-JAY, and MCA PM
                Internship portals.
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  );
};
