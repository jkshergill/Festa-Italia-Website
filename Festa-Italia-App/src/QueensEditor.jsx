
import './QueensEditor.css'
import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

const BUCKET = "coronation";

const getQueensImageURL = (imagePath) => {
  if (!imagePath) return "";
  return supabase.storage.from("coronation").getPublicUrl(imagePath).data.publicUrl;
};

function formatYear(v) {
  if (v === null || v === undefined) return "";
  return String(v);
}

function QueensEditor() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [coronation, setCoronation] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Delete confirm modal
  const [confirmDelete, setConfirmDelete] = useState(null); // food object | null
  
  // Edit state (inline: only one at a time)
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    year: "",
    description: "",
    image_url: "",
    is_current: false,
    is_previous: false,
  });

  const [editFile, setEditFile] = useState(null);
  
  // Add state
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    year: "",
    description: "",
    image_url: "",
    is_current: false, // Alwyas start inactive
    is_previous: false, // Always start inactive
  });

  const [addFile, setAddFile] = useState(null);
  const [sessionUser, setSessionUser] = useState(null);

  const loadCoronation = async () => {
    setLoading(true);
    setErrorMsg("");
    const { data, error } = await supabase
      .from("coronation")
      .select(
        "id,year,description,image_url,is_current,is_previous"
        )
      .order("year", { ascending: false });
  
    if (error) {
      console.error(error);
      setErrorMsg(error.message || "Failed to load coronation data.");
      setCoronation([]);
    } else {
      setCoronation(data || []);
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
    document.body.id = 'queens-edit-body-id';
    document.body.className = 'queens-edit-body';
  }, []);

  useEffect(() => {
    (async () => {
      const ok = await checkAdmin();
      if (ok) {
        await loadCoronation();
      }
    })();
  }, []);
  
  const openEdit = (coronation) => {
    // close add box if it is open
    setShowAdd(false);
    setAddFile(null);

    setEditingId(coronation.id);
    setEditFile(null);
    setEditForm({
      year: formatYear(coronation.year),
      description: coronation.description ?? "",
      image_url: coronation.image_url ?? "",
      is_current: !!coronation.is_current,
      is_previous: !!coronation.is_previous,
    });
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditFile(null);
    setEditForm({
      year: "",
      description: "",
      image_url: "",
      is_current: false,
      is_previous: false,
    });
  };

  const toggleCurrent = async (coronation) => {
    setBusyId(coronation.id);
    setErrorMsg("");
  
    const next = !coronation.is_current;
  
    const { error } = await supabase
      .from("coronation")
      .update({ is_current: next })
      .eq("id", coronation.id);
  
    if (error) {
      console.error(error);
      setErrorMsg(error.message || "Failed to update current status.");
    } else {
      setCoronation((prev) =>
      prev.map((c) => (c.id === coronation.id ? { ...c, is_current: next } : c))
      );
    }
      setBusyId(null);
    };

  const togglePrevious = async (coronation) => {
    setBusyId(coronation.id);
    setErrorMsg("");
    
    const next = !coronation.is_previous;
    
    const { error } = await supabase
      .from("coronation")
      .update({ is_previous: next })
      .eq("id", coronation.id);
    
      if (error) {
        console.error(error);
        setErrorMsg(error.message || "Failed to update previous status.");
      } else {
        setCoronation((prev) =>
        prev.map((c) => (c.id === coronation.id ? { ...c, is_previous: next } : c))
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
  
    const { error: uploadErr } = await supabase.storage.from("coronation").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });
  
    if (uploadErr) throw uploadErr;
  
    return path;
  };
  
