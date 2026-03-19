import { useEffect, useMemo, useState } from 'react';
import './Donation.css';
import './HomePage.css';
import { supabase } from './supabaseClient';

export default function Donation() {
	const [start, setStart] = useState({ month: '', day: '', year: '' });
	const [end, setEnd] = useState({ month: '', day: '', year: '' });

	const [donors, setDonors] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

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
		setStart(prev => {
			const next = { ...prev, [field]: value };
			if ((field === 'month' || field === 'year') && next.day) {
				const max = daysInMonth(next.year || currentYear, next.month || 1);
				if (Number(next.day) > max) next.day = '';
			}
			return next;
		});
	}

	function onEndChange(field, value) {
		setEnd(prev => {
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
						donor_pic_url,
						amount_cents,
						donated_at,
						is_anonymous,
						consent_to_share,
						donation_type
					`)
					.eq('consent_to_share', true)
					.eq('donation_type', 'Basic')
					.order('donated_at', { ascending: false });

				const startISO = toISOStart(start);
				const endISO = toISOEnd(end);

				if (startISO) query = query.gte('donated_at', startISO);
				if (endISO) query = query.lte('donated_at', endISO);

				const { data, error } = await query;

				if (error) throw error;

				const normalized = (data || []).map(donor => ({
					...donor,
					image_url: getDonorImageUrl(donor.donor_pic_url)
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

	const anonymousDonors = donors.filter(d => d.is_anonymous);
	const publicDonors = donors.filter(d => !d.is_anonymous);

	function formatAmount(amountCents) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD'
		}).format((amountCents || 0) / 100);
	}

	function formatDate(dateString) {
		if (!dateString) return '';
		return new Date(dateString).toLocaleDateString();
	}

	function donorDisplayName(donor) {
		if (donor.company_name) return donor.company_name;

		const fullName = `${donor.first_name || ''} ${donor.last_name || ''}`.trim();
		return fullName || 'Unnamed Donor';
	}

	function donorInitials(donor) {
		const name = donorDisplayName(donor);
		return name
			.split(' ')
			.slice(0, 2)
			.map(part => part[0]?.toUpperCase() || '')
			.join('');
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
									{Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
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
									).map(d => (
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
									{years.map(y => <option key={y} value={y}>{y}</option>)}
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
									{Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
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
									).map(d => (
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
									{years.map(y => <option key={y} value={y}>{y}</option>)}
								</select>
							</div>
						</fieldset>
					</div>

					<section className="donors section">
						<div className="donors-header">
							<h2>Donors</h2>
							<p className="donor-count">
								{donors.length} donor{donors.length === 1 ? '' : 's'} recognized
							</p>
						</div>

						{loading && <p>Loading donors...</p>}
						{error && <p className="error-text">{error}</p>}

						{!loading && !error && (
							<>
								<section className="donor-subsection">
									<h3>Anonymous Donors</h3>
									{anonymousDonors.length === 0 ? (
										<p>No anonymous donors found.</p>
									) : (
										<ul className="donor-list">
											{anonymousDonors.map((donor) => (
												<li key={donor.donor_id} className="donor-card">
													<div className="donor-card-main">
														<div className="donor-avatar fallback-avatar">A</div>
														<div className="donor-meta">
															<strong>Anonymous Donor</strong>
															<span>{formatDate(donor.donated_at)}</span>
														</div>
													</div>
													<div className="donor-amount">{formatAmount(donor.amount_cents)}</div>
												</li>
											))}
										</ul>
									)}
								</section>

								<section className="donor-subsection">
									<h3>Public Donors</h3>
									{publicDonors.length === 0 ? (
										<p>No public donors found.</p>
									) : (
										<ul className="donor-list">
											{publicDonors.map((donor) => (
												<li key={donor.donor_id} className="donor-card">
													<div className="donor-card-main">
														{donor.image_url ? (
															<img
																src={donor.image_url}
																alt={donorDisplayName(donor)}
																className="donor-avatar"
															/>
														) : (
															<div className="donor-avatar fallback-avatar">
																{donorInitials(donor)}
															</div>
														)}

														<div className="donor-meta">
															<strong>{donorDisplayName(donor)}</strong>
															<span>{formatDate(donor.donated_at)}</span>
														</div>
													</div>

													<div className="donor-amount">
														{formatAmount(donor.amount_cents)}
													</div>
												</li>
											))}
										</ul>
									)}
								</section>
							</>
						)}
					</section>
				</section>
			</main>

			<a href="/donate" className="floating-donate" aria-label="Donate">
				<svg className="heart" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
					<path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
				</svg>
				<span className="donate-badge">Donate</span>
			</a>

			<footer className="site-footer">
				<div className="container footer-inner">
					<div className="social-links" aria-label="Social links">
						<a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" aria-label="Festa Italia on Facebook">
							<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
								<path d="M22 12a10 10 0 10-11.5 9.9v-7h-2.2v-2.9h2.2V9.3c0-2.2 1.3-3.4 3.3-3.4.96 0 1.97.17 1.97.17v2.2h-1.12c-1.1 0-1.44.68-1.44 1.38v1.66h2.45l-.39 2.9h-2.06v7A10 10 0 0022 12z" />
							</svg>
						</a>
						<a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Festa Italia on Instagram">
							<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
								<path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm5 6.1A4.9 4.9 0 1016.9 13 4.9 4.9 0 0012 8.1zm6.4-3.6a1.2 1.2 0 11-1.2 1.2 1.2 1.2 0 011.2-1.2z" />
							</svg>
						</a>
					</div>

					<p>Festa Italia Foundation, Inc. All rights reserved.</p>
				</div>
			</footer>
		</div>
	);
}