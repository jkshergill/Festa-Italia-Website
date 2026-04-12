import { useState, useEffect } from 'react';
import { supabase } from "./supabaseClient";
import './HomePage.css';
import "./TokenEditor.css";

export default function TokenEditor() {
    const [showForm, setShowForm] = useState(false);
    const [token, setToken] = useState("");
    const [price, setPrice] = useState("");
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [tokens, setTokens] = useState([]);
    const [editToken, setEditToken] = useState(null);
    const [currentImage, setCurrentImage] = useState("");

    //useEffect for body ID and className
    useEffect(() => {
        document.body.id = 'token-editor-body-id';
        document.body.className = 'token-editor-body';
        
        return () => {
            document.body.id = '';
            document.body.className = '';
        };
    }, []);

    const fetchTokens = async () => {
        const { data, error } = await supabase.from("tokens").select("*");
        console.log(`error: ${error}`);
        console.log(`data: ${data}`);
        setTokens(data || []);
    }

    useEffect(() => {
        let mounted = true;
        const fetchSafe = async () => {
            const { error } = await fetchTokens();
            if (error) console.log("mount error", error);
            if (!mounted) return;
        }
        fetchSafe();
        return () => { mounted = false };
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log({ token, price, image });
        alert("Form Submitted!");
        let imgPath = editToken?.image_path || "";
        if (image) {
            const path = `${Date.now()}_${image.name}`;
            const { data, error } = await supabase.storage.from("tokens").upload(path, image);
            console.log(path);
            if (error) console.log(error);
            if (data) imgPath = data.path;

            if (editToken?.image_path) {
                await supabase.storage.from("tokens").remove([editToken.image_path]);
            }
        }

        if (editToken) {
            const { data, error } = await supabase.from("tokens").update(
                { color: token, price: price, image_path: imgPath }
            ).eq("id", editToken.id);
            if (data) console.log("edit data", data);
            if (error) console.log("edit error", error);
            alert("Token Updated!");
        } else {
            const { data, error } = await supabase.from("tokens").insert([{
                color: token, price: price, image_path: imgPath, is_active: true
            }]);
            if (error) console.log(`insert error: ${error}`);
            if (data) console.log(data);
        }
        setShowForm(false);
        setEditToken(null);
        setToken("");
        setPrice("");
        setImage(null);
        fetchTokens();
    };

    const handleEdit = (token) => {
        setEditToken(token);
        setToken(token.color);
        setPrice(token.price);
        setCurrentImage(token.image_path);
        setShowForm(true);
    };

    const handleDelete = async (token) => {
        if (token.image_path) {
            const { error: storageerror } = await supabase.storage.from("tokens").remove([token.image_path]);
            console.log("storage error-", storageerror);
        }
        const { data, error } = await supabase.from("tokens").delete().eq("id", token.id);
        if (error) console.log(`delete error: ${error}`);
        if (data) console.log(`delete data: ${data}`);
        fetchTokens();
    }

    const handleToggleActive = async (token) => {
        try {
            const newState = !token.is_active;
            const { data, error } = await supabase.from('tokens').update({ is_active: newState }).eq('id', token.id);
            if (error) console.log('toggle error', error);
            if (data) console.log('toggled', data);
            fetchTokens();
        } catch (err) {
            console.error('toggle exception', err);
        }
    }

    return (
        <div className="token-editor-container">
            {/* Header Section */}
            <div className="token-editor-header">
                <h1 className="token-editor-title">Token Editor</h1>
                <button onClick={() => setShowForm(true)} className="add-token-btn">
                    Add Token
                </button>
            </div>

            {/* Form Section - uses original .form class */}
            {showForm && (
                <div className="token-form-container">
                    <form onSubmit={handleSubmit} className="form">
                        <div className="form-group">
                            <label className="form-label">Token Color</label>
                            <input
                                type="text"
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="Enter token color or name"
                                className="input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Price ($)</label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="Enter price"
                                className="input"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">Upload Image</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    setImage(e.target.files[0]);
                                    setCurrentImage(e.target.files[0]?.name);
                                }}
                                className="input"
                                required={!editToken}
                            />
                            {currentImage && (
                                <p className="image-filename">Selected: {currentImage}</p>
                            )}
                        </div>

                        <button type="submit" className="submit-btn">
                            {editToken ? "Update" : "Submit"}
                        </button>
                    </form>
                </div>
            )}

            {/* Tokens Table Section */}
            <div className="tokens-table-section">
                <h3 className="table-title">Tokens Table</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Color</th>
                            <th>Price</th>
                            <th>Image Path</th>
                            <th>Active</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tokens.map(token => (
                            <tr key={token.id}>
                                <td data-label="Color">{token.color}</td>
                                <td data-label="Price">${token.price}</td>
                                <td data-label="Image Path" className="image-path-cell">
                                    {token.image_path ? (
                                        <span className="image-path-text">{token.image_path}</span>
                                    ) : (
                                        <span className="no-image">No image</span>
                                    )}
                                </td>
                                <td data-label="Active" className="active-cell">
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={!!token.is_active}
                                            onChange={() => {
                                                setTokens(prev => prev.map(t => t.id === token.id ? { ...t, is_active: !t.is_active } : t));
                                                handleToggleActive(token);
                                            }}
                                            aria-label={token.is_active ? 'Deactivate token' : 'Activate token'}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </td>
                                <td data-label="Actions" className="actions-cell">
                                    <div className="action-buttons">
                                        <button className="edit-btn" onClick={() => handleEdit(token)}>Edit</button>
                                        <button className="delete-btn" onClick={() => handleDelete(token)}>Delete</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}