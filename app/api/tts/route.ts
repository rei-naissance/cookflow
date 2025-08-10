import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const model = "playai-tts";
const voice = "Fritz-PlayAI";
const responseFormat = "wav";

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const response = await groq.audio.speech.create({
      model,
      voice,
      input: text,
      response_format: responseFormat
    });

    const audioData = await response.arrayBuffer();
    
    return new NextResponse(audioData, {
      status: 200,
      headers: {
        'Content-Type': 'audio/wav',
      },
    });
  } catch (error) {
    console.error('TTS error:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
