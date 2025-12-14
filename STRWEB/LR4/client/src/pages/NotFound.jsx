import React from "react";
import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="container">
      <div className="card">
        <h2 className="h2">404</h2>
        <p className="muted">Страница не найдена.</p>
        <Link className="btn btn--ghost" to="/">
          На главную
        </Link>
      </div>
    </div>
  );
}



