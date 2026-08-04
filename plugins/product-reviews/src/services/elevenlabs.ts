import { MedusaError } from '@medusajs/framework/utils';
import https from 'node:https';

const ELEVENLABS_TIMEOUT_MS = 120_000;

function wrapNetworkError(error: unknown): never {
  const err = error instanceof Error ? error : new Error(String(error));
  const detail = err.message;

  if (
    detail.includes('Connect Timeout') ||
    detail.includes('UND_ERR_CONNECT_TIMEOUT') ||
    detail.includes('ENOTFOUND') ||
    detail.includes('ECONNREFUSED') ||
    detail.includes('ETIMEDOUT') ||
    detail.includes('timed out') ||
    detail.includes('fetch failed')
  ) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      `Cannot reach ElevenLabs API (${detail}). Check internet/VPN/firewall and try: curl -I https://api.elevenlabs.io`,
    );
  }

  throw err;
}

function postJson(url: string, apiKey: string, body: Record<string, string>): Promise<Buffer> {
  const payload = JSON.stringify(body);

  return new Promise((resolve, reject) => {
    const parsed = new URL(url);

    const req = https.request(
      {
        hostname: parsed.hostname,
        path: `${parsed.pathname}${parsed.search}`,
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
          Accept: 'audio/mpeg',
          'Content-Length': Buffer.byteLength(payload),
        },
        timeout: ELEVENLABS_TIMEOUT_MS,
      },
      (res) => {
        const chunks: Buffer[] = [];

        res.on('data', (chunk: Buffer) => chunks.push(chunk));
        res.on('end', () => {
          const responseBody = Buffer.concat(chunks);

          if (res.statusCode && res.statusCode >= 400) {
            reject(
              new MedusaError(
                MedusaError.Types.UNEXPECTED_STATE,
                `ElevenLabs TTS failed (${res.statusCode}): ${responseBody.toString('utf8')}`,
              ),
            );
            return;
          }

          resolve(responseBody);
        });
      },
    );

    req.on('timeout', () => {
      req.destroy(
        new Error(`ElevenLabs request timed out after ${ELEVENLABS_TIMEOUT_MS / 1000}s`),
      );
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

export class ElevenLabsService {
  constructor(private readonly apiKey: string) {
    if (!apiKey?.trim()) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        'ElevenLabs API key is not configured',
      );
    }
  }

  async textToSpeech(text: string, voiceId: string): Promise<Buffer> {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;

    try {
      return await postJson(url, this.apiKey.trim(), {
        text,
        model_id: 'eleven_multilingual_v2',
      });
    } catch (error) {
      if (error instanceof MedusaError) {
        throw error;
      }
      wrapNetworkError(error);
    }
  }
}
