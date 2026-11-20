import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { OFFICIAL_SERVICES } from '../src/data/officialServices';
import { rankServicesDeterministic } from '../src/lib/eligibility';
import type {
  GroundedAnswerResponse,
  GroundingSourceLink,
  LatestOpportunityItem,
  LatestUpdatesResponse,
  OfficialService,
  SituationAnalysisResponse,
  TranslatedGuidePayload,
} from '../src/types/civic';

function extractReadableError(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  try {
    const parsed = JSON.parse(raw);
    if (parsed?.error?.message) {
      return String(parsed.error.message);
    }
  } catch {
    // Not raw JSON
  }
  return raw;
}

async function withRetry<T>(fn: () => Promise<T>, maxAttempts = 3): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const msg = extractReadableError(err).toLowerCase();
      const isTransient =
        msg.includes('503') ||
        msg.includes('unavailable') ||
        msg.includes('high demand') ||
        msg.includes('429') ||
        msg.includes('rate');
      if (!isTransient || attempt === maxAttempts) {
        throw new Error(extractReadableError(err));
      }
      await new Promise((r) => setTimeout(r, 450 * attempt));
    }
  }
  throw new Error(extractReadableError(lastError));
}

function createGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please add your Gemini API key in Settings > Secrets.'
    );
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function formatCatalogForGrounding(services: OfficialService[]): string {
  return services
    .map((svc) => {
      const rules = svc.eligibilityRules
        .map(
          (r) =>
            `  - [${r.ruleId}] (${r.required ? 'Required' : 'Optional'}) ${r.label}: ${r.description}`
        )
        .join('\n');
      const docs = svc.requiredDocuments
        .map((d) => `  - ${d.name} (${d.acceptedProofs})`)
        .join('\n');
      return [
        `SERVICE_ID: ${svc.id}`,
        `DOC_CODE: ${svc.docCode}`,
        `TITLE: ${svc.title}`,
        `CATEGORY: ${svc.category}`,
        `AUTHORITY: ${svc.issuingAuthority}`,
        `BENEFIT: ${svc.benefitEstimate}`,
        `OFFICIAL_POLICY_EXCERPT: ${svc.officialExcerpt}`,
        `ELIGIBILITY_RULES:\n${rules}`,
        `REQUIRED_DOCUMENTS:\n${docs}`,
      ].join('\n');
    })
    .join('\n\n---\n\n');
}

