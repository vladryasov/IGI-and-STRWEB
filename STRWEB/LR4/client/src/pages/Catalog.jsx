import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config";

export function Catalog() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("createdAt");
  const [dir, setDir] = useState("desc");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const url = useMemo(() => {
    const u = new URL(`${API_URL}/api/pizzas`);
    if (q) u.searchParams.set("q", q);
    u.searchParams.set("sort", sort);
    u.searchParams.set("dir", dir);
    u.searchParams.set("available", "true");
    return u.toString();
  }, [q, sort, dir]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch(url)
      .then(r => r.json().then(data => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.message || "Failed to load catalog");
        if (!cancelled) setItems(data.items || []);
      })
      .catch(e => !cancelled && setError(e.message || "Failed to load catalog"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <div className="container">
      <div className="toolbar card">
        <div className="toolbar__row">
          <input
            className="input"
            placeholder="Поиск (name/description/tags)…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
          <select className="select" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="createdAt">По дате</option>
            <option value="basePrice">По цене</option>
            <option value="name">По названию</option>
          </select>
          <select className="select" value={dir} onChange={e => setDir(e.target.value)}>
            <option value="desc">DESC</option>
            <option value="asc">ASC</option>
          </select>
        </div>
        {loading ? <div className="muted">Загрузка…</div> : null}
        {error ? <div className="error">{error}</div> : null}
      </div>

      <div className="grid grid--cards">
        {items.map(p => (
          <Link to={`/pizza/${p._id}`} className="card card--pizza animate-in" key={p._id}>
            <div className="card__top">
              <h3 className="h3">{p.name}</h3>
              <span className="price">{Math.round(p.basePrice)} ₴</span>
            </div>
            <p className="muted">{p.description}</p>
            <div className="tags">
              {(p.tags || []).slice(0, 4).map(t => (
                <span className="tag" key={t}>
                  {t}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}



