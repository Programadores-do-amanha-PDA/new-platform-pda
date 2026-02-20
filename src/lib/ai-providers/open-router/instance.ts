import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const openRouter = createOpenRouter({
    apiKey: process.env.NEXT_PUBLIC_OPEN_ROUTER_API_KEY!,
});
