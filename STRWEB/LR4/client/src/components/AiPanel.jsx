import React, { useContext, useState } from "react";
import { API_URL } from "../config";
import { AuthContext } from "../contexts/AuthContext";

export function AiPanel() {
  const { token, authHeaders } = useContext(AuthContext);
  const [file, setFile] = useState(null);
  const [vision, setVision] = useState(null);
  const [recipe, setRecipe] = useState("");
  const [error, setError] = useState("");

  async function analyzePhoto() {
    setError("");
    if (!token) return setError("Нужен логин для AI эндпоинтов.");
    if (!file) return setError("Выбери фото.");
    const fd = new FormData();
    fd.append("image", file);
    const r = await fetch(`${API_URL}/api/ai/vision/ingredients`, { method: "POST", headers: { ...authHeaders }, body: fd });
    const data = await r.json();
    if (!r.ok) return setError(data.message || "Vision error");
    setVision(data);
  }

  async function generateRecipe() {
    setError("");
    if (!token) return setError("Нужен логин для AI эндпоинтов.");
    const ingredients = vision?.ingredients || [];
    if (!ingredients.length) return setError("Сначала распознай ингредиенты (Vision).");
    const r = await fetch(`${API_URL}/api/ai/openai/recipe`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify({ ingredients, style: "italian" })
    });
    const data = await r.json();
    if (!r.ok) return setError(data.message || "OpenAI error");
    setRecipe(data.text || "");
  }

  return (
    <div className="card">
      <h3 className="h3">AI панель</h3>
      <div className="muted">Google Vision → ингредиенты, OpenAI → рецепт.</div>

      <div className="divider" />

      <label className="label">
        Фото ингредиентов
        <input className="input" type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
      </label>
      <div className="row">
        <button className="btn btn--primary" onClick={analyzePhoto}>
          Vision: анализ
        </button>
        <button className="btn btn--ghost" onClick={generateRecipe}>
          OpenAI: рецепт
        </button>
      </div>

      {error ? <div className="error">{error}</div> : null}

      {vision ? (
        <div style={{ marginTop: 12 }}>
          <div className="muted">Распознанные ингредиенты:</div>
          <div className="tags">
            {(vision.ingredients || []).map(x => (
              <span className="tag" key={x}>
                {x}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {recipe ? (
        <div style={{ marginTop: 12 }}>
          <div className="muted">Рецепт:</div>
          <pre className="card" style={{ whiteSpace: "pre-wrap", marginTop: 8 }}>
            {recipe}
          </pre>
        </div>
      ) : null}
    </div>
  );
}



