import { createMistral } from "@ai-sdk/mistral";

export function createMistralClient() {
    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
        throw new Error("Missing Mistral API Key in environment variables.");
    }

    return createMistral({
        apiKey,
    });
}
