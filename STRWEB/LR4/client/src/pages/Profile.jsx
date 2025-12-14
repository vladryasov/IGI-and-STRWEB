import React, { useContext, useEffect, useMemo, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { API_URL } from "../config";
import { OrderTracker } from "../components/OrderTracker";
import { MenuManager } from "../components/MenuManager";
import { AiPanel } from "../components/AiPanel";

export function Profile() {
  const { token, user, login, register, logout, loading, error, authHeaders, fetchMe } = useContext(AuthContext);
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [orders, setOrders] = useState([]);
  const [trackId, setTrackId] = useState("");
  const [trackEvents, setTrackEvents] = useState([]);

  const ordersUrl = useMemo(() => `${API_URL}/api/orders?sort=createdAt&dir=desc`, []);

  useEffect(() => {
    if (!token) return;
    fetchMe();
    
    const loadOrders = () => {
      fetch(ordersUrl, { headers: { ...authHeaders, "X-Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone } })
        .then(r => r.json())
        .then(d => setOrders(d.items || []))
        .catch(() => {});
    };
    
    loadOrders();
    
    // Автоматическое обновление списка заказов каждые 3 секунды
    const intervalId = setInterval(loadOrders, 3000);
    
    return () => clearInterval(intervalId);
  }, [token, authHeaders, ordersUrl, fetchMe]);

  function onOrderTrack(data) {
    // required by lab: onOrderTrack event handler
    setTrackEvents(prev => [{ at: new Date().toISOString(), data }, ...prev].slice(0, 10));
    
    // Обновляем статус заказа в списке "Мои заказы"
    if (data.orderId && data.status) {
      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === data.orderId ? { ...order, status: data.status, updatedAtView: data.updatedAtView } : order
        )
      );
    }
  }

  async function submit() {
    if (!form.email.includes("@")) return alert("Email некорректен");
    if (form.password.length < 6) return alert("Пароль минимум 6 символов");
    if (mode === "register" && form.name.trim().length < 2) return alert("Имя минимум 2 символа");

    if (mode === "login") await login({ email: form.email, password: form.password });
    else await register({ name: form.name, email: form.email, password: form.password });
  }

  return (
    <div className="container">
      <div className="grid grid--2">
        <div className="card">
          <div className="row row--space">
            <h2 className="h2">Личный кабинет</h2>
            {token ? (
              <button className="btn btn--ghost" onClick={logout}>
                Выйти
              </button>
            ) : null}
          </div>

          {!token ? (
            <>
              <div className="row">
                <button className={mode === "login" ? "btn btn--primary" : "btn btn--ghost"} onClick={() => setMode("login")}>
                  Вход
                </button>
                <button
                  className={mode === "register" ? "btn btn--primary" : "btn btn--ghost"}
                  onClick={() => setMode("register")}
                >
                  Регистрация
                </button>
              </div>

              {mode === "register" ? (
                <label className="label">
                  Имя
                  <input className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </label>
              ) : null}
              <label className="label">
                Email
                <input className="input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </label>
              <label className="label">
                Пароль
                <input
                  className="input"
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                />
              </label>

              <button className="btn btn--primary" onClick={submit} disabled={loading}>
                {mode === "login" ? "Войти" : "Создать аккаунт"}
              </button>
              {error ? <div className="error">{error}</div> : null}
            </>
          ) : (
            <>
              <div className="muted">Вы вошли как:</div>
              <div>
                <b>{user?.name || "—"}</b> <span className="muted">({user?.email || "—"})</span>
              </div>
              <div className="divider" />
              <div className="muted">Мои заказы:</div>
              <ul className="list">
                {orders.slice(0, 10).map(o => (
                  <li key={o._id}>
                    <button className="btn btn--ghost" onClick={() => setTrackId(o._id)}>
                      Track
                    </button>{" "}
                    <span className="mono">{o._id}</span> — <b>{o.status}</b>{" "}
                    <span className="muted">
                      {o.createdAtView?.local} (UTC {o.createdAtView?.utc})
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        <div>
          <OrderTracker orderId={trackId} token={token} autoStart={false} onOrderTrack={onOrderTrack} />
          {trackEvents.length ? (
            <div className="card">
              <div className="muted">События трекинга (последние 10):</div>
              <ul className="list">
                {trackEvents.map((e, idx) => (
                  <li key={idx}>
                    <span className="mono">{e.at}</span> — {e.data.status}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <MenuManager />
      <AiPanel />
    </div>
  );
}


