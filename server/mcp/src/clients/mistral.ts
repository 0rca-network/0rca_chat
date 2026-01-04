import { Mistral } from "@mistralai/mistralai";

export function createMistralClient(): Mistral {
    const apiKey = process.env.MISTRAL_API_KEY;

    if (!apiKey) {
        throw new Error("Missing Mistral API Key in environment variables.");
    }

    return new Mistral({ apiKey });
}
