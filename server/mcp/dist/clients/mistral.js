"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createMistralClient = createMistralClient;
const mistralai_1 = require("@mistralai/mistralai");
function createMistralClient() {
    const apiKey = process.env.MISTRAL_API_KEY;
    if (!apiKey) {
        throw new Error("Missing Mistral API Key in environment variables.");
    }
    return new mistralai_1.Mistral({ apiKey });
}
