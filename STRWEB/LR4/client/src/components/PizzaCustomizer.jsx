import React, { useMemo, useReducer, useState } from "react";

// required by lab: functional + useReducer
const initialState = {
  size: "M",
  selected: {}, // ingredientId -> boolean
  promoCode: ""
};

function reducer(state, action) {
  switch (action.type) {
    case "setSize":
      return { ...state, size: action.size };
    case "toggleIngredient":
      return { ...state, selected: { ...state.selected, [action.id]: !state.selected[action.id] } };
    case "setPromo":
      return { ...state, promoCode: action.promoCode };
    case "reset":
      return initialState;
    default:
      return state;
  }
}

export function PizzaCustomizer({ basePizza, allIngredients, onPizzaBuild }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [feedback, setFeedback] = useState("");

  const sizeMultiplier = useMemo(() => {
    return state.size === "S" ? 0.9 : state.size === "L" ? 1.2 : 1;
  }, [state.size]);

  const extraIngredientIds = useMemo(() => {
    return Object.entries(state.selected)
      .filter(([, v]) => v)
      .map(([k]) => k);
  }, [state.selected]);

  const extraPrice = useMemo(() => {
    const byId = new Map(allIngredients.map(i => [i._id, i]));
    return extraIngredientIds.reduce((sum, id) => sum + (byId.get(id)?.price || 0), 0);
  }, [allIngredients, extraIngredientIds]);

  const promoDiscount = useMemo(() => {
    // demo promo: ITALY10 -> -10%
    return state.promoCode.trim().toUpperCase() === "ITALY10" ? 0.1 : 0;
  }, [state.promoCode]);

  const total = useMemo(() => {
    const base = (basePizza?.basePrice || 0) * sizeMultiplier + extraPrice;
    return Math.round(base * (1 - promoDiscount));
  }, [basePizza, sizeMultiplier, extraPrice, promoDiscount]);

  function validateAddress(address) {
    // Формат: ул. XXX, д. XXXX, кв. XXXXX
    const addressPattern = /^ул\.\s+\S+,\s+д\.\s+\S+,\s+кв\.\s+\S+$/i;
    return addressPattern.test(address.trim());
  }

  function onIngredientSelect(id) {
    // required by lab: onIngredientSelect event handler
    dispatch({ type: "toggleIngredient", id });
  }

  function onPromoApply() {
    // required by lab: onPromoApply handler
    const code = state.promoCode.trim().toUpperCase();
    if (code && code !== "ITALY10") alert("Промокод не найден (demo: ITALY10).");
  }

  async function handleBuild() {
    // required by lab: onPizzaBuild handler
    const trimmedAddress = deliveryAddress.trim();
    if (!trimmedAddress) {
      alert("Введите адрес доставки.");
      return;
    }
    if (!validateAddress(trimmedAddress)) {
      alert("Адрес должен быть в формате: ул. XXX, д. XXXX, кв. XXXXX");
      return;
    }
    await onPizzaBuild?.({
      size: state.size,
      extraIngredientIds,
      promoCode: state.promoCode,
      deliveryAddress
    });
  }

  function onFeedback() {
    // required by lab: onFeedback handler
    if (!feedback.trim()) {
      alert("Напиши отзыв перед отправкой.");
      return;
    }
    alert(`Спасибо за отзыв: ${feedback}`);
    setFeedback("");
  }

  return (
    <div className="card card--customizer">
      <div className="customizer__head">
        <h3 className="h3">PizzaCustomizer</h3>
        <div className="price">{total} ₴</div>
      </div>

      <div className="grid grid--2">
        <div>
          <div className="muted">Размер</div>
          <div className="row">
            {["S", "M", "L"].map(s => (
              <button
                key={s}
                className={state.size === s ? "btn btn--primary" : "btn btn--ghost"}
                onClick={() => dispatch({ type: "setSize", size: s })}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="muted" style={{ marginTop: 12 }}>
            Доп. ингредиенты (клик)
          </div>
          <div className="grid grid--tags">
            {allIngredients.map(i => (
              <button
                key={i._id}
                className={state.selected[i._id] ? "chip chip--on ingredient-pop" : "chip"}
                onClick={() => onIngredientSelect(i._id)}
              >
                {i.name} (+{Math.round(i.price)})
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="label">
            Адрес доставки
            <input
              className="input"
              value={deliveryAddress}
              onChange={e => setDeliveryAddress(e.target.value)}
              placeholder="ул. Примерная, д. 10, кв. 25"
            />
          </label>

          <label className="label">
            Промокод (demo: ITALY10)
            <input
              className="input"
              value={state.promoCode}
              onChange={e => dispatch({ type: "setPromo", promoCode: e.target.value })}
              onBlur={onPromoApply}
              placeholder="ITALY10"
            />
          </label>

          <div className="row" style={{ marginTop: 10 }}>
            <button className="btn btn--primary" onClick={handleBuild}>
              Заказать (onPizzaBuild)
            </button>
            <button className="btn btn--ghost" onClick={() => dispatch({ type: "reset" })}>
              Сброс
            </button>
          </div>

          <div className="divider" />

          <label className="label">
            Отзыв
            <input className="input" value={feedback} onChange={e => setFeedback(e.target.value)} placeholder="🔥" />
          </label>
          <button className="btn btn--ghost" onClick={onFeedback}>
            Отправить отзыв (onFeedback)
          </button>
        </div>
      </div>
    </div>
  );
}



