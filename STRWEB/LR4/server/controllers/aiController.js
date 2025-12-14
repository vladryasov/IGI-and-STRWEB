const DEFAULT_BOT = process.env.POE_BOT_NAME || "gpt-4o-mini";
const POE_API_URL = process.env.POE_API_URL || "https://api.poe.com/v1";

export async function poeRecipe(req, res) {
  if (!process.env.POE_API_KEY) {
    return res.status(500).json({ message: "Missing POE_API_KEY" });
  }

  const { name } = req.body || {};
  if (!name || typeof name !== "string") {
    return res.status(400).json({ message: "name (string) is required" });
  }

  const prompt = `Ты шеф-повар. Сгенерируй подробный рецепт пиццы "${name}".
Ответ строго по структуре:
1) Название
2) Краткое описание (2-3 предложения)
3) Ингредиенты (список с количеством)
4) Шаги приготовления (7-10 шагов)
5) Советы/вариации`;

  let poeResponse;
  try {
    poeResponse = await fetch(`${POE_API_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.POE_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: DEFAULT_BOT,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        stream: false
      })
    });
  } catch (e) {
    return res.status(502).json({ 
      message: "Poe request failed", 
      error: e?.message || String(e) 
    });
  }

  const responseText = await poeResponse.text();
  let data;
  try {
    data = JSON.parse(responseText);
  } catch (e) {
    return res.status(502).json({ 
      message: "Poe response parse error",
      error: e?.message || String(e),
      response: responseText.substring(0, 500)
    });
  }

  if (!poeResponse.ok) {
    return res.status(502).json({ 
      message: "Poe error",
      status: poeResponse.status,
      statusText: poeResponse.statusText,
      error: data?.error || responseText
    });
  }

  // Извлекаем текст из OpenAI-совместимого ответа
  let text = "";
  if (data?.choices && Array.isArray(data.choices) && data.choices.length > 0) {
    text = data.choices[0]?.message?.content || "";
  } else if (data?.content) {
    text = data.content;
  } else if (typeof data === "string") {
    text = data;
  }

  if (!text) {
    return res.status(502).json({ 
      message: "Poe response format error",
      response: data
    });
  }

  return res.json({ text });
}


