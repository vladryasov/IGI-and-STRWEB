import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import { NavBar } from "./components/NavBar";
import { Home } from "./pages/Home";
import { Catalog } from "./pages/Catalog";
import { PizzaDetail } from "./pages/PizzaDetail";
import { Profile } from "./pages/Profile";
import { NotFound } from "./pages/NotFound";
import { ManagePizza } from "./pages/ManagePizza";

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <NavBar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/pizza/:id" element={<PizzaDetail />} />
          <Route path="/manage-pizza" element={<ManagePizza />} />
          <Route path="/manage-pizza/:id/edit" element={<ManagePizza />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