export async function analyzeSituationWithGemini(
  situation: string,
  targetLanguage: string
): Promise<SituationAnalysisResponse> {
  const ai = createGeminiClient();

  // Compute deterministic rule baseline to supply high-signal candidate context
  const baselineMatches = rankServicesDeterministic(situation, OFFICIAL_SERVICES, 6);
  const catalogContext = formatCatalogForGrounding(OFFICIAL_SERVICES);

  const systemInstruction = `You are CivicLedger India's Public Services & Student Opportunities Navigator.
Your sole purpose is to help Indian students—especially those unfamiliar with government portals—discover relevant scholarships, food/hostel benefits, official certificates (DigiLocker / e-District / ABC ID), Ayushman Bharat PM-JAY healthcare, and employment/internship programs.

STRICT GROUNDING RULES:
1. Only recommend services from the VERIFIED OFFICIAL CORPUS below. Never invent program IDs, docCodes, or eligibility rules.
2. Every rule evaluation must reference an exact ruleId and docCode from the corpus.
3. Explain eligibility in warm, plain, jargon-free language translated completely into the requested target language: ${targetLanguage}. Use Indian currency units (₹ / Lakhs) where applicable.
4. If the student's description leaves an eligibility requirement uncertain (e.g., family income in ₹ lakh, category SC/ST/OBC/EWS, or Class 12 percentile), mark that rule as "Verify" and explain clearly how to check it rather than rejecting them.
5. Provide 2 to 3 concise follow-up questions in ${targetLanguage} that could uncover extra Indian student schemes or confirm eligibility.
6. Return 2 to 6 best-matching services sorted by relevance and likelihood of eligibility.

Deterministic signal baseline for reference (verify semantically against the full corpus):
${JSON.stringify(
  baselineMatches.map((m) => ({
    serviceId: m.serviceId,
    baselineStatus: m.eligibilityStatus,
    baselineScore: m.confidenceScore,
  }))
)}

VERIFIED OFFICIAL CORPUS:
${catalogContext}`;

  const response = await withRetry(() =>
    ai.models.generateContent({
      model: 'gemini-4-hydrogen',
    contents: `User's described situation: "${situation}"\nTarget output language: ${targetLanguage}`,
    config: {
      systemInstruction,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          situationSummary: {
            type: Type.STRING,
            description: `Plain-language 1-2 sentence summary of the user's situation written in ${targetLanguage}.`,
          },
          detectedLanguage: {
            type: Type.STRING,
            description: 'Name of the language the user wrote or spoke in.',
          },
          followUpQuestions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: `2-3 short clarifying questions in ${targetLanguage}.`,
          },
          matches: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                serviceId: {
                  type: Type.STRING,
                  description: 'Exact SERVICE_ID from the Verified Official Corpus.',
                },
                eligibilityStatus: {
                  type: Type.STRING,
                  description:
                    'Must be exactly one of: "Likely Eligible", "Check Criteria", or "Informational".',
                },
                confidenceScore: {
                  type: Type.INTEGER,
                  description: 'Match score from 1 to 100.',
                },
                plainLanguageReason: {
                  type: Type.STRING,
                  description: `2-3 sentence plain-language explanation in ${targetLanguage} of why this service applies to the user.`,
                },
                ruleEvaluations: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      ruleId: { type: Type.STRING },
                      label: { type: Type.STRING },
                      status: {
                        type: Type.STRING,
                        description: 'Must be "Met", "Verify", or "Context Needed".',
                      },
                      explanation: { type: Type.STRING },
                      docCode: { type: Type.STRING },
                    },
                    required: ['ruleId', 'label', 'status', 'explanation', 'docCode'],
                  },
                },
                customizedChecklistNote: {
                  type: Type.STRING,
                  description: `Practical document tip in ${targetLanguage} tailored to the user's situation.`,
                },
                groundedCitationQuote: {
                  type: Type.STRING,
                  description: 'Relevant sentence from OFFICIAL_POLICY_EXCERPT supporting this match.',
                },
              },
              required: [
                'serviceId',
                'eligibilityStatus',
                'confidenceScore',
                'plainLanguageReason',
                'ruleEvaluations',
                'customizedChecklistNote',
                'groundedCitationQuote',
              ],
            },
          },
        },
        required: [
          'situationSummary',
          'detectedLanguage',
          'followUpQuestions',
          'matches',
        ],
      },
    },
    })
  );

  const rawText = response.text;
  if (!rawText) {
    throw new Error('Gemini returned an empty response while analyzing the situation.');
  }

  const parsed = JSON.parse(rawText) as SituationAnalysisResponse;

  // Ensure every matched serviceId exists in our verified corpus
  const validIds = new Set(OFFICIAL_SERVICES.map((s) => s.id));
  parsed.matches = (parsed.matches || []).filter((m) => validIds.has(m.serviceId));

  return parsed;
}

