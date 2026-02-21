import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./adminEditMenu.css";

const BUCKET = "foods";

const getPublicImageUrl = (imagePath) => {
  if (!imagePath) return "";
  return supabase.storage.from(BUCKET).getPublicUrl(imagePath).data.publicUrl;
};

function asNumberOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function formatPrice(v) {
  if (v === null || v === undefined) return "";
  return String(v);
}

export default function AdminFoods() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Delete confirm modal
  const [confirmDelete, setConfirmDelete] = useState(null); // food object | null

  // Edit state (inline: only one at a time)
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    price: "",
    calories: "",
    is_active: false,
    image_path: "",
    food_type: "Food",
  });
  const [editFile, setEditFile] = useState(null);

  // Add state
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    description: "",
    price: "",
    calories: "",
    is_active: false, // always start inactive
    image_path: "",
    food_type: "Food",
  });
  const [addFile, setAddFile] = useState(null);

  const [sessionUser, setSessionUser] = useState(null);

  const loadFoods = async () => {
    setLoading(true);
    setErrorMsg("");
    const { data, error } = await supabase
      .from("foods")
      .select(
        "id,name,description,price,calories,is_active,image_path,food_type,created_at,updated_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setErrorMsg(error.message || "Failed to load foods.");
      setFoods([]);
    } else {
      setFoods(data || []);
    }
    setLoading(false);
  };

  const checkAdmin = async () => {
    const { data: sessionRes } = await supabase.auth.getSession();
    const user = sessionRes?.session?.user;

    setSessionUser(user || null);

    if (!user) {
      setIsAdmin(false);
      setAuthChecked(true);
      return false;
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error("Admin check failed:", error);
      setIsAdmin(false);
      setAuthChecked(true);
      return false;
    }

    setIsAdmin(!!profile?.is_admin);
    setAuthChecked(true);
    return !!profile?.is_admin;
  };

  useEffect(() => {
    (async () => {
      const ok = await checkAdmin();
      if (ok) {
        await loadFoods();
      }
    })();
  }, []);

  const openEdit = (food) => {
    // close add box if it is open
    setShowAdd(false);
    setAddFile(null);

    setEditingId(food.id);
    setEditFile(null);
    setEditForm({
      name: food.name ?? "",
      description: food.description ?? "",
      price: formatPrice(food.price),
      calories: food.calories ?? "",
      is_active: !!food.is_active,
      image_path: food.image_path ?? "",
      food_type: food.food_type ?? "Food",
    });
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditFile(null);
    setEditForm({
      name: "",
      description: "",
      price: "",
      calories: "",
      is_active: false,
      image_path: "",
      food_type: "Food",
    });
  };

  const toggleActive = async (food) => {
    setBusyId(food.id);
    setErrorMsg("");

    const next = !food.is_active;

    const { error } = await supabase
      .from("foods")
      .update({ is_active: next })
      .eq("id", food.id);

    if (error) {
      console.error(error);
      setErrorMsg(error.message || "Failed to update active status.");
    } else {
      setFoods((prev) =>
        prev.map((f) => (f.id === food.id ? { ...f, is_active: next } : f))
      );
    }
    setBusyId(null);
  };

  const uploadImageIfNeeded = async (file, existingImagePath = "") => {
    if (!file) return existingImagePath || "";

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `${crypto.randomUUID()}.${ext}`;

    // store everything at the top of the BUCKET
    const path = filename;

    const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

    if (uploadErr) throw uploadErr;

    return path;
  };

  const saveEdit = async () => {
    const current = foods.find((f) => f.id === editingId);
    if (!current) return;

    if (!editForm.name.trim()) {
      alert("Name is required.");
      return;
    }

    setBusyId(current.id);
    setErrorMsg("");

    try {
      const image_path = await uploadImageIfNeeded(editFile, current.image_path);

      const payload = {
        name: editForm.name.trim(),
        description: editForm.description?.trim() || null,        price: asNumberOrNull(editForm.price),
        calories: asNumberOrNull(editForm.calories),
        is_active: !!editForm.is_active,
        image_path: image_path || null,
        food_type: editForm.food_type || null,
                updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("foods")
        .update(payload)
        .eq("id", current.id)
        .select()
        .single();

      if (error) throw error;

      setFoods((prev) => prev.map((f) => (f.id === current.id ? data : f)));
      closeEdit();
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to save changes.");
    } finally {
      setBusyId(null);
    }
  };

  const startAdd = () => {
    // close edit if it is open
    closeEdit();

    setShowAdd(true);
    setAddFile(null);
    setAddForm({
      name: "",
      description: "",
      price: "",
      calories: "",
      is_active: false, // always inactive on create
      image_path: "",
      food_type: "food",
    });
  };

  const cancelAdd = () => {
    setShowAdd(false);
    setAddFile(null);
  };

  const createFood = async () => {
    if (!addForm.name.trim()) {
      alert("Name is required.");
      return;
    }

    setBusyId("add");
    setErrorMsg("");

    try {
      const image_path = await uploadImageIfNeeded(addFile, "");

      const payload = {
        name: addForm.name.trim(),
        description: addForm.description?.trim() || null,        price: asNumberOrNull(addForm.price),
        calories: asNumberOrNull(addForm.calories),
        is_active: false, // force inactive on create
        image_path: image_path || null,
        food_type: addForm.food_type || null,
            };

      const { data, error } = await supabase.from("foods").insert(payload).select().single();

      if (error) throw error;

      setFoods((prev) => [data, ...prev]);
      cancelAdd();
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to add item.");
    } finally {
      setBusyId(null);
    }
  };

  const requestDelete = (food) => {
    // close edit/add so we don't delete the wrong thing accidentally
    closeEdit();
    setShowAdd(false);
    setAddFile(null);

    setConfirmDelete(food);
  };

  const cancelDelete = () => setConfirmDelete(null);

  const deleteFoodConfirmed = async () => {
    const food = confirmDelete;
    if (!food) return;
    if (food.is_active) {
      setErrorMsg("Please deactivate the item before deleting it.");
      return;
    }

    setBusyId(food.id);
    setErrorMsg("");

    try {
      // Best-effort: remove image from storage first (ignore failure, but log it)
      if (food.image_path) {
        const { error: storageErr } = await supabase.storage.from(BUCKET).remove([food.image_path]);
        if (storageErr) {
          console.warn("Storage delete failed (continuing DB delete):", storageErr);
        }
      }

      console.log("Attempting delete", { id: food.id, is_active: food.is_active });
      const { data: deletedRows, error: delErr } = await supabase
      .from("foods")
      .delete()
      .eq("id", food.id)
      .select(); // <— important: confirms what was deleted

    if (delErr) throw delErr;

    if (!deletedRows || deletedRows.length === 0) {
      throw new Error("Delete matched 0 rows. Check RLS policy or that the id is correct.");
    }

    setFoods((prev) => prev.filter((f) => f.id !== food.id));
    setConfirmDelete(null);
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to delete item.");
    } finally {
      setBusyId(null);
    }
  };

  if (!authChecked) {
    return <div style={{ padding: 24 }}>Checking permissions…</div>;
  }

  if (!isAdmin) {
    return (
      <div style={{ padding: 24 }}>
        <h2>Unauthorized</h2>
        <p>Please sign in with an admin account to access this page.</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#fff" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "24px 16px" }}>
        <h1 className="editMenu-title">Admin Menu Editor</h1>

        <div style={{ opacity: 0.8, marginBottom: 16 }}>
          {sessionUser ? `Signed in as ${sessionUser.email}` : "Not signed in"}
        </div>

        {errorMsg && (
          <div
            style={{
              padding: "10px 12px",
              borderRadius: 10,
              marginBottom: 16,
              border: "1px solid rgba(255,0,0,0.35)",
            }}
            role="alert"
          >
            {errorMsg}
          </div>
        )}

        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
          <button onClick={loadFoods} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
          <button
            onClick={startAdd}
            disabled={showAdd || busyId === "add" || !!editingId || !!confirmDelete}
          >
            Add Item
          </button>
        </div>

        {loading ? (
          <div>Loading menu items…</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {showAdd && (
              <div
                style={{
                  padding: 14,
                  borderRadius: 14,
                  border: "1px solid rgba(255,255,255,0.18)",
                }}
              >
                <h2 style={{ marginTop: 0 }}>Add Menu Item (starts inactive)</h2>

                <Field label="Name">
                  <input
                    value={addForm.name}
                    onChange={(e) => setAddForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. Pasta Primavera"
                  />
                </Field>

                <Field label="Description">
                  <textarea
                    value={addForm.description}
                    onChange={(e) => setAddForm((p) => ({ ...p, description: e.target.value }))}
                    placeholder="Short description…"
                    rows={3}
                  />
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
  <Field label="Price">
    <input
      value={addForm.price}
      onChange={(e) => setAddForm((p) => ({ ...p, price: e.target.value }))}
      placeholder="e.g. 9.99"
    />
  </Field>

  <Field label="Food Type">
    <select
      value={addForm.food_type}
      onChange={(e) => setAddForm((p) => ({ ...p, food_type: e.target.value }))}
    >
      <option value="food">Food</option>
      <option value="drink">Drink</option>
    </select>
  </Field>
</div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <Field label="Calories">
                    <input
                      value={addForm.calories}
                      onChange={(e) => setAddForm((p) => ({ ...p, calories: e.target.value }))}
                      placeholder="e.g. 550"
                    />
                  </Field>
                  <div />
                </div>

                <Field label={`Upload Image (bucket: ${BUCKET})`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAddFile(e.target.files?.[0] ?? null)}
                  />
                </Field>

                <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                  <button onClick={createFood} disabled={busyId === "add"}>
                    {busyId === "add" ? "Adding..." : "Save Item"}
                  </button>
                  <button onClick={cancelAdd} disabled={busyId === "add"}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {foods.length === 0 ? (
              <div>No items found.</div>
            ) : (
              foods.map((f) => {
                // Inline edit: replace the row with edit UI
                if (f.id === editingId) {
                  return (
                    <div
                      key={f.id}
                      style={{
                        border: "1px solid rgba(255,255,255,0.18)",
                        borderRadius: 14,
                        padding: 14,
                      }}
                    >
                      <h2 style={{ marginTop: 0, marginBottom: 10 }}>Editing: {f.name}</h2>

                      <Field label="Name">
                        <input
                          value={editForm.name}
                          onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                        />
                      </Field>

                      <Field label="Description">
                        <textarea
                          value={editForm.description}
                          onChange={(e) => setEditForm((p) => ({ ...p, description: e.target.value }))}
                          rows={3}
                        />
                      </Field>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
  <Field label="Price">
    <input
      value={editForm.price}
      onChange={(e) => setEditForm((p) => ({ ...p, price: e.target.value }))}
    />
  </Field>

  <Field label="Food Type">
    <select
      value={editForm.food_type}
      onChange={(e) => setEditForm((p) => ({ ...p, food_type: e.target.value }))}
    >
      <option value="food">Food</option>
      <option value="drink">Drink</option>
    </select>
  </Field>
</div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        <Field label="Calories">
                          <input
                            value={editForm.calories}
                            onChange={(e) => setEditForm((p) => ({ ...p, calories: e.target.value }))}
                          />
                        </Field>

                        <Field label="Active">
                          <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                            <input
                              type="checkbox"
                              checked={!!editForm.is_active}
                              onChange={(e) =>
                                setEditForm((p) => ({ ...p, is_active: e.target.checked }))
                              }
                            />
                            Active
                          </label>
                        </Field>
                      </div>

                      <Field label={`Replace Image (bucket: ${BUCKET})`}>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
                        />
                        <div style={{ marginTop: 10, display: "flex", gap: 12, alignItems: "center" }}>
                          <div
                            style={{
                              width: 140,
                              height: 100,
                              borderRadius: 12,
                              overflow: "hidden",
                              border: "1px solid rgba(255,255,255,0.18)",
                              background: "#b91c1c",
                              color: "#fff",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                            title={f.image_path || ""}
                          >
                            {f.image_path ? (
                              <img
                                src={getPublicImageUrl(f.image_path)}
                                alt=""
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                  display: "block",
                                }}
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
                            ) : (
                              <span style={{ fontSize: 12, opacity: 0.7 }}>Image not found</span>
                            )}
                          </div>

                          {f.image_path && (
                            <div style={{ opacity: 0.8 }}>
                              Current path: <code>{f.image_path}</code>
                            </div>
                          )}
                        </div>
                      </Field>

                      <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                        <button onClick={saveEdit} disabled={busyId === f.id}>
                          {busyId === f.id ? "Saving..." : "Save Changes"}
                        </button>
                        <button onClick={closeEdit} disabled={busyId === f.id}>
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                }

                // Normal row
                return (
                  <div
                    key={f.id}
                    style={{
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 14,
                      padding: 14,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 16,
                        alignItems: "center",
                      }}
                    >
                      {/* LEFT: name + description */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 18, fontWeight: 700 }}>
                          {f.name}{" "}
                          <span style={{ fontWeight: 500, opacity: 0.75 }}>
                            {f.is_active ? "(Active)" : "(Inactive)"}
                          </span>
                        </div>

                        {f.description && (
                          <div style={{ opacity: 0.9, marginTop: 6 }}>{f.description}</div>
                        )}

                        <div style={{ opacity: 0.85, marginTop: 8 }}>
                          Price: {f.price ?? "—"} • Type: {f.food_type ?? "—"} • Calories: {f.calories ?? "—"}
                        </div>
                      </div>

                      {/* MIDDLE: thumbnail */}
                      <div
                        style={{
                          width: 120,
                          height: 90,
                          borderRadius: 12,
                          overflow: "hidden",
                          border: "1px solid rgba(255,255,255,0.18)",
                          background: "rgba(255,255,255,0.06)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                        title={f.image_path || ""}
                      >
                        {f.image_path ? (
                          <img
                            src={getPublicImageUrl(f.image_path)}
                            alt=""
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              display: "block",
                            }}
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: 12, opacity: 0.7 }}>Image not found</span>
                        )}
                      </div>

                      {/* RIGHT: action buttons */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 160 }}>
                        <button onClick={() => openEdit(f)} disabled={busyId === f.id || !!confirmDelete}>
                          Edit
                        </button>
                        <button
                          onClick={() => toggleActive(f)}
                          disabled={busyId === f.id || !!confirmDelete}
                        >
                          {f.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => requestDelete(f)}
                          disabled={f.is_active || busyId === f.id || busyId === "add" || !!confirmDelete}
                          title={f.is_active ? "Deactivate the item before deleting it." : "Permanently delete item"}
                          style={{ border: "1px solid rgba(255,0,0,0.35)" }}

                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Confirm Delete Modal */}
        {confirmDelete && (
          <ConfirmModal
            title="Delete menu item?"
            message={
              <>
                This will permanently delete <b>{confirmDelete.name}</b>.
                <br />
                This cannot be undone.
              </>
            }
            confirmText={busyId === confirmDelete.id ? "Deleting..." : "Yes, delete"}
            cancelText="Cancel"
            onCancel={cancelDelete}
            onConfirm={deleteFoodConfirmed}
            disableActions={busyId === confirmDelete.id}
          />
        )}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <div>{children}</div>
      <style>{`
        input, textarea, select {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(248, 240, 240, 0.9);
          background: rgba(0,0,0,0.2);
          color: inherit;
          box-sizing: border-box;
        }
        textarea { resize: vertical; }
        button {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(248, 240, 240, 0.9);
          background: rgba(255,255,255,0.08);
          color: inherit;
          cursor: pointer;
        }
        button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

function ConfirmModal({
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  disableActions = false,
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 9999,
      }}
      onMouseDown={(e) => {
        // click outside closes
        if (e.target === e.currentTarget && !disableActions) onCancel?.();
      }}
    >
        <div
          style={{
            width: "100%",
            maxWidth: 420,
            borderRadius: 14,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(20,20,20,0.95)",
            color: "#fff",
            padding: 14,
          }}
          onMouseDown={(e) => e.stopPropagation()}
        >
        <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>{title}</div>
        <div style={{ opacity: 0.9, marginBottom: 14, lineHeight: 1.4 }}>{message}</div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={onCancel} disabled={disableActions}>
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={disableActions}
            style={{ border: "1px solid rgba(255,0,0,0.35)" }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
