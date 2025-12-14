import React, { useContext, useState } from "react";
import { API_URL } from "../config";
import { AuthContext } from "../contexts/AuthContext";

export function AiPanel() {
  const { token, authHeaders } = useContext(AuthContext);
  const [name, setName] = useState("");
  const [recipe, setRecipe] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function generateRecipe() {
    setError("");
    setRecipe("");
    if (!token) return setError("Нужен логин для AI эндпоинтов.");
    if (!name.trim()) return setError("Введи название пиццы.");
    setLoading(true);
    try {
      const r = await fetch(`${API_URL}/api/ai/poe/recipe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ name: name.trim() })
      });
      const data = await r.json();
      if (!r.ok) return setError(data.message || "Poe error");
      setRecipe(data.text || "");
    } catch (e) {
      setError(e?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h3 className="h3">AI панель</h3>
      <div className="muted">Poe: введи название пиццы — получи рецепт.</div>

      <div className="divider" />

      <label className="label">
        Название пиццы
        <input
          className="input"
          type="text"
          placeholder="Например: Пицца 4 сыра"
          value={name}
          onChange={e => setName(e.target.value)}
        />
      </label>
      <div className="row">
        <button className="btn btn--primary" onClick={generateRecipe} disabled={loading}>
          {loading ? "Генерирую..." : "Сделать рецепт"}
        </button>
      </div>

      {error ? <div className="error">{error}</div> : null}

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



