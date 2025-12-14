import React from "react";
import { Link } from "react-router-dom";

export function Home() {
  return (
    <div className="container">
      <section className="hero card card--hero">
        <div className="hero__text">
          <h1 className="h1">Benvenuti! Итальянская пиццерия</h1>
          <p className="muted">
            Собери пиццу в конструкторе, закажи и следи за доставкой в реальном времени (XHR).
          </p>
          <div className="row">
            <Link className="btn btn--primary" to="/catalog">
              Открыть каталог
            </Link>
            <Link className="btn btn--ghost" to="/profile">
              Личный кабинет
            </Link>
          </div>
        </div>
        <div className="hero__badge">
          <div className="badge badge--pulse">-20% на Margherita</div>
          <div className="badge badge--sun">Diavola</div>
        </div>
      </section>

      <section className="grid grid--3">
        <div className="card">
          <h3 className="h3">AI: Фото ингредиентов</h3>
          <p className="muted">Загрузи фото — Google Vision предложит ингредиенты для пиццы.</p>
        </div>
        <div className="card">
          <h3 className="h3">AI: Рецепт от OpenAI</h3>
          <p className="muted">Подбор рецепта и рекомендаций под выбранные ингредиенты.</p>
        </div>
        <div className="card">
          <h3 className="h3">Асинхронность</h3>
          <p className="muted">XHR трекинг, setTimeout авто-отмена, async/await цепочка статусов.</p>
        </div>
      </section>
    </div>
  );
}


