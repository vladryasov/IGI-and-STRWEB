import React from "react";
import { Link } from "react-router-dom";

export function Home() {
  return (
    <div className="container">
      <section className="hero card card--hero">
        <div className="hero__text">
          <h1 className="h1">🍕 Benvenuti! Итальянская пиццерия</h1>
          <p className="muted" style={{ fontSize: "18px", lineHeight: "1.6" }}>
            Аутентичная итальянская пицца с доставкой. Собери свою пиццу в конструкторе, 
            выбери ингредиенты и следи за заказом в реальном времени.
          </p>
          <div className="row" style={{ marginTop: "20px" }}>
            <Link className="btn btn--primary" to="/catalog">
              🍕 Открыть каталог
            </Link>
            <Link className="btn btn--ghost" to="/profile">
              👤 Личный кабинет
            </Link>
          </div>
        </div>
        <div className="hero__badge">
          <div className="badge badge--pulse">🔥 -20% на Margherita</div>
          <div className="badge badge--sun">🌶️ Diavola</div>
        </div>
      </section>

      <section className="grid grid--3">
        <div className="card">
          <h3 className="h3">🍅 Свежие ингредиенты</h3>
          <p className="muted">Только натуральные продукты: моцарелла, базилик, помидоры и многое другое.</p>
        </div>
        <div className="card">
          <h3 className="h3">⚡ Быстрая доставка</h3>
          <p className="muted">Отслеживайте статус заказа в реальном времени через XHR трекинг.</p>
        </div>
        <div className="card">
          <h3 className="h3">🎨 Собери свою пиццу</h3>
          <p className="muted">Выбери размер, добавь ингредиенты и создай идеальную пиццу на свой вкус.</p>
        </div>
      </section>
    </div>
  );
}


