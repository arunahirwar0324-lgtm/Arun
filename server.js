import express from "express";
import archiver from "archiver";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

function getClient() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is missing. Put it in the .env file.");
  }
  return new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function generateOne(client, prompt, index, imageSize) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const interaction = await client.interactions.create({
        model: "gemini-3.1-flash-image",
        input: prompt,
        response_format: {
          type: "image",
          mime_type: "image/jpeg",
          aspect_ratio: "16:9",
          image_size: imageSize
        }
      });

      const image = interaction.output_image;
      if (!image?.data) throw new Error("No image returned by Gemini.");
      return {
        index,
        mime: image.mime_type || "image/jpeg",
        data: image.data
      };
    } catch (err) {
      lastError = err;
      if (attempt < 3) await sleep(1500 * attempt);
    }
  }
  throw lastError;
}

app.post("/api/generate", async (req, res) => {
  try {
    const { story, style, count = 50, imageSize = "2K" } = req.body;
    const n = Math.max(1, Math.min(50, Number(count)));

    if (!story?.trim()) return res.status(400).json({ error: "Story/topic is required." });

    const basePrompt = `
Create one original, clean, ultra-detailed 16:9 YouTube story illustration for a long-form Akbar-Birbal video.

Story/topic: ${story}

Visual style: ${style || "high-quality colorful 3D cartoon storybook illustration"}.

Requirements:
- Emperor Akbar and Birbal should look consistent from image to image.
- Historical Mughal/Indian palace setting, tasteful and family-friendly.
- Clear faces, expressive poses, sharp details, clean composition.
- Rich but natural colors, cinematic lighting, high detail.
- No watermark, no logo, no random text, no subtitles, no modern objects.
- 16:9 widescreen composition suitable for YouTube long videos.
- Generate a DIFFERENT scene/action/composition for each requested image while keeping character design consistent.
- Do not copy any existing artwork or living artist's exact style.
`;

    const client = getClient();
    const results = [];
    const concurrency = 3;
    let next = 0;

    async function worker() {
      while (true) {
        const i = next++;
        if (i >= n) return;
        const prompt = basePrompt + `\nThis is scene ${i + 1} of ${n}. Make this scene visually distinct from the other scenes.`;
        try {
          const item = await generateOne(client, prompt, i + 1, imageSize);
          results.push(item);
        } catch (e) {
          results.push({ index: i + 1, error: e.message || String(e) });
        }
      }
    }

    await Promise.all(Array.from({ length: concurrency }, worker));
    results.sort((a, b) => a.index - b.index);

    res.json({ results });
  } catch (e) {
    res.status(500).json({ error: e.message || String(e) });
  }
});

app.post("/api/zip", async (req, res) => {
  try {
    const { images = [] } = req.body;
    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", 'attachment; filename="akbar-birbal-images.zip"');

    const archive = archiver("zip", { zlib: { level: 6 } });
    archive.on("error", err => {
      if (!res.headersSent) res.status(500);
      res.end();
    });
    archive.pipe(res);

    for (const img of images) {
      if (!img?.data) continue;
      const buffer = Buffer.from(img.data, "base64");
      archive.append(buffer, { name: `akbar-birbal-${String(img.index).padStart(2, "0")}.jpg` });
    }
    await archive.finalize();
  } catch (e) {
    if (!res.headersSent) res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Akbar-Birbal Image Studio: http://localhost:${PORT}`);
});