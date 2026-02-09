import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

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

function formatPrice(token_price) {
  if (token_price === null || token_price === undefined) return "";
  return String(token_price);
}

export default function AdminFoods() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Edit state (inline: only one at a time)
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    token_price: "",
    calories: "",
    is_active: false,
    image_path: "",
  });
  const [editFile, setEditFile] = useState(null);

  // Add state
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    description: "",
    token_price: "",
    calories: "",
    is_active: false, // always start inactive
    image_path: "",
  });
  const [addFile, setAddFile] = useState(null);

  const [sessionUser, setSessionUser] = useState(null);

  const loadFoods = async () => {
    setLoading(true);
    setErrorMsg("");
    const { data, error } = await supabase
      .from("foods")
      .select("id,name,description,token_price,calories,is_active,image_path,created_at,updated_at")
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

    if (!user) {
        setIsAdmin(false);
        setAuthChecked(true);
        return false;
    }

    const { data: profile, error } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .single();

    if (error) {
        console.error("Admin check failed:", error);
        setIsAdmin(false);
        setAuthChecked(true);
        return false;
    }

    setIsAdmin(!!profile.is_admin);
    setAuthChecked(true);
    return !!profile.is_admin;
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
      token_price: formatPrice(food.token_price),
      calories: food.calories ?? "",
      is_active: !!food.is_active,
      image_path: food.image_path ?? "",
    });
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditFile(null);
    setEditForm({
      name: "",
      description: "",
      token_price: "",
      calories: "",
      is_active: false,
      image_path: "",
    });
  };

  const toggleActive = async (food) => {
    setBusyId(food.id);
    setErrorMsg("");

    const next = !food.is_active;

    const { error } = await supabase.from("foods").update({ is_active: next }).eq("id", food.id);

    if (error) {
      console.error(error);
      setErrorMsg(error.message || "Failed to update active status.");
    } else {
      setFoods((prev) => prev.map((f) => (f.id === food.id ? { ...f, is_active: next } : f)));
    }
    setBusyId(null);
  };

  const uploadImageIfNeeded = async (file, existingImagePath = "") => {
    if (!file) return existingImagePath || "";

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const filename = `${crypto.randomUUID()}.${ext}`;

    // ✅ store everything at the top of the BUCKET (no foods/foods nesting)
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
        description: editForm.description?.trim() || null,
        token_price: asNumberOrNull(editForm.token_price),
        calories: asNumberOrNull(editForm.calories),
        is_active: !!editForm.is_active,
        image_path: image_path || null,
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
      token_price: "",
      calories: "",
      is_active: false, // always inactive on create
      image_path: "",
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
        description: addForm.description?.trim() || null,
        token_price: asNumberOrNull(addForm.token_price),
        calories: asNumberOrNull(addForm.calories),
        is_active: false, // force inactive on create
        image_path: image_path || null,
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
    <div style={{ maxWidth: 960, margin: "24px auto", padding: "0 16px" }}>
      <h1 style={{ marginBottom: 8 }}>Admin Menu Editor</h1>
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
        <button onClick={startAdd} disabled={showAdd || busyId === "add" || !!editingId}>
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
                      <Field label="Price (token_price)">
                        <input
                          value={addForm.token_price}
                          onChange={(e) => setAddForm((p) => ({ ...p, token_price: e.target.value }))}
                          placeholder="e.g. 12"
                        />
                      </Field>
          
                      <Field label="Calories">
                        <input
                          value={addForm.calories}
                          onChange={(e) => setAddForm((p) => ({ ...p, calories: e.target.value }))}
                          placeholder="e.g. 550"
                        />
                      </Field>
                    </div>
          
                    <Field label={`Upload Image (bucket: ${BUCKET})`}>
                      <input type="file" accept="image/*" onChange={(e) => setAddFile(e.target.files?.[0] ?? null)} />
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
                    <Field label="Price (token_price)">
                      <input
                        value={editForm.token_price}
                        onChange={(e) => setEditForm((p) => ({ ...p, token_price: e.target.value }))}
                      />
                    </Field>

                    <Field label="Calories">
                      <input
                        value={editForm.calories}
                        onChange={(e) => setEditForm((p) => ({ ...p, calories: e.target.value }))}
                      />
                    </Field>
                  </div>

                  <Field label="Active">
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <input
                        type="checkbox"
                        checked={!!editForm.is_active}
                        onChange={(e) => setEditForm((p) => ({ ...p, is_active: e.target.checked }))}
                      />
                      Active
                    </label>
                  </Field>

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

                    {f.description && <div style={{ opacity: 0.9, marginTop: 6 }}>{f.description}</div>}

                    <div style={{ opacity: 0.85, marginTop: 8 }}>
                      Price: {f.token_price ?? "—"} • Calories: {f.calories ?? "—"}
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
                    <button onClick={() => openEdit(f)} disabled={busyId === f.id}>
                      Edit
                    </button>
                    <button onClick={() => toggleActive(f)} disabled={busyId === f.id}>
                      {f.is_active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                </div>
              </div>
            );
                      })
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 6 }}>{label}</div>
      <div>{children}</div>
      <style>{`
        input, textarea {
          width: 100%;
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(0,0,0,0.2);
          color: inherit;
          box-sizing: border-box;
        }
        textarea { resize: vertical; }
        button {
          padding: 10px 12px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.18);
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