const saveEdit = async () => {
  const current = coronation.find((c) => c.id === editingId);
  if (!current) return;

  setBusyId(current.id);
  setErrorMsg("");

    try {
      const image_path = await uploadImageIfNeeded(editFile, current.image_url);

      const payload = {
        year: formatYear(editForm.year) || null,
        image_url: image_path || null,
        description: editForm.description?.trim() || null,
        is_current: !!editForm.is_current,
        is_previous: !!editForm.is_previous,
      };

      const { data, error } = await supabase
        .from("coronation")
        .update(payload)
        .eq("id", current.id)
        .select()
        .single();

      if (error) throw error;

      setCoronation((prev) => prev.map((c) => (c.id === current.id ? data : c)));
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
      year: "",
      description: "",
      image_url: "",
      is_current: false, // Alwyas start inactive
      is_previous: false, // Always start inactive
    });
  };

  const cancelAdd = () => {
    setShowAdd(false);
    setAddFile(null);
  };

  const createCoronation = async () => {
    setBusyId("add");
    setErrorMsg("");
  
    try {
      const image_path = await uploadImageIfNeeded(addFile, "");
  
      const payload = {
        year: formatYear(addForm.year) || null,
        image_url: image_path || null,
        description: addForm.description?.trim() || null,
        is_current: !!addForm.is_current,
        is_previous: !!addForm.is_previous,
      };
  
      const { data, error } = await supabase.from("coronation").insert(payload).select().single();
  
      if (error) throw error;
  
      setCoronation((prev) => [data, ...prev]);
      cancelAdd();
    } catch (err) {
      console.error(err);
      setErrorMsg(err?.message || "Failed to add item.");
    } finally {
      setBusyId(null);
     }
  };

  const requestDelete = (coronation) => {
    // close edit/add so we don't delete the wrong thing accidentally
    closeEdit();
    setShowAdd(false);
    setAddFile(null);

    setConfirmDelete(coronation);
  };

  const cancelDelete = () => setConfirmDelete(null);

  const deleteCoronationConfirmed = async () => {
    const coronation = confirmDelete;
    if (!coronation) return;
    if (coronation.is_previous || coronation.is_current) {
      setErrorMsg("Please deactivate the item before deleting it.");
      return;
    }

    /*if (coronation.is_previous && coronation.is_current) {
      setErrorMsg("Please deactivate both items before deleting it.");
      return;
    }*/
  
    setBusyId(coronation.id);
    setErrorMsg("");
  
    try {
      // Best-effort: remove image from storage first (ignore failure, but log it)
      if (coronation.image_url) {
        const { error: storageErr } = await supabase.storage.from("coronation").remove([coronation.image_url]);
        if (storageErr) {
          console.warn("Storage delete failed (continuing DB delete):", storageErr);
        }
      }
  
      console.log("Attempting delete", { id: coronation.id, is_current: coronation.is_current, is_previous: coronation.is_previous });
      const { data: deletedRows, error: delErr } = await supabase
      .from("coronation")
      .delete()
      .eq("id", coronation.id)
      .select(); // <— important: confirms what was deleted
  
    if (delErr) throw delErr;
  
    if (!deletedRows || deletedRows.length === 0) {
      throw new Error("Delete matched 0 rows. Check RLS policy or that the id is correct.");
    }
  
    setCoronation((prev) => prev.filter((c) => c.id !== coronation.id));
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


  return (
    <main className='editor-main'>
      <div>
        <h1 className='queens-header'>Queens Editor</h1>

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
          <button className='editor-button' onClick={loadCoronation} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
          <button
            className='editor-button'
            onClick={startAdd}
            disabled={showAdd || busyId === "add" || !!editingId || !!confirmDelete}
          >
            Add Item
          </button>
        </div>

        {editingId !== null && (
          <div className="edit-modal-overlay">
            <div className="edit-modal">
              <h2>Edit Queen</h2>

              <div>
                <input
                className='add-year-input'
                value={editForm.year}
                onChange={(e) =>
                setEditForm((p) => ({ ...p, year: e.target.value }))
                }
                placeholder="Year"
                />                
              </div>
      
              <div>
                <textarea
                className='add-description-input'
                value={editForm.description}
                onChange={(e) =>
                setEditForm((p) => ({ ...p, description: e.target.value }))
                }
                rows={3}
                />              
              </div>

              <input
              className='add-image-input'
              type="file"
              accept="image/*"
              onChange={(e) => setEditFile(e.target.files?.[0] ?? null)}
              />

              <div>
                <label>
                  <input
                  className='add-checkbox'
                  type="checkbox"
                  checked={editForm.is_current}
                  onChange={(e) =>
                  setEditForm((p) => ({ ...p, is_current: e.target.checked }))
                  }
                  />
                 Current
                 </label>
              </div>


              <div>
                <label>
                  <input
                  className='add-checkbox'
                  type="checkbox"
                  checked={editForm.is_previous}
                  onChange={(e) =>
                  setEditForm((p) => ({ ...p, is_previous: e.target.checked }))
                  }
                  />
                    Previous
                </label>
              </div>
              

          <div style={{ marginTop: 10 }}>
            <button className='editor-button' onClick={saveEdit} disabled={busyId === editingId}>
              {busyId === editingId ? "Saving..." : "Save"}
            </button>

            <button className='editor-button' onClick={closeEdit} disabled={busyId === editingId}>
              Cancel
            </button>
          </div>
        </div>
      </div>
)}
        
        {loading ? (
          <div>Loading coronation data…</div>
        ) : (
          <>
            <div className='add-form'>
              {showAdd && (
                <div>
                  <h2 style={{ marginTop: 0 }}>Add Queens (starts inactive)</h2>
                  
                  <div>
                    <input
                    className='add-year-input'
                    value={addForm.year}
                    onChange={(e) => setAddForm((p) => ({ ...p, year: e.target.value }))}
                    placeholder="e.g. 2023"
                  />
                  </div>

                  <div>
                    <textarea
                      className='add-description-input'
                      value={addForm.description}
                      onChange={(e) => setAddForm((p) => ({ ...p, description: e.target.value }))}
                      placeholder="Short description…"
                      rows={3}
                    />
                  </div>

                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAddFile(e.target.files?.[0] ?? null)}
                    />
                  </div>

                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <button className='editor-button' onClick={createCoronation} disabled={busyId === "add"}>
                      {busyId === "add" ? "Adding..." : "Save Item"}
                    </button>
                    <button className='editor-button' onClick={cancelAdd} disabled={busyId === "add"}>
                      Cancel
                    </button>
                  </div>             
                </div>
              )}
            </div>

            <div className='display'>
              {coronation.map(c => ( 
                <div key={c.id} className="coronation-info">
                  <img className="coronation-images" src={getQueensImageURL(c.image_url)}/>
                    <p className="description">
                      {c.description}
                    </p>

                    <p className="year">
                      {c.year}
                    </p>

                    <p className='determine-to-delete'> 
                      <strong>{c.is_current || c.is_previous? "Not Able to Delete" : "Able to Delete"}</strong>
                    </p>

                    <button className='editor-button' onClick={() => openEdit(c)} disabled={busyId === c.id || !!confirmDelete}>
                      Edit
                    </button>

                    <button
                      className='editor-button'
                       onClick={() => requestDelete(c)}
                      disabled={c.is_current || c.is_previous || busyId === c.id || busyId === "add" || !!confirmDelete}
                      style={{ border: "1px solid rgba(255,0,0,0.35)" }}
                    >
                      Delete
                    </button>
                </div>                       
              ))}
            </div> 
          
           {confirmDelete && (
            <ConfirmModal
              title="Delete menu item?"
              message={
                <>
                  This will permanently delete the Queen.
                  <br />
                  This cannot be undone.
                </>
              }
              confirmText={busyId === confirmDelete.id ? "Deleting..." : "Yes, delete"}
              cancelText="Cancel"
              onCancel={cancelDelete}
              onConfirm={deleteCoronationConfirmed}
              disableActions={busyId === confirmDelete.id}
            />
          )}
          </> 
        )}     
      </div>
    </main>
  );
}

export default QueensEditor;