import { useEffect, useMemo, useState } from 'react';
import { supabase } from './supabaseClient';

const DONOR_TYPES = ['Bocce', 'Advertising/Sponsorship'];

const emptyForm = {
  donor_id: null,
  name: '',
  donor_note: '',
  amount_dollars: '',
  donation_type: 'Advertising/Sponsorship',
  donor_pic_url: '',
  donor_link_url: '',
};

export default function DonorManager() {
  const [donors, setDonors] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    loadDonors();
  }, []);

  async function loadDonors() {
    setLoading(true);
    setMessage('');

    const { data, error } = await supabase
      .from('donors')
      .select(`
        donor_id,
        company_name,
        donor_name,
        donor_note,
        donor_pic_url,
        donor_link_url,
        amount_cents,
        donation_type,
        consent_to_share,
        is_anonymous,
        donated_at,
        created_at
      `)
      .in('donation_type', DONOR_TYPES)
      .order('donated_at', { ascending: false, nullsFirst: false });

    if (error) {
      setMessage(error.message);
      setDonors([]);
    } else {
      setDonors(data || []);
    }

    setLoading(false);
  }

  const filteredDonors = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return donors;

    return donors.filter((donor) => {
      const name = (donor.company_name || donor.donor_name || '').toLowerCase();
      const note = (donor.donor_note || '').toLowerCase();
      const type = (donor.donation_type || '').toLowerCase();
      const link = (donor.donor_link_url || '').toLowerCase();

      return name.includes(q) || note.includes(q) || type.includes(q) || link.includes(q);
    });
  }, [donors, query]);

  function resetForm() {
    setForm(emptyForm);
    setSelectedFile(null);
    setEditingId(null);
    setMessage('');
  }

  function startEdit(donor) {
    setEditingId(donor.donor_id);
    setSelectedFile(null);
    setForm({
      donor_id: donor.donor_id,
      name: donor.company_name || donor.donor_name || '',
      donor_note: donor.donor_note || '',
      amount_dollars:
        donor.amount_cents || donor.amount_cents === 0
          ? (donor.amount_cents / 100).toFixed(2)
          : '',
      donation_type: donor.donation_type || 'Advertising/Sponsorship',
      donor_pic_url: donor.donor_pic_url || '',
      donor_link_url: donor.donor_link_url || '',
    });
    setMessage('');
  }

  function updateForm(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function normalizeUrl(url) {
    const trimmed = (url || '').trim();
    if (!trimmed) return null;
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  async function uploadImageIfNeeded(existingPath = '') {
    if (!selectedFile) return existingPath;

    const fileExt = selectedFile.name.split('.').pop();
    const safeBase = (form.name || 'donor')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    const filePath = `${Date.now()}-${safeBase || 'donor'}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('donors')
      .upload(filePath, selectedFile, {
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from('donors').getPublicUrl(filePath);
    return data.publicUrl;
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const trimmedName = form.name.trim();
      if (!trimmedName) throw new Error('Name is required.');

      const normalizedLink = normalizeUrl(form.donor_link_url);
      const uploadedPath = await uploadImageIfNeeded('');

      const amountCents =
        form.amount_dollars === ''
          ? null
          : Math.round(Number(form.amount_dollars) * 100);

      if (form.amount_dollars !== '' && Number.isNaN(amountCents)) {
        throw new Error('Amount donated must be a valid number.');
      }

      const payload = {
        company_name: trimmedName,
        donor_name: trimmedName,
        donor_note: form.donor_note.trim() || null,
        donor_pic_url: uploadedPath || null,
        donor_link_url: normalizedLink,
        amount_cents: amountCents,
        donation_type: form.donation_type,
        consent_to_share: true,
        is_anonymous: false,
        donated_at: new Date().toISOString(),
        first_name: null,
        last_name: null,
      };

      const { error } = await supabase.from('donors').insert(payload);
      if (error) throw new Error(error.message);

      setMessage('Donor added.');
      resetForm();
      await loadDonors();
    } catch (err) {
      setMessage(err.message || 'Failed to add donor.');
    } finally {
      setSaving(false);
    }
  }

  async function handleEditSave(e) {
    e.preventDefault();
    if (!editingId) return;

    setSaving(true);
    setMessage('');

    try {
      const trimmedName = form.name.trim();
      if (!trimmedName) throw new Error('Name is required.');

      const uploadedPath = await uploadImageIfNeeded(form.donor_pic_url);
      const normalizedLink = normalizeUrl(form.donor_link_url);

      const payload = {
        company_name: trimmedName,
        donor_name: trimmedName,
        donor_note: form.donor_note.trim() || null,
        donor_pic_url: uploadedPath || null,
        donor_link_url: normalizedLink,
      };

      const { error } = await supabase
        .from('donors')
        .update(payload)
        .eq('donor_id', editingId);

      if (error) throw new Error(error.message);

      setMessage('Donor updated.');
      resetForm();
      await loadDonors();
    } catch (err) {
      setMessage(err.message || 'Failed to update donor.');
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;

    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('donors')
        .delete()
        .eq('donor_id', deleteTarget.donor_id);

      if (error) throw new Error(error.message);

      setMessage(
        `Deleted donor: ${
          deleteTarget.company_name || deleteTarget.donor_name || 'Unnamed Donor'
        }`
      );
      setDeleteTarget(null);

      if (editingId === deleteTarget.donor_id) {
        resetForm();
      }

      await loadDonors();
    } catch (err) {
      setMessage(err.message || 'Failed to delete donor.');
    } finally {
      setSaving(false);
    }
  }

  function displayName(donor) {
    return donor.company_name || donor.donor_name || 'Unnamed Donor';
  }

  function formatAmount(amountCents) {
    if (amountCents === null || amountCents === undefined) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amountCents / 100);
  }

  return (
    <div className="section-content">
      <div className="donor-manager-header">
        <input
          className="search-input"
          type="text"
          placeholder="Search donor name, note, type, or URL..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="donor-manager-grid">
        <section className="donor-manager-panel">
          <h3>{editingId ? 'Edit Sponsor / Private Donor' : 'Add Sponsor / Private Donor'}</h3>

          <form onSubmit={editingId ? handleEditSave : handleCreate} className="donor-form">
            <label>
              <span>Name</span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateForm('name', e.target.value)}
                placeholder="Sponsor name"
              />
            </label>

            <label>
              <span>Type</span>
              <select
                value={form.donation_type}
                onChange={(e) => updateForm('donation_type', e.target.value)}
                disabled={!!editingId}
              >
                {DONOR_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Description / Note</span>
              <textarea
                rows="4"
                value={form.donor_note}
                onChange={(e) => updateForm('donor_note', e.target.value)}
                placeholder="Optional message"
              />
            </label>

            {!editingId && (
              <label>
                <span>Amount Donated</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.amount_dollars}
                  onChange={(e) => updateForm('amount_dollars', e.target.value)}
                  placeholder="0.00"
                />
              </label>
            )}

            <label>
              <span>Logo / Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              />
            </label>

            <label>
              <span>Image hyperlink (optional)</span>
              <input
                type="url"
                value={form.donor_link_url}
                onChange={(e) => updateForm('donor_link_url', e.target.value)}
                placeholder="https://example.com"
              />
            </label>

            {form.donor_pic_url && !selectedFile && (
              <div className="donor-image-preview-row">
                <span>Current image:</span>
                <code>{form.donor_pic_url}</code>
              </div>
            )}

            <div className="donor-form-note">
              New entries are saved with <strong>consent_to_share = true</strong> and{' '}
              <strong>is_anonymous = false</strong>.
            </div>

            <div className="donor-form-actions">
              <button className="add-btn" type="submit" disabled={saving}>
                {saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Donor'}
              </button>

              {(editingId ||
                form.name ||
                form.donor_note ||
                form.amount_dollars ||
                form.donor_pic_url ||
                form.donor_link_url ||
                selectedFile) && (
                <button
                  type="button"
                  className="secondary-btn"
                  onClick={resetForm}
                  disabled={saving}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {message && <div className="muted">{message}</div>}
        </section>

        <section className="donor-manager-panel">
          <h3>Existing Sponsor / Private Donors</h3>

          {loading ? (
            <div className="muted">Loading donors...</div>
          ) : filteredDonors.length === 0 ? (
            <div className="muted">No matching donors found.</div>
          ) : (
            <div className="donor-admin-list">
              {filteredDonors.map((donor) => (
                <div key={donor.donor_id} className="admin-item donor-admin-item">
                  <div className="name">
                    <div className="donor-admin-name">{displayName(donor)}</div>
                    <div className="muted" style={{ padding: 0 }}>
                      {donor.donation_type || 'Unknown type'} • {formatAmount(donor.amount_cents)}
                    </div>
                    {donor.donor_note && (
                      <div className="donor-admin-note">{donor.donor_note}</div>
                    )}
                    {donor.donor_link_url && (
                      <div className="muted" style={{ padding: 0 }}>
                        Link: <a href={donor.donor_link_url} target="_blank" rel="noreferrer">{donor.donor_link_url}</a>
                      </div>
                    )}
                  </div>

                  <div className="actions donor-admin-actions">
                    <button
                      type="button"
                      className="edit-btn"
                      onClick={() => startEdit(donor)}
                      disabled={saving}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="remove-btn donor-delete-btn"
                      onClick={() => setDeleteTarget(donor)}
                      disabled={saving}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div
            className="modal-content donor-confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Delete donor?</h3>
            <p>
              This will permanently remove{' '}
              <strong>
                {deleteTarget.company_name || deleteTarget.donor_name || 'this donor'}
              </strong>{' '}
              from the page and from the donors table.
            </p>
            <p className="muted" style={{ padding: 0 }}>
              This only deletes the donor record. It does not create or trigger any refund flow.
            </p>
            <div className="donor-form-actions">
              <button
                type="button"
                className="remove-btn donor-delete-confirm-btn"
                onClick={confirmDelete}
                disabled={saving}
              >
                {saving ? 'Deleting...' : 'Yes, Delete'}
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setDeleteTarget(null)}
                disabled={saving}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}