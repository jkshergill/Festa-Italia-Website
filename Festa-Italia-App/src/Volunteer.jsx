import { useEffect, useMemo, useState } from 'react';
import { supabase } from './supabaseClient';
import './Volunteer.css';

const DAYS = ['Friday', 'Saturday', 'Sunday'];
const TIMEFRAMES = ['Morning', 'Evening', 'Night'];

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function makeShiftKey(day, timeframe) {
  return `${day}__${timeframe}`;
}

export default function Volunteer() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [userId, setUserId] = useState(null);
  const [booths, setBooths] = useState([]);
  const [selectedBooth, setSelectedBooth] = useState('');
  const [selectedShifts, setSelectedShifts] = useState([]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');

      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        if (!cancelled) setError(authError.message);
        setLoading(false);
        return;
      }

      const user = authData?.user;
      if (!user) {
        if (!cancelled) setError('You must be logged in to sign up for volunteer shifts.');
        setLoading(false);
        return;
      }

      const { data: boothData, error: boothError } = await supabase
        .from('booths')
        .select('id, name')
        .order('name', { ascending: true });

      if (boothError) {
        if (!cancelled) setError(boothError.message);
        setLoading(false);
        return;
      }

      if (!cancelled) {
        setUserId(user.id);
        setBooths(boothData || []);
      }
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const canSubmit = useMemo(() => {
    return Boolean(userId && selectedShifts.length > 0 && !submitting);
  }, [userId, selectedShifts, submitting]);

  function toggleShift(day, timeframe) {
    const key = makeShiftKey(day, timeframe);

    setSelectedShifts((current) => {
      const exists = current.some(
        (shift) => shift.day === day && shift.timeframe === timeframe
      );

      if (exists) {
        return current.filter(
          (shift) => makeShiftKey(shift.day, shift.timeframe) !== key
        );
      }

      return [...current, { day, timeframe }];
    });
  }

  async function handleSignup() {
    setError('');
    setMessage('');

    if (!canSubmit) return;

    setSubmitting(true);

    try {
      const normalizedSelections = selectedShifts.map((shift) => ({
        day: normalize(shift.day),
        timeframe: normalize(shift.timeframe),
      }));

      const duplicateChecks = await Promise.all(
        normalizedSelections.map(async (shift) => {
          const { data, error: existingError } = await supabase
            .from('volunteer_signups')
            .select('id')
            .eq('user_id', userId)
            .eq('day', shift.day)
            .eq('timeframe', shift.timeframe)
            .limit(1);

          if (existingError) throw existingError;

          return {
            ...shift,
            exists: Boolean(data && data.length > 0),
          };
        })
      );

      const duplicates = duplicateChecks.filter((shift) => shift.exists);
      if (duplicates.length > 0) {
        const duplicateLabels = selectedShifts
          .filter((selectedShift) =>
            duplicates.some(
              (duplicate) =>
                duplicate.day === normalize(selectedShift.day) &&
                duplicate.timeframe === normalize(selectedShift.timeframe)
            )
          )
          .map((shift) => `${shift.day} ${shift.timeframe}`)
          .join(', ');

        setError(`You are already signed up for: ${duplicateLabels}.`);
        setSubmitting(false);
        return;
      }

      const payload = selectedShifts.map((shift) => ({
        user_id: userId,
        day: normalize(shift.day),
        timeframe: normalize(shift.timeframe),
        confirm: false,
        booth_id: selectedBooth || null,
      }));

      const { error: insertError } = await supabase
        .from('volunteer_signups')
        .insert(payload);

      if (insertError) throw insertError;

      const submittedShiftLabels = selectedShifts
        .map((shift) => `${shift.day} ${shift.timeframe}`)
        .join(', ');

      setMessage(`Signup submitted for: ${submittedShiftLabels}.`);
      setSelectedShifts([]);
    } catch (err) {
      setError(err?.message || 'Unable to submit volunteer signup.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="volunteer-container">Loading volunteer signup...</div>;
  }

  return (
    <div className="volunteer-container page-root">
      <h1 className="volunteer-title">Volunteer Sign-Up</h1>

      <div className="volunteer-card-box">
        <div className="volunteer-section">
          <label className="dropdown-label" htmlFor="booth-select">
            Preferred Booth (Optional)
          </label>
          <select
            id="booth-select"
            className="role-dropdown"
            value={selectedBooth}
            onChange={(e) => setSelectedBooth(e.target.value)}
          >
            <option value="">No booth preference</option>
            {booths.map((booth) => (
              <option key={booth.id} value={booth.id}>
                {booth.name}
              </option>
            ))}
          </select>
        </div>

        <div className="schedule-wrapper">
          <table className="schedule-table">
            <thead>
              <tr>
                <th>Day</th>
                {TIMEFRAMES.map((timeframe) => (
                  <th key={timeframe}>{timeframe}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DAYS.map((day) => (
                <tr key={day}>
                  <td>{day}</td>
                  {TIMEFRAMES.map((timeframe) => {
                    const selected = selectedShifts.some(
                      (shift) => shift.day === day && shift.timeframe === timeframe
                    );

                    return (
                      <td
                        key={`${day}-${timeframe}`}
                        className={selected ? 'selected' : ''}
                        onClick={() => toggleShift(day, timeframe)}
                        role="button"
                        tabIndex={0}
                        aria-label={`${selected ? 'Deselect' : 'Select'} ${day} ${timeframe}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleShift(day, timeframe);
                          }
                        }}
                      >
                        {selected ? 'Selected' : 'Select'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="selected-shifts-box">
          <h3 className="selected-shifts-title">Selected Shifts:</h3>
          {selectedShifts.length > 0 ? (
            <ul className="selected-shifts-list">
              {selectedShifts.map((shift) => (
                <li
                  key={makeShiftKey(shift.day, shift.timeframe)}
                  className="selected-shift-item"
                >
                  {shift.day} - {shift.timeframe}
                </li>
              ))}
            </ul>
          ) : (
            <p className="selected-shifts-empty">No shifts selected.</p>
          )}
        </div>

        <div className="volunteer-section volunteer-signup-actions">
          <button
            type="button"
            className="signup-button"
            disabled={!canSubmit}
            onClick={handleSignup}
            style={{ opacity: canSubmit ? 1 : 0.7 }}
          >
            {submitting ? 'Submitting...' : 'Sign up for Selected Shifts'}
          </button>
        </div>

        {message && (
          <p className="volunteer-message volunteer-message-success">{message}</p>
        )}
        {error && (
          <p className="volunteer-message volunteer-message-error">{error}</p>
        )}
      </div>
    </div>
  );
}
