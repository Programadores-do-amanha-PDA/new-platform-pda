
import { createGroq } from '@ai-sdk/groq';

export const groq = createGroq({
    apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY!,
});