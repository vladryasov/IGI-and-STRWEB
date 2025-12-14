import React, { useContext, useEffect, useMemo, useState } from "react";
import { API_URL } from "../config";
import { AuthContext } from "../contexts/AuthContext";

// required by lab: arrow function component
export const MenuManager = () => {
  const { token, authHeaders } = useContext(AuthContext);
  const [mode, setMode] = useState("pizza"); // pizza | ingredient
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [form, setForm] = useState({ name: "", basePrice: 200, price: 10 });
  const [error, setError] = useState("");

  const listUrl = useMemo(() => {
    const base = mode === "pizza" ? `${API_URL}/api/pizzas` : `${API_URL}/api/ingredients`;
    const u = new URL(base);
    if (q) u.searchParams.set("q", q);
    u.searchParams.set("sort", "name");
    u.searchParams.set("dir", "asc");
    return u.toString();
  }, [mode, q]);

  const onMenuUpdate = next => {
    // required by lab: onMenuUpdate handler
    setItems(next);
  };

  useEffect(() => {
    fetch(listUrl)
      .then(r => r.json())
      .then(data => onMenuUpdate(data.items || []))
      .catch(() => {});
  }, [listUrl]);

  async function createItem() {
    setError("");
    if (!token) return setError("Нужна авторизация (JWT/Google OAuth).");
    if (!form.name.trim()) return setError("name обязателен");

    const url = mode === "pizza" ? `${API_URL}/api/pizzas` : `${API_URL}/api/ingredients`;
    const payload =
      mode === "pizza"
        ? { name: form.name, basePrice: Number(form.basePrice) || 0, description: "Создано в MenuManager", tags: ["manager"] }
        : { name: form.name, price: Number(form.price) || 0, isVeg: true };

    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) return setError(data.message || "Create failed");
    setForm({ ...form, name: "" });
    const refreshed = await fetch(listUrl).then(rr => rr.json());
    onMenuUpdate(refreshed.items || []);
  }

  // required by lab: onDeliveryAssign (demo handler)
  function onDeliveryAssign() {
    alert("Курьер назначен (demo). Реально назначение симулируется на сервере в процессе заказа.");
  }

  return (
    <div className="card">
      <div className="row row--space">
        <h3 className="h3">MenuManager</h3>
        <div className="row">
          <button className={mode === "pizza" ? "btn btn--primary" : "btn btn--ghost"} onClick={() => setMode("pizza")}>
            Пиццы
          </button>
          <button
            className={mode === "ingredient" ? "btn btn--primary" : "btn btn--ghost"}
            onClick={() => setMode("ingredient")}
          >
            Ингредиенты
          </button>
        </div>
      </div>

      <div className="toolbar__row">
        <input className="input" value={q} onChange={e => setQ(e.target.value)} placeholder="Поиск…" />
        <button className="btn btn--ghost" onClick={onDeliveryAssign}>
          onDeliveryAssign
        </button>
      </div>

      <div className="grid grid--2">
        <div>
          <div className="muted">Создать</div>
          <label className="label">
            Название
            <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          </label>
          {mode === "pizza" ? (
            <label className="label">
              basePrice
              <input
                className="input"
                type="number"
                value={form.basePrice}
                onChange={e => setForm({ ...form, basePrice: e.target.value })}
              />
            </label>
          ) : (
            <label className="label">
              price
              <input
                className="input"
                type="number"
                value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })}
              />
            </label>
          )}
          <button className="btn btn--primary" onClick={createItem}>
            Создать
          </button>
          {error ? <div className="error">{error}</div> : null}
        </div>

        <div>
          <div className="muted">Список</div>
          <ul className="list">
            {items.slice(0, 30).map(it => (
              <li key={it._id}>
                <span className="mono">{it._id}</span> — <b>{it.name}</b>{" "}
                {typeof it.basePrice === "number" ? <span className="muted">({it.basePrice} ₴)</span> : null}
                {typeof it.price === "number" ? <span className="muted">(+{it.price})</span> : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};



