import { OpenAI } from "openai";
import vision from "@google-cloud/vision";

const INGREDIENT_SYNONYMS = [
  { name: "Mozzarella", keys: ["mozzarella", "cheese"] },
  { name: "Tomato sauce", keys: ["tomato", "sauce", "ketchup", "marinara"] },
  { name: "Basil", keys: ["basil", "herb"] },
  { name: "Pepperoni", keys: ["pepperoni", "salami"] },
  { name: "Mushrooms", keys: ["mushroom", "fungus"] },
  { name: "Olives", keys: ["olive"] },
  { name: "Ham", keys: ["ham"] },
  { name: "Pineapple", keys: ["pineapple"] },
  { name: "Parmesan", keys: ["parmesan"] },
  { name: "Chili", keys: ["chili", "pepper"] }
];

function mapLabelsToIngredients(labels) {
  const norm = labels.map(l => String(l).toLowerCase());
  const found = new Set();
  for (const n of norm) {
    for (const syn of INGREDIENT_SYNONYMS) {
      if (syn.keys.some(k => n.includes(k))) found.add(syn.name);
    }
  }
  return [...found];
}

export async function visionIngredients(req, res) {
  if (!req.file?.buffer) return res.status(400).json({ message: "Upload image as form-data field 'image'" });

  // Requires GOOGLE_APPLICATION_CREDENTIALS pointing to a service account json
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return res.status(500).json({
      message:
        "Google Vision is not configured. Set GOOGLE_APPLICATION_CREDENTIALS to an absolute path of service-account JSON."
    });
  }

  try {
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.labelDetection({ image: { content: req.file.buffer } });
    const labels = (result.labelAnnotations || []).map(l => l.description).filter(Boolean);
    const ingredients = mapLabelsToIngredients(labels);
    return res.json({ labels, ingredients });
  } catch (e) {
    return res.status(500).json({
      message: "Google Vision error (check service-account credentials).",
      details: e?.message || String(e)
    });
  }
}

export async function openaiRecipe(req, res) {
  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ message: "Missing OPENAI_API_KEY" });
  }
  const { ingredients = [], style = "italian" } = req.body || {};
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return res.status(400).json({ message: "ingredients[] required" });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = `Ты шеф-повар. Сгенерируй рецепт пиццы в стиле "${style}".
Ингредиенты (используй максимально): ${ingredients.join(", ")}.
Ответ дай по структуре:
1) Название
2) Краткое описание
3) Ингредиенты (список)
4) Шаги приготовления (7-10 шагов)
5) Советы/вариации`;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7
  });

  const text = completion.choices?.[0]?.message?.content || "";
  res.json({ text });
}


