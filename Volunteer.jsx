import { useEffect, useMemo, useState } from 'react';
import { supabase } from './supabaseClient';
import './Volunteer.css';

const DAYS = ['Friday', 'Saturday', 'Sunday'];
const TIMEFRAMES = ['Morning', 'Evening', 'Night'];

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

export default function Volunteer() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const [userId, setUserId] = useState(null);
  const [booths, setBooths] = useState([]);
  const [selectedBooth, setSelectedBooth] = useState('');

  const [selectedDay, setSelectedDay] = useState('Friday');
  const [selectedTimeframe, setSelectedTimeframe] = useState('Morning');

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
    return Boolean(userId && selectedDay && selectedTimeframe && !submitting);
  }, [userId, selectedDay, selectedTimeframe, submitting]);

  async function handleSignup() {
    setError('');
    setMessage('');

    if (!canSubmit) return;

    setSubmitting(true);

    try {
      const day = normalize(selectedDay);
      const timeframe = normalize(selectedTimeframe);

      // Prevent duplicate signups for the same day and timeframe.
      const { data: existing, error: existingError } = await supabase
        .from('volunteer_signups')
        .select('id')
        .eq('user_id', userId)
        .eq('day', day)
        .eq('timeframe', timeframe)
        .limit(1);

      if (existingError) throw existingError;

      if (existing && existing.length > 0) {
        setError('You are already signed up for that day and timeframe.');
        setSubmitting(false);
        return;
      }

      const payload = {
        user_id: userId,
        day,
        timeframe,
        confirm: false,
        booth_id: selectedBooth || null,
      };

      const { error: insertError } = await supabase
        .from('volunteer_signups')
        .insert(payload);

      if (insertError) throw insertError;

      setMessage(`Signup submitted for ${selectedDay} ${selectedTimeframe}.`);
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
    <div className="volunteer-container">
      <h1 className="volunteer-title">Volunteer Sign-Up</h1>

      <div className="volunteer-section">
        <label className="dropdown-label" htmlFor="booth-select">Preferred Booth (Optional)</label>
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
                  const selected = day === selectedDay && timeframe === selectedTimeframe;
                  return (
                    <td
                      key={`${day}-${timeframe}`}
                      className={selected ? 'selected' : ''}
                      onClick={() => {
                        setSelectedDay(day);
                        setSelectedTimeframe(timeframe);
                      }}
                      role="button"
                      tabIndex={0}
                      aria-label={`Select ${day} ${timeframe}`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setSelectedDay(day);
                          setSelectedTimeframe(timeframe);
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

      {/* <div className="volunteer-submit" style={{ marginTop: '1rem' }}> */}
        <button
          type="button"
          className="signup-button"
          disabled={!canSubmit}
          onClick={handleSignup}
          style={{ opacity: canSubmit ? 1 : 0.7 }}
        >
          {submitting ? 'Submitting...' : `Sign Up: ${selectedDay} ${selectedTimeframe}`}
        </button>
      {/* </div> */}

      {message && (
        <p style={{ color: '#0a7b34', textAlign: 'center', fontWeight: 600 }}>{message}</p>
      )}
      {error && (
        <p style={{ color: 'crimson', textAlign: 'center', fontWeight: 600 }}>{error}</p>
      )}
    </div>
  );
}
