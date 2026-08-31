const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-5";

type ExtractionResult = {
  arabic_text: string;
  malayalam_note: string;
};

export async function extractDhikrText(
  pdfBase64: string,
): Promise<ExtractionResult> {
  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      tools: [
        {
          name: "record_transcription",
          description:
            "Record the transcribed Arabic dhikr/dua text and any Malayalam context note found on the page.",
          input_schema: {
            type: "object",
            properties: {
              arabic_text: {
                type: "string",
                description:
                  "The full Arabic text of the dhikr/dua exactly as printed, with correct diacritics (tashkeel).",
              },
              malayalam_note: {
                type: "string",
                description:
                  "Any Malayalam explanatory note, translation, or context printed alongside the Arabic text. Empty string if none is present.",
              },
            },
            required: ["arabic_text", "malayalam_note"],
          },
        },
      ],
      tool_choice: { type: "tool", name: "record_transcription" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "document",
              source: {
                type: "base64",
                media_type: "application/pdf",
                data: pdfBase64,
              },
            },
            {
              type: "text",
              text: "This is a page from a Malayalam/Arabic Islamic devotional book. Transcribe the Arabic dhikr/dua text exactly as printed, and separately transcribe any Malayalam note printed alongside it. Read only what is visually printed on the page — do not rely on any embedded text layer in the PDF, since this source file's text layer is corrupted (duplicated/overlapping text runs).",
            },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Anthropic API error ${res.status}: ${body}`);
  }

  const data = await res.json();
  const toolUse = data.content?.find(
    (block: { type: string }) => block.type === "tool_use",
  );

  if (!toolUse) {
    throw new Error("Claude did not return a transcription");
  }

  return toolUse.input as ExtractionResult;
}