export async function translateServiceGuideWithGemini(
  service: OfficialService,
  targetLanguage: string
): Promise<TranslatedGuidePayload> {
  const ai = createGeminiClient();

  const response = await withRetry(() =>
    ai.models.generateContent({
      model: 'gemini-4-hydrogen',
    contents: `Translate the following verified official public service guide accurately into ${targetLanguage}. Preserve all ruleId, id, and stepNumber identifiers unchanged. Use clear, respectful, accessible everyday ${targetLanguage} suitable for citizens unfamiliar with bureaucratic terminology.

SOURCE GUIDE JSON:
${JSON.stringify({
  serviceId: service.id,
  title: service.title,
  summary: service.summary,
  benefitEstimate: service.benefitEstimate,
  deadline: service.deadline,
  eligibilityRules: service.eligibilityRules.map((r) => ({
    ruleId: r.ruleId,
    label: r.label,
    description: r.description,
  })),
  requiredDocuments: service.requiredDocuments.map((d) => ({
    id: d.id,
    name: d.name,
    acceptedProofs: d.acceptedProofs,
    whereToObtain: d.whereToObtain,
    processingTime: d.processingTime,
  })),
  applicationSteps: service.applicationSteps,
})}`,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          serviceId: { type: Type.STRING },
          targetLanguage: { type: Type.STRING },
          title: { type: Type.STRING },
          summary: { type: Type.STRING },
          benefitEstimate: { type: Type.STRING },
          deadline: { type: Type.STRING },
          eligibilityRules: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                ruleId: { type: Type.STRING },
                label: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: ['ruleId', 'label', 'description'],
            },
          },
          requiredDocuments: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                acceptedProofs: { type: Type.STRING },
                whereToObtain: { type: Type.STRING },
                processingTime: { type: Type.STRING },
              },
              required: [
                'id',
                'name',
                'acceptedProofs',
                'whereToObtain',
                'processingTime',
              ],
            },
          },
          applicationSteps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                stepNumber: { type: Type.INTEGER },
                title: { type: Type.STRING },
                instruction: { type: Type.STRING },
                portalActionLabel: { type: Type.STRING },
                pitfallWarning: { type: Type.STRING },
              },
              required: [
                'stepNumber',
                'title',
                'instruction',
                'portalActionLabel',
                'pitfallWarning',
              ],
            },
          },
        },
        required: [
          'serviceId',
          'targetLanguage',
          'title',
          'summary',
          'benefitEstimate',
          'deadline',
          'eligibilityRules',
          'requiredDocuments',
          'applicationSteps',
        ],
      },
    },
    })
  );

  if (!response.text) {
    throw new Error('Empty translation response from Gemini.');
  }

  return JSON.parse(response.text) as TranslatedGuidePayload;
}

export async function askGroundedQuestionWithGemini(
  service: OfficialService,
  question: string,
  language: string,
  situationContext?: string
): Promise<GroundedAnswerResponse> {
  const ai = createGeminiClient();

  const response = await withRetry(() =>
    ai.models.generateContent({
      model: 'gemini-4-hydrogen',
    contents: `OFFICIAL DOCUMENT RECORD:
${JSON.stringify(service)}

USER SITUATION CONTEXT: ${situationContext || 'Not provided'}
USER QUESTION: ${question}
REQUIRED RESPONSE LANGUAGE: ${language}`,
    config: {
      systemInstruction: `Answer the user's question about "${service.title}" strictly using the provided OFFICIAL DOCUMENT RECORD.
Never invent fees, deadlines, or legal exemptions not grounded in the document. If a detail varies by state or county, state that clearly and explain which official office confirms it. Respond in ${language}.`,
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          answer: {
            type: Type.STRING,
            description: `Clear, direct answer in ${language} grounded in the official document.`,
          },
          citedDocCode: {
            type: Type.STRING,
            description: `Exact document code, e.g. ${service.docCode}.`,
          },
          citedSection: {
            type: Type.STRING,
            description: 'Specific rule label, document name, or step number cited.',
          },
          nextAction: {
            type: Type.STRING,
            description: `Concrete single next step the user should take in ${language}.`,
          },
        },
        required: ['answer', 'citedDocCode', 'citedSection', 'nextAction'],
      },
    },
    })
  );

  if (!response.text) {
    throw new Error('Empty Q&A response from Gemini.');
  }

  return JSON.parse(response.text) as GroundedAnswerResponse;
}

export async function transcribeAudioWithGemini(
  audioBase64: string,
  mimeType: string
): Promise<{ transcript: string }> {
  const ai = createGeminiClient();

  const response = await withRetry(() =>
    ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
    contents: {
      parts: [
        {
          inlineData: {
            mimeType,
            data: audioBase64,
          },
        },
        {
          text: 'Transcribe this spoken description accurately in the speaker’s original language. Output only the clean transcript text.',
        },
      ],
    },
    })
  );

  const transcript = (response.text ?? '').trim();
  if (!transcript) {
    throw new Error('Could not transcribe any speech from the recording.');
  }
  return { transcript };
}

