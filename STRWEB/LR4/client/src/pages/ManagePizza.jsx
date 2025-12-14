import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../config";
import { AuthContext } from "../contexts/AuthContext";

export function ManagePizza() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, authHeaders } = useContext(AuthContext);
  const isEditMode = !!id;

  const [pizzas, setPizzas] = useState([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    basePrice: 200,
    imageFile: null,
    imagePreview: null,
    isAvailable: true,
    tags: [],
    ingredients: []
  });
  const [tagInput, setTagInput] = useState("");
  const [allIngredients, setAllIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(!isEditMode);
  const [searchQuery, setSearchQuery] = useState("");

  // Проверка авторизации
  useEffect(() => {
    if (!token) {
      navigate("/profile");
    }
  }, [token, navigate]);

  // Загрузка списка пицц
  useEffect(() => {
    if (!token || showForm) return;
    loadPizzas();
  }, [token, showForm]);

  // Загрузка ингредиентов
  useEffect(() => {
    fetch(`${API_URL}/api/ingredients`)
      .then(r => r.json())
      .then(data => setAllIngredients(data.items || []))
      .catch(() => {});
  }, []);

  // Загрузка данных пиццы для редактирования
  useEffect(() => {
    if (!isEditMode || !token) return;

    setLoading(true);
    fetch(`${API_URL}/api/pizzas/${id}`)
      .then(r => r.json().then(data => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.message || "Failed to load pizza");
        const pizza = data.item;
        setForm({
          name: pizza.name || "",
          description: pizza.description || "",
          basePrice: pizza.basePrice || 200,
          imageFile: null,
          imagePreview: pizza.imageUrl || null,
          isAvailable: pizza.isAvailable !== false,
          tags: pizza.tags || [],
          ingredients: (pizza.ingredients || []).map(i => i._id || i)
        });
        setShowForm(true);
      })
      .catch(e => setError(e.message || "Failed to load pizza"))
      .finally(() => setLoading(false));
  }, [id, isEditMode, token]);

  function loadPizzas() {
    setLoading(true);
    const url = new URL(`${API_URL}/api/pizzas`);
    if (searchQuery) url.searchParams.set("q", searchQuery);
    url.searchParams.set("sort", "createdAt");
    url.searchParams.set("dir", "desc");

    fetch(url.toString())
      .then(r => r.json().then(data => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.message || "Failed to load pizzas");
        setPizzas(data.items || []);
      })
      .catch(e => setError(e.message || "Failed to load pizzas"))
      .finally(() => setLoading(false));
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Размер файла не должен превышать 5MB");
        return;
      }
      setForm(prev => ({ ...prev, imageFile: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm(prev => ({ ...prev, imagePreview: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!token) {
      setError("Требуется авторизация");
      return;
    }

    if (!form.name.trim() || form.name.trim().length < 2) {
      setError("Название должно быть минимум 2 символа");
      return;
    }

    if (form.basePrice < 0 || form.basePrice > 5000) {
      setError("Цена должна быть от 0 до 5000");
      return;
    }

    setLoading(true);
    setError("");

    const url = isEditMode ? `${API_URL}/api/pizzas/${id}` : `${API_URL}/api/pizzas`;
    const method = isEditMode ? "PUT" : "POST";

    const formData = new FormData();
    formData.append("name", form.name.trim());
    formData.append("description", form.description.trim());
    formData.append("basePrice", form.basePrice);
    formData.append("isAvailable", form.isAvailable);
    formData.append("tags", JSON.stringify(form.tags));
    formData.append("ingredients", JSON.stringify(form.ingredients));
    
    if (form.imageFile) {
      formData.append("image", form.imageFile);
    } else if (form.imagePreview && form.imagePreview.startsWith('data:')) {
      formData.append("imageBase64", form.imagePreview);
    } else if (isEditMode && form.imagePreview && !form.imagePreview.startsWith('data:')) {
      // При редактировании, если есть старое изображение (не base64), сохраняем его URL
      formData.append("imageUrl", form.imagePreview);
    }

    fetch(url, {
      method,
      headers: { ...authHeaders },
      body: formData
    })
      .then(r => r.json().then(data => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.message || data.errors?.[0]?.msg || "Operation failed");
        loadPizzas();
        resetForm();
        if (isEditMode) {
          navigate("/manage-pizza");
        }
      })
      .catch(e => {
        setError(e.message || "Operation failed");
        setLoading(false);
      });
  }

  function toggleIngredient(ingredientId) {
    setForm(prev => ({
      ...prev,
      ingredients: prev.ingredients.includes(ingredientId)
        ? prev.ingredients.filter(id => id !== ingredientId)
        : [...prev.ingredients, ingredientId]
    }));
  }

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm(prev => ({ ...prev, tags: [...prev.tags, tag] }));
      setTagInput("");
    }
  }

  function removeTag(tagToRemove) {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  }

  function resetForm() {
    setForm({
      name: "",
      description: "",
      basePrice: 200,
      imageFile: null,
      imagePreview: null,
      isAvailable: true,
      tags: [],
      ingredients: []
    });
    setTagInput("");
    setShowForm(false);
  }

  function handleEdit(pizzaId) {
    navigate(`/manage-pizza/${pizzaId}/edit`);
  }

  async function handleDelete(pizzaId) {
    if (!window.confirm("Вы уверены, что хотите удалить эту пиццу?")) return;

    setLoading(true);
    fetch(`${API_URL}/api/pizzas/${pizzaId}`, {
      method: "DELETE",
      headers: { ...authHeaders }
    })
      .then(r => r.json().then(data => ({ ok: r.ok, data })))
      .then(({ ok, data }) => {
        if (!ok) throw new Error(data.message || "Delete failed");
        loadPizzas();
      })
      .catch(e => {
        setError(e.message || "Delete failed");
        setLoading(false);
      });
  }

  function getImageUrl(imageUrl) {
    if (!imageUrl) return null;
    if (imageUrl.startsWith('data:') || imageUrl.startsWith('http')) {
      return imageUrl;
    }
    return `${API_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
  }

  const filteredPizzas = useMemo(() => {
    if (!searchQuery) return pizzas;
    const query = searchQuery.toLowerCase();
    return pizzas.filter(p => 
      p.name.toLowerCase().includes(query) ||
      (p.description || "").toLowerCase().includes(query) ||
      (p.tags || []).some(t => t.toLowerCase().includes(query))
    );
  }, [pizzas, searchQuery]);

  if (!token) {
    return null; // Редирект произойдет в useEffect
  }

  if (isEditMode && loading && !form.name) {
    return <div className="container muted">Загрузка...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <div className="row row--space">
          <h2 className="h2">🍕 Управление пиццами</h2>
          {!showForm && (
            <button className="btn btn--primary" onClick={() => setShowForm(true)}>
              + Создать пиццу
            </button>
          )}
        </div>

        {error && <div className="error" style={{ marginTop: "12px" }}>{error}</div>}

        {showForm ? (
          <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
            <div className="row row--space">
              <h3 className="h3">{isEditMode ? "Редактировать пиццу" : "Создать пиццу"}</h3>
              <button type="button" className="btn btn--ghost" onClick={resetForm}>
                {isEditMode ? "Отмена" : "Скрыть форму"}
              </button>
            </div>

            <label className="label">
              Название *
              <input
                className="input"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="Например: Маргарита"
                required
                minLength={2}
                maxLength={80}
              />
            </label>

            <label className="label">
              Описание
              <textarea
                className="input"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                placeholder="Описание пиццы..."
                rows={3}
                maxLength={400}
              />
            </label>

            <div className="grid grid--2">
              <label className="label">
                Базовая цена (₴) *
                <input
                  className="input"
                  type="number"
                  value={form.basePrice}
                  onChange={e => setForm({ ...form, basePrice: e.target.value })}
                  min={0}
                  max={5000}
                  step={10}
                  required
                />
              </label>

              <label className="label">
                Изображение
                <input
                  className="input"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {form.imagePreview && (
                  <div style={{ marginTop: "8px" }}>
                    <img 
                      src={form.imagePreview.startsWith('data:') ? form.imagePreview : getImageUrl(form.imagePreview)} 
                      alt="Preview" 
                      style={{ maxWidth: "200px", maxHeight: "200px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.1)" }}
                    />
                  </div>
                )}
              </label>
            </div>

            <label className="label" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={e => setForm({ ...form, isAvailable: e.target.checked })}
              />
              <span>Доступна для заказа</span>
            </label>

            <div className="divider" />

            <label className="label">
              Ингредиенты
              <div className="grid grid--tags" style={{ marginTop: "8px" }}>
                {allIngredients.map(ing => (
                  <button
                    key={ing._id}
                    type="button"
                    className={form.ingredients.includes(ing._id) ? "chip chip--on" : "chip"}
                    onClick={() => toggleIngredient(ing._id)}
                  >
                    {ing.name} {ing.isVeg ? "🌱" : ""}
                  </button>
                ))}
              </div>
              {allIngredients.length === 0 && <div className="muted">Загрузка ингредиентов...</div>}
            </label>

            <div className="divider" />

            <label className="label">
              Теги
              <div className="row" style={{ marginTop: "8px" }}>
                <input
                  className="input"
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyPress={e => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Введите тег и нажмите Enter"
                />
                <button type="button" className="btn btn--ghost" onClick={addTag}>
                  Добавить
                </button>
              </div>
              <div className="tags" style={{ marginTop: "8px" }}>
                {form.tags.map(tag => (
                  <span key={tag} className="tag">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      style={{
                        marginLeft: "6px",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </label>

            <div className="row" style={{ marginTop: "20px" }}>
              <button type="submit" className="btn btn--primary" disabled={loading}>
                {loading ? "Сохранение..." : isEditMode ? "Сохранить изменения" : "Создать пиццу"}
              </button>
              <button
                type="button"
                className="btn btn--ghost"
                onClick={resetForm}
                disabled={loading}
              >
                Отмена
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="toolbar__row" style={{ marginTop: "20px" }}>
              <input
                className="input"
                placeholder="Поиск пицц..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>

            {loading && <div className="muted" style={{ marginTop: "12px" }}>Загрузка...</div>}

            <div className="grid grid--cards" style={{ marginTop: "20px" }}>
              {filteredPizzas.map(p => {
                const imageUrl = getImageUrl(p.imageUrl);
                return (
                  <div className="card card--pizza" key={p._id}>
                    <div className="card__image">
                      {imageUrl ? (
                        <img 
                          src={imageUrl} 
                          alt={p.name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="card__image-placeholder" style={{ display: imageUrl ? 'none' : 'flex' }}>
                        🍕
                      </div>
                    </div>
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
                    <div className="row" style={{ marginTop: "12px" }}>
                      <button 
                        className="btn btn--ghost" 
                        onClick={() => handleEdit(p._id)}
                        style={{ flex: 1 }}
                      >
                        Редактировать
                      </button>
                      <button 
                        className="btn btn--ghost" 
                        onClick={() => handleDelete(p._id)}
                        disabled={loading}
                        style={{ flex: 1 }}
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredPizzas.length === 0 && !loading && (
              <div className="muted" style={{ marginTop: "20px", textAlign: "center" }}>
                {searchQuery ? "Пиццы не найдены" : "Пиццы не созданы"}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
