import { useEffect, useMemo, useState } from 'react';
import './Donation.css';
import './HomePage.css';
import { supabase } from './supabaseClient';

export default function Donation({setPage}) {
  const [start, setStart] = useState({ month: '', day: '', year: '' });
  const [end, setEnd] = useState({ month: '', day: '', year: '' });

  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDonorId, setSelectedDonorId] = useState(null);
  const [displayFilter, setDisplayFilter] = useState('all');

  const currentYear = new Date().getFullYear();
  const minYear = 2000;

  const years = useMemo(() => {
    const arr = [];
    for (let y = minYear; y <= currentYear; y++) arr.push(y);
    return arr;
  }, [currentYear]);

  function daysInMonth(year, month) {
    if (!year || !month) return 31;
    return new Date(Number(year), Number(month), 0).getDate();
  }

  function pad(n) {
    return String(n).padStart(2, '0');
  }

  function formatParts(parts) {
    const { month, day, year } = parts || {};
    if (!month || !day || !year) return 'xx/xx/xxxx';
    return `${pad(month)}/${pad(day)}/${year}`;
  }

  function toISOStart(parts) {
    const { month, day, year } = parts || {};
    if (!month || !day || !year) return null;
    return `${year}-${pad(month)}-${pad(day)}T00:00:00.000Z`;
  }

  function toISOEnd(parts) {
    const { month, day, year } = parts || {};
    if (!month || !day || !year) return null;
    return `${year}-${pad(month)}-${pad(day)}T23:59:59.999Z`;
  }

  function onStartChange(field, value) {
    setStart((prev) => {
      const next = { ...prev, [field]: value };
      if ((field === 'month' || field === 'year') && next.day) {
        const max = daysInMonth(next.year || currentYear, next.month || 1);
        if (Number(next.day) > max) next.day = '';
      }
      return next;
    });
  }

  function onEndChange(field, value) {
    setEnd((prev) => {
      const next = { ...prev, [field]: value };
      if ((field === 'month' || field === 'year') && next.day) {
        const max = daysInMonth(next.year || currentYear, next.month || 1);
        if (Number(next.day) > max) next.day = '';
      }
      return next;
    });
  }

  function getDonorImageUrl(donorPicUrl) {
    if (!donorPicUrl) return '';

    if (donorPicUrl.startsWith('http://') || donorPicUrl.startsWith('https://')) {
      return donorPicUrl;
    }

    const { data } = supabase.storage.from('donors').getPublicUrl(donorPicUrl);
    return data?.publicUrl || '';
  }

  function normalizeUrl(url) {
    const trimmed = (url || '').trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

	function donorDisplayName(donor) {
	// Treat ALL private donors as anonymous
	if (donor.is_anonymous === true || donor.consent_to_share === false) {
		return 'Anonymous';
	}

	if (donor.company_name) return donor.company_name;
	if (donor.donor_name) return donor.donor_name;

	const fullName = `${donor.first_name || ''} ${donor.last_name || ''}`.trim();
	return fullName || 'Unnamed Donor';
	}

  function donorInitials(donor) {
    const name = donorDisplayName(donor);
    return name
      .split(' ')
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('');
  }

  function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  }

  function isCorporateSponsor(donor) {
    return donor.donation_type === 'Advertising/Sponsorship';
  }

  function isPrivateDonor(donor) {
    return donor.is_anonymous === true || donor.consent_to_share === false;
  }

  function isPublicDonor(donor) {
    return !isCorporateSponsor(donor) && !isPrivateDonor(donor);
  }

  useEffect(() => {
    async function fetchDonors() {
      setLoading(true);
      setError('');

      try {
        let query = supabase
          .from('donors')
          .select(`
            donor_id,
            first_name,
            last_name,
            company_name,
            donor_name,
            donor_note,
            donor_pic_url,
            donor_link_url,
            donated_at,
            is_anonymous,
            consent_to_share,
            donation_type
          `)
          .order('donated_at', { ascending: false });

        const startISO = toISOStart(start);
        const endISO = toISOEnd(end);

        if (startISO) query = query.gte('donated_at', startISO);
        if (endISO) query = query.lte('donated_at', endISO);

        const { data, error } = await query;
        if (error) throw error;

        const normalized = (data || []).map((donor) => ({
          ...donor,
          image_url: getDonorImageUrl(donor.donor_pic_url),
          donor_link_url: normalizeUrl(donor.donor_link_url),
        }));

        setDonors(normalized);
      } catch (err) {
        setError(err.message || 'Failed to load donors.');
      } finally {
        setLoading(false);
      }
    }

    fetchDonors();
  }, [start, end]);

  const corporateDonors = useMemo(() => {
    return donors.filter(isCorporateSponsor);
  }, [donors]);

  const publicDonors = useMemo(() => {
    return donors.filter(isPublicDonor);
  }, [donors]);

  const privateDonors = useMemo(() => {
    return donors.filter(isPrivateDonor);
  }, [donors]);

  const selectableDonors = useMemo(() => {
    if (displayFilter === 'corporate') return corporateDonors;
    if (displayFilter === 'public') return publicDonors;
    if (displayFilter === 'private') return privateDonors;
    return [...corporateDonors, ...publicDonors, ...privateDonors];
  }, [displayFilter, corporateDonors, publicDonors, privateDonors]);

  useEffect(() => {
    if (!selectableDonors.length) {
      setSelectedDonorId(null);
      return;
    }

    const stillExists = selectableDonors.some((d) => d.donor_id === selectedDonorId);
    if (!stillExists) {
      setSelectedDonorId(selectableDonors[0].donor_id);
    }
  }, [selectableDonors, selectedDonorId]);

  const selectedDonor =
    selectableDonors.find((d) => d.donor_id === selectedDonorId) || null;

  function renderDetailImage(donor) {
    if (!donor) {
      return (
        <div className="donor-detail-image donor-detail-fallback">
          Select a donor
        </div>
      );
    }

    const imageContent = donor.image_url ? (
      <img
        src={donor.image_url}
        alt={donorDisplayName(donor)}
        className="donor-detail-image"
      />
    ) : (
      <div className="donor-detail-image donor-detail-fallback">
        {donorInitials(donor)}
      </div>
    );

    if (donor.image_url && donor.donor_link_url) {
      return (
        <a
          href={donor.donor_link_url}
          target="_blank"
          rel="noopener noreferrer"
          className="donor-detail-image-link"
          aria-label={`Visit link for ${donorDisplayName(donor)}`}
        >
          {imageContent}
        </a>
      );
    }

    return imageContent;
  }

  function renderDonorList(sectionTitle, donorList) {
    if (!donorList.length) return null;

    return (
      <div className="donor-list-section">
        <h3 className="donor-list-section-title">{sectionTitle}</h3>
        <ul className="donor-select-list">
          {donorList.map((donor) => {
            const isSelected = donor.donor_id === selectedDonorId;

            return (
              <li key={donor.donor_id}>
                <button
                  type="button"
                  className={`donor-select-item ${isSelected ? 'selected' : ''}`}
                  onClick={() => setSelectedDonorId(donor.donor_id)}
                >
                  <div className="donor-select-avatar-wrap">
                    {donor.image_url ? (
                      <img
                        src={donor.image_url}
                        alt={donorDisplayName(donor)}
                        className="donor-select-avatar"
                      />
                    ) : (
                      <div className="donor-select-avatar donor-select-avatar-fallback">
                        {donorInitials(donor)}
                      </div>
                    )}
                  </div>

                  <div className="donor-select-text">
                    <strong>{donorDisplayName(donor)}</strong>
                    <span>{formatDate(donor.donated_at)}</span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  return (
    <div className="page-root">
      <main>
        <section className="container section">
          <h1 className="page-title">Recognizing Our Donors</h1>

          <p className="donation-intro">
            Celebrating our generous supporters and the impact of every gift.
          </p>

          <p className="donation-range">
            Showing donations from {formatParts(start)} - {formatParts(end)}
          </p>

          <div className="date-controls" aria-label="Filter donations by date">
            <fieldset className="date-group" aria-labelledby="start-label">
              <legend id="start-label" className="sr-only">Start date</legend>

              <div className="date-field">
                <label className="sr-only" htmlFor="start-month">Start month</label>
                <select
                  id="start-month"
                  value={start.month}
                  onChange={(e) => onStartChange('month', e.target.value)}
                  aria-label="Start month"
                >
                  <option value="">Month</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="date-field">
                <label className="sr-only" htmlFor="start-day">Start day</label>
                <select
                  id="start-day"
                  value={start.day}
                  onChange={(e) => onStartChange('day', e.target.value)}
                  aria-label="Start day"
                  disabled={!start.month || !start.year}
                >
                  <option value="">Day</option>
                  {Array.from(
                    { length: daysInMonth(start.year || currentYear, start.month || 1) },
                    (_, i) => i + 1
                  ).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="date-field">
                <label className="sr-only" htmlFor="start-year">Start year</label>
                <select
                  id="start-year"
                  value={start.year}
                  onChange={(e) => onStartChange('year', e.target.value)}
                  aria-label="Start year"
                >
                  <option value="">Year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </fieldset>

            <fieldset className="date-group" aria-labelledby="end-label">
              <legend id="end-label" className="sr-only">End date</legend>

              <div className="date-field">
                <label className="sr-only" htmlFor="end-month">End month</label>
                <select
                  id="end-month"
                  value={end.month}
                  onChange={(e) => onEndChange('month', e.target.value)}
                  aria-label="End month"
                >
                  <option value="">Month</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="date-field">
                <label className="sr-only" htmlFor="end-day">End day</label>
                <select
                  id="end-day"
                  value={end.day}
                  onChange={(e) => onEndChange('day', e.target.value)}
                  aria-label="End day"
                  disabled={!end.month || !end.year}
                >
                  <option value="">Day</option>
                  {Array.from(
                    { length: daysInMonth(end.year || currentYear, end.month || 1) },
                    (_, i) => i + 1
                  ).map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="date-field">
                <label className="sr-only" htmlFor="end-year">End year</label>
                <select
                  id="end-year"
                  value={end.year}
                  onChange={(e) => onEndChange('year', e.target.value)}
                  aria-label="End year"
                >
                  <option value="">Year</option>
                  {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </fieldset>
          </div>

          <div className="donor-filter-row">
            <label htmlFor="donor-display-filter" className="donor-filter-label">
              Display:
            </label>
            <select
              id="donor-display-filter"
              className="donor-display-filter"
              value={displayFilter}
              onChange={(e) => setDisplayFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="corporate">Corporate Sponsors</option>
              <option value="public">Public Donors</option>
              <option value="private">Private Donors</option>
            </select>
          </div>

          <section className="donors section">
            <div className="donors-header">
              <h2>Donors</h2>
              <p className="donor-count">
                {selectableDonors.length} donor{selectableDonors.length === 1 ? '' : 's'} recognized
              </p>
            </div>

            {loading && <p>Loading donors...</p>}
            {error && <p className="error-text">{error}</p>}

            {!loading && !error && (
              <>
                {selectableDonors.length === 0 ? (
                  <div className="donor-section-box">
                    <p>No donors found for this filter.</p>
                  </div>
                ) : (
                  <div className="donor-browser">
                    <div className="donor-browser-list donor-section-box">
                      {displayFilter === 'all' ? (
                        <>
                          {renderDonorList('Corporate Sponsors', corporateDonors)}
                          {renderDonorList('Public Donors', publicDonors)}
                          {renderDonorList('Private Donors', privateDonors)}
                        </>
                      ) : displayFilter === 'corporate' ? (
                        renderDonorList('Corporate Sponsors', corporateDonors)
                      ) : displayFilter === 'public' ? (
                        renderDonorList('Public Donors', publicDonors)
                      ) : (
                        renderDonorList('Private Donors', privateDonors)
                      )}
                    </div>

                    <div className="donor-browser-detail donor-section-box">
                      {selectedDonor ? (
                        <>
                          <div className="donor-detail-image-wrap">
                            {renderDetailImage(selectedDonor)}
                          </div>

                          <h3 className="donor-detail-title">
                            {selectedDonor.is_anonymous
                              ? 'Private Donor'
                              : donorDisplayName(selectedDonor)}
                          </h3>

                          <div className="donor-detail-description">
                            {selectedDonor.donor_note ? (
                              <p>{selectedDonor.donor_note}</p>
                            ) : (
                              <p>No description available.</p>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="donor-empty-state">
                          <p>Select a donor to see their details.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </section>
      </main>

      <a  className="floating-donate" aria-label="Donate">
        <svg className="heart" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        <span className="donate-badge" onClick={()=> setPage("donate")}>Donate</span>
        {/* <span className="donate-badge">Donate</span> */}
      </a>
    </div>
  );
}