export async function generateSpeechWithGemini(
  text: string
): Promise<{ audioBase64: string; mimeType: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error(
      'GEMINI_API_KEY is not configured. Please add your Gemini API key in Settings > Secrets.'
    );
  }

  const promptText = `Read clearly in a calm, reassuring public service navigator tone: ${text}`;

  const tryGenerate = async (apiVersion: string | undefined, includeSpeechConfig: boolean) => {
    const client = new GoogleGenAI({
      apiKey,
      ...(apiVersion ? { apiVersion } : {}),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const response = await withRetry(() =>
      client.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [{ text: promptText }],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          ...(includeSpeechConfig
            ? {
                speechConfig: {
                  voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                  },
                },
              }
            : {}),
        },
      })
    );

    const base64Audio =
      response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      throw new Error('No audio data was returned by Gemini TTS.');
    }
    return {
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    };
  };

  try {
    return await tryGenerate('v1alpha', true);
  } catch (err) {
    const msg = extractReadableError(err);
    if (msg.includes('Unknown name') || msg.includes('Cannot find field')) {
      return await tryGenerate('v1beta', false);
    }
    throw new Error(msg);
  }
}

function decodeXmlEntities(input: string): string {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .trim();
}

interface LiveNewsItem {
  title: string;
  uri: string;
  pubDate: string;
  sourceName: string;
}

let searchGroundingQuotaExhaustedUntil = 0;

async function fetchSingleRssQuery(rssQuery: string): Promise<LiveNewsItem[]> {
  const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(
    rssQuery
  )}&hl=en-IN&gl=IN&ceid=IN:en`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(rssUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'CivicLedger-Student-Navigator/1.0',
      },
    });
    if (!res.ok) {
      throw new Error(`Live web search feed returned HTTP ${res.status}`);
    }
    const xml = await res.text();
    const items: LiveNewsItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match: RegExpExecArray | null;
    while ((match = itemRegex.exec(xml)) !== null && items.length < 8) {
      const block = match[1];
      const titleMatch = block.match(/<title>([\s\S]*?)<\/title>/);
      const linkMatch = block.match(/<link>([\s\S]*?)<\/link>/);
      const pubDateMatch = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/);
      const sourceMatch = block.match(/<source[^>]*>([\s\S]*?)<\/source>/);

      const title = titleMatch ? decodeXmlEntities(titleMatch[1]) : '';
      const uri = linkMatch ? decodeXmlEntities(linkMatch[1]) : '';
      const pubDate = pubDateMatch ? decodeXmlEntities(pubDateMatch[1]) : '';
      const sourceName = sourceMatch ? decodeXmlEntities(sourceMatch[1]) : 'Web Source';

      if (title && uri) {
        items.push({ title, uri, pubDate, sourceName });
      }
    }
    return items;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchLiveIndianNewsItems(query: string): Promise<LiveNewsItem[]> {
  const normalized = query.toLowerCase();
  const isBroadAllQuery =
    normalized.includes('all indian student') ||
    (normalized.includes('scholarships') &&
      normalized.includes('digilocker') &&
      normalized.includes('internship'));

  const queriesToRun = isBroadAllQuery
    ? [
        '(NSP OR AICTE OR "PM Internship" OR scholarship) India student',
        '(Ayushman OR DigiLocker OR APAAR OR "One Nation One Ration") India',
      ]
    : [
        (() => {
          const cleaned = query
            .replace(/https?:\/\/\S+/g, ' ')
            .replace(/[(),/:]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ')
            .slice(0, 8)
            .join(' ');
          return cleaned.toLowerCase().includes('india')
            ? cleaned
            : `${cleaned} India`;
        })(),
      ];

  const settled = await Promise.allSettled(
    queriesToRun.map((q) => fetchSingleRssQuery(q))
  );
  const combined: LiveNewsItem[] = [];
  const seen = new Set<string>();
  for (const result of settled) {
    if (result.status === 'fulfilled') {
      for (const item of result.value) {
        if (!seen.has(item.title)) {
          seen.add(item.title);
          combined.push(item);
        }
      }
    }
  }
  return combined.slice(0, 12);
}

export async function fetchLatestIndianStudentUpdates(
  focusQuery: string,
  targetLanguage: string
): Promise<LatestUpdatesResponse> {
  const ai = createGeminiClient();
  const cleanFocus =
    focusQuery.trim() ||
    'All Indian student scholarships NSP AICTE, NFSA food ration benefits, DigiLocker certificates, Ayushman PM-JAY healthcare, and PM Internship NCS jobs';

  const portalDirectorySummary = OFFICIAL_SERVICES.map(
    (s) => `- ${s.title} | Category: ${s.category} | URL: ${s.officialUrl} | Domain: ${s.portalDomain}`
  ).join('\n');

  const searchPrompt = `Search the web for the latest official developments, open application windows, extensions, and portal announcements in India for: ${cleanFocus}.
Focus strictly on verified Indian student opportunities across:
- Scholarships (NSP scholarships.gov.in, PM-USP, AICTE Pragati/Saksham, UGC, State Scholarship portals, Vidya Lakshmi)
- Benefits & Food (NFSA One Nation One Ration Card, myScheme student/hostel benefits)
- Certificates & ID (DigiLocker, State e-District income/caste/domicile, ABC/APAAR ID)
- Healthcare (Ayushman Bharat PM-JAY)
- Employment & Aid (PM Internship Scheme pminternship.mca.gov.in, National Career Service ncs.gov.in, Skill India Digital Hub)

Write all human-readable descriptions in ${targetLanguage}.
Return ONLY valid JSON (no markdown fences) with this exact structure:
{
  "overviewNote": "2-sentence summary of the latest official updates found right now in ${targetLanguage}",
  "opportunities": [
    {
      "title": "Official scheme or latest update title",
      "category": "One of: Scholarships | Benefits & Food | Certificates & ID | Healthcare | Employment & Aid",
      "statusOrDeadline": "Latest deadline, cycle, or open status (e.g., Open 2026-27 Cycle / Closing Date)",
      "eligibilityHighlight": "Short who-can-apply summary in ${targetLanguage}",
      "summary": "1-2 sentence update on what is new or open right now in ${targetLanguage}",
      "portalName": "Official portal name (e.g., National Scholarship Portal)",
      "portalUrl": "Exact official https://... portal URL where the student can access or apply"
    }
  ]
}
Include 5 to 6 high-value, current opportunities with real official portal URLs.`;

  // Attempt 1: Gemini native Google Search grounding (skipped temporarily if key quota was exhausted)
  if (Date.now() > searchGroundingQuotaExhaustedUntil) {
    try {
      const response = await withRetry(
        () =>
          ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents: searchPrompt,
            config: {
              tools: [{ googleSearch: {} }],
              thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            },
          }),
        1
      );

      const rawText = (response.text ?? '').trim();
      if (rawText) {
        const fencedMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
        const candidateJson = fencedMatch ? fencedMatch[1].trim() : rawText;
        const firstBrace = candidateJson.indexOf('{');
        const lastBrace = candidateJson.lastIndexOf('}');
        const jsonString =
          firstBrace >= 0 && lastBrace > firstBrace
            ? candidateJson.slice(firstBrace, lastBrace + 1)
            : candidateJson;

        const parsed = JSON.parse(jsonString) as {
          overviewNote?: string;
          opportunities?: LatestOpportunityItem[];
        };

        const allowedCategories = new Set([
          'Scholarships',
          'Benefits & Food',
          'Certificates & ID',
          'Healthcare',
          'Employment & Aid',
        ]);

        const opportunities: LatestOpportunityItem[] = (parsed.opportunities ?? [])
          .filter((item) => item && item.title && item.portalUrl)
          .map((item) => ({
            title: String(item.title),
            category: allowedCategories.has(item.category)
              ? item.category
              : 'Scholarships',
            statusOrDeadline: String(item.statusOrDeadline || 'Check Official Portal'),
            eligibilityHighlight: String(item.eligibilityHighlight || ''),
            summary: String(item.summary || ''),
            portalName: String(item.portalName || 'Official Portal'),
            portalUrl: item.portalUrl.startsWith('http')
              ? item.portalUrl
              : `https://${item.portalUrl}`,
          }));

        const rawChunks =
          response.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [];
        const groundingSources: GroundingSourceLink[] = [];
        const seenUris = new Set<string>();
        for (const chunk of rawChunks) {
          const uri = chunk?.web?.uri;
          const title = chunk?.web?.title;
          if (uri && !seenUris.has(uri)) {
            seenUris.add(uri);
            groundingSources.push({
              title: title || uri,
              uri,
            });
          }
        }

        return {
          queryFocus: cleanFocus,
          language: targetLanguage,
          refreshedAt: new Date().toISOString(),
          overviewNote:
            parsed.overviewNote ||
            'Latest verified Indian student portals and announcements retrieved via live Gemini Search.',
          opportunities,
          groundingSources: groundingSources.slice(0, 8),
        };
      }
    } catch (err) {
      const msg = extractReadableError(err).toLowerCase();
      if (msg.includes('quota') || msg.includes('429')) {
        searchGroundingQuotaExhaustedUntil = Date.now() + 10 * 60 * 1000;
      }
      // Fall through to real-time web RSS retrieval + Gemini structured synthesis
    }
  }

  // Attempt 2: Live Google News India RSS retrieval + Gemini synthesis (works with standard Gemini API quota)
  const liveItems = await fetchLiveIndianNewsItems(cleanFocus);
  if (liveItems.length === 0) {
    throw new Error(
      'No live web articles were returned for this query right now. Try broadening your search terms or selecting a preset category.'
    );
  }

  const synthesisResponse = await withRetry(() =>
    ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `Focus topic: ${cleanFocus}
Target output language: ${targetLanguage}

LIVE_WEB_SEARCH_ITEMS (fetched just now from India news/web search):
${JSON.stringify(liveItems, null, 2)}

VERIFIED_INDIAN_STUDENT_PORTALS (for exact official access URLs):
${portalDirectorySummary}`,
      config: {
        systemInstruction: `You are CivicLedger India's Student Opportunities Curator.
Synthesize 5 to 6 current, actionable Indian student opportunities based strictly on the LIVE_WEB_SEARCH_ITEMS provided and link each one to its exact official Indian portal from VERIFIED_INDIAN_STUDENT_PORTALS (or another verified .gov.in / .nic.in / .org portal mentioned in the live items).
Write all human-readable fields ("overviewNote", "title", "statusOrDeadline", "eligibilityHighlight", "summary", "portalName") clearly in ${targetLanguage}.
In "statusOrDeadline", reflect the latest announcement/date/cycle from the live items (e.g., "Update · Sep/Oct 2026" or "Active 2026–27 Cycle").`,
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            overviewNote: { type: Type.STRING },
            opportunities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  category: { type: Type.STRING },
                  statusOrDeadline: { type: Type.STRING },
                  eligibilityHighlight: { type: Type.STRING },
                  summary: { type: Type.STRING },
                  portalName: { type: Type.STRING },
                  portalUrl: { type: Type.STRING },
                },
                required: [
                  'title',
                  'category',
                  'statusOrDeadline',
                  'eligibilityHighlight',
                  'summary',
                  'portalName',
                  'portalUrl',
                ],
              },
            },
          },
          required: ['overviewNote', 'opportunities'],
        },
      },
    })
  );

  if (!synthesisResponse.text) {
    throw new Error('Gemini returned an empty synthesis for live search results.');
  }

  const parsed = JSON.parse(synthesisResponse.text) as {
    overviewNote?: string;
    opportunities?: LatestOpportunityItem[];
  };

  const allowedCategories = new Set([
    'Scholarships',
    'Benefits & Food',
    'Certificates & ID',
    'Healthcare',
    'Employment & Aid',
  ]);

  const opportunities: LatestOpportunityItem[] = (parsed.opportunities ?? [])
    .filter((item) => item && item.title && item.portalUrl)
    .map((item) => ({
      title: String(item.title),
      category: allowedCategories.has(item.category)
        ? item.category
        : 'Scholarships',
      statusOrDeadline: String(item.statusOrDeadline || 'Check Official Portal'),
      eligibilityHighlight: String(item.eligibilityHighlight || ''),
      summary: String(item.summary || ''),
      portalName: String(item.portalName || 'Official Portal'),
      portalUrl: item.portalUrl.startsWith('http')
        ? item.portalUrl
        : `https://${item.portalUrl}`,
    }));

  const groundingSources: GroundingSourceLink[] = liveItems.slice(0, 8).map((item) => ({
    title: `${item.title} (${item.pubDate || item.sourceName})`,
    uri: item.uri,
  }));

  return {
    queryFocus: cleanFocus,
    language: targetLanguage,
    refreshedAt: new Date().toISOString(),
    overviewNote:
      parsed.overviewNote ||
      'Latest verified Indian student portals and announcements curated via live web search.',
    opportunities,
    groundingSources,
  };
}
