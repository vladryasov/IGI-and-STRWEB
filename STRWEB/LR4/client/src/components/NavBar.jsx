import React, { useContext } from "react";
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { API_URL } from "../config";

export function NavBar() {
  const { user, logout, token } = useContext(AuthContext);
  return (
    <nav className="nav">
      <Link className="nav__brand" to="/">
        Pizzeria LR4
      </Link>

      <div className="nav__links">
        <NavLink className={({ isActive }) => (isActive ? "nav__link nav__link--active" : "nav__link")} to="/">
          Главная
        </NavLink>
        <NavLink className={({ isActive }) => (isActive ? "nav__link nav__link--active" : "nav__link")} to="/catalog">
          Каталог
        </NavLink>
        <NavLink
          className={({ isActive }) => (isActive ? "nav__link nav__link--active" : "nav__link")}
          to="/profile"
        >
          Кабинет
        </NavLink>
      </div>

      <div className="nav__auth">
        {token ? (
          <>
            <span className="nav__user">{user?.name || user?.email || "User"}</span>
            <button className="btn btn--ghost" onClick={logout}>
              Выйти
            </button>
          </>
        ) : (
          <a className="btn btn--ghost" href={`${API_URL}/api/auth/google`}>
            Google OAuth
          </a>
        )}
      </div>
    </nav>
  );
}



