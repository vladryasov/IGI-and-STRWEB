import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_URL } from "../config";
import { AuthContext } from "../contexts/AuthContext";
import { PizzaCustomizer } from "../components/PizzaCustomizer";
import { autoCancelAfter } from "../utils/autoCancel";

export function PizzaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, authHeaders } = useContext(AuthContext);
  const [pizza, setPizza] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");
  const [autoCancelInfo, setAutoCancelInfo] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const pizzaUrl = useMemo(() => `${API_URL}/api/pizzas/${id}`, [id]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError("");
    fetch(pizzaUrl)
      .then(r => r.json().then(data => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.message || "Failed to load pizza");
        if (!cancelled) setPizza(data.item);
      })
      .catch(e => !cancelled && setError(e.message || "Failed to load pizza"))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [pizzaUrl]);

  useEffect(() => {
    fetch(`${API_URL}/api/ingredients`)
      .then(r => r.json())
      .then(data => setIngredients(data.items || []))
      .catch(() => {});
  }, []);

  async function onPizzaBuild(built) {
    // event handler required by lab: onPizzaBuild
    if (!token) {
      alert("Нужен логин (или Google OAuth) для заказа.");
      return;
    }

    // async/await chain: create -> process -> then show id
    const createRes = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders, "X-Timezone": Intl.DateTimeFormat().resolvedOptions().timeZone },
      body: JSON.stringify({
        deliveryAddress: built.deliveryAddress,
        promoCode: built.promoCode || "",
        items: [
          {
            pizza: id,
            quantity: 1,
            size: built.size,
            extraIngredients: built.extraIngredientIds
          }
        ]
      })
    });
    const createData = await createRes.json();
    if (!createRes.ok) throw new Error(createData.message || "Create order failed");
    const createdId = createData.order._id;
    setOrderId(createdId);

    // UI setTimeout demo: auto-cancel after 2 minutes if you don't process (can be cancelled by processing)
    const t = autoCancelAfter(2 * 60 * 1000, async () => {
      try {
        await fetch(`${API_URL}/api/orders/${createdId}/cancel`, { method: "POST", headers: { ...authHeaders } });
      } catch {}
    });
    setAutoCancelInfo({ createdId, cancel: t.cancel, promise: t.promise });

    // process order (Promise/async-await demo)
    await fetch(`${API_URL}/api/orders/${createdId}/process`, { method: "POST", headers: { ...authHeaders } });
    t.cancel();
  }

  async function handleDelete() {
    if (!window.confirm("Вы уверены, что хотите удалить эту пиццу?")) return;

    setDeleting(true);
    try {
      const res = await fetch(`${API_URL}/api/pizzas/${id}`, {
        method: "DELETE",
        headers: { ...authHeaders }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      navigate("/catalog");
    } catch (e) {
      setError(e.message || "Delete failed");
      setDeleting(false);
    }
  }

  if (loading) return <div className="container muted">Загрузка…</div>;
  if (error && !pizza) return <div className="container error">{error}</div>;
  if (!pizza) return <div className="container muted">Пицца не найдена</div>;

  const imageUrl = pizza.imageUrl 
    ? (pizza.imageUrl.startsWith('data:') || pizza.imageUrl.startsWith('http')
        ? pizza.imageUrl 
        : `${API_URL}${pizza.imageUrl.startsWith('/') ? '' : '/'}${pizza.imageUrl}`)
    : null;

  return (
    <div className="container">
      <div className="card card--detail">
        {imageUrl && (
          <div className="detail__image">
            <img src={imageUrl} alt={pizza.name} />
          </div>
        )}
        <div className="detail__head">
          <div>
            <h2 className="h2">{pizza.name}</h2>
            <div className="muted">{pizza.description}</div>
          </div>
          <div>
            <div className="price price--big">{Math.round(pizza.basePrice)} ₴</div>
            {token && (
              <div className="row" style={{ marginTop: "12px", justifyContent: "flex-end" }}>
                <button className="btn btn--ghost" onClick={() => navigate(`/manage-pizza/${id}/edit`)}>
                  Редактировать
                </button>
                <button className="btn btn--ghost" onClick={handleDelete} disabled={deleting}>
                  {deleting ? "Удаление..." : "Удалить"}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="tags">
          {(pizza.tags || []).map(t => (
            <span className="tag" key={t}>
              {t}
            </span>
          ))}
        </div>
        <div className="muted">Базовые ингредиенты:</div>
        <ul className="list">
          {(pizza.ingredients || []).map(i => (
            <li key={i._id}>{i.name}</li>
          ))}
        </ul>
      </div>

      {error && <div className="card error">{error}</div>}

      <PizzaCustomizer
        basePizza={pizza}
        allIngredients={ingredients}
        onPizzaBuild={onPizzaBuild}
      />

      {orderId ? (
        <div className="card">
          <div className="muted">Создан заказ:</div>
          <div className="mono">{orderId}</div>
          <div className="muted">Перейди в кабинет, чтобы трекать заказ через XHR.</div>
          {autoCancelInfo?.createdId === orderId ? (
            <div className="muted" style={{ marginTop: 10 }}>
              setTimeout demo: авто-отмена была запланирована на 2 минуты и отменяется после process().
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}


