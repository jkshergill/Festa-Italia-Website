import React, { useState, useMemo } from 'react';
import './HomePage.css';
import './Donation.css';

export default function Donation() {
	// start and end date parts: month (1-12), day (1-31), year (e.g., 2025)
	const [start, setStart] = useState({ month: '', day: '', year: '' });
	const [end, setEnd] = useState({ month: '', day: '', year: '' });

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

	function onStartChange(field, value) {
		setStart(prev => {
			const next = { ...prev, [field]: value };
			// if month or year changed, ensure day is still valid
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

	return (
		<div className="page-root">
			<main>
				<section className="container section">
					<h1 className="page-title">Recognizing Our Donors</h1>

					<p className="donation-intro">Donations from {formatParts(start)} - {formatParts(end)}</p>

					<div className="date-controls" aria-label="Filter donations by date">
						<fieldset className="date-group" aria-labelledby="start-label">
							<legend id="start-label" className="sr-only">Start date</legend>
							<div className="date-field">
								<label className="sr-only" htmlFor="start-month">Start month</label>
								<select id="start-month" value={start.month} onChange={(e) => onStartChange('month', e.target.value)} aria-label="Start month">
									<option value="">Month</option>
									{Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
										<option key={m} value={m}>{m}</option>
									))}
								</select>
							</div>

							<div className="date-field">
								<label className="sr-only" htmlFor="start-day">Start day</label>
								<select id="start-day" value={start.day} onChange={(e) => onStartChange('day', e.target.value)} aria-label="Start day" disabled={!start.month || !start.year}>
									<option value="">Day</option>
									{(() => {
										const max = daysInMonth(start.year || currentYear, start.month || 1);
										return Array.from({ length: max }, (_, i) => i + 1).map(d => (
											<option key={d} value={d}>{d}</option>
										));
									})()}
								</select>
							</div>

							<div className="date-field">
								<label className="sr-only" htmlFor="start-year">Start year</label>
								<select id="start-year" value={start.year} onChange={(e) => onStartChange('year', e.target.value)} aria-label="Start year">
									<option value="">Year</option>
									{years.map(y => <option key={y} value={y}>{y}</option>)}
								</select>
							</div>
						</fieldset>

						<fieldset className="date-group" aria-labelledby="end-label">
							<legend id="end-label" className="sr-only">End date</legend>
							<div className="date-field">
								<label className="sr-only" htmlFor="end-month">End month</label>
								<select id="end-month" value={end.month} onChange={(e) => onEndChange('month', e.target.value)} aria-label="End month">
									<option value="">Month</option>
									{Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
										<option key={m} value={m}>{m}</option>
									))}
								</select>
							</div>

							<div className="date-field">
								<label className="sr-only" htmlFor="end-day">End day</label>
								<select id="end-day" value={end.day} onChange={(e) => onEndChange('day', e.target.value)} aria-label="End day" disabled={!end.month || !end.year}>
									<option value="">Day</option>
									{(() => {
										const max = daysInMonth(end.year || currentYear, end.month || 1);
										return Array.from({ length: max }, (_, i) => i + 1).map(d => (
											<option key={d} value={d}>{d}</option>
										));
									})()}
								</select>
							</div>

							<div className="date-field">
								<label className="sr-only" htmlFor="end-year">End year</label>
								<select id="end-year" value={end.year} onChange={(e) => onEndChange('year', e.target.value)} aria-label="End year">
									<option value="">Year</option>
									{years.map(y => <option key={y} value={y}>{y}</option>)}
								</select>
							</div>
						</fieldset>
					</div>

					{/* Sponsors section: logos with optional sponsor notes */}
					<section className="sponsors section">
						<h2>Thank You!</h2>
						<p className="sponsors-desc">We gratefully acknowledge organizations that support Festa Italia.</p>

						<div className="sponsor-grid">
							{[
								{ id: 1, name: 'Acme Co.', logo: '/images/sponsor1.png', note: 'Proud supporter of local culture.' },
								{ id: 2, name: 'Marina Foods', logo: '/images/sponsor2.png', note: 'Feeding our community since 1985.' },
								{ id: 3, name: 'Bell Construction', logo: '/images/sponsor3.png', note: '' },
								{ id: 4, name: 'Coral Bank', logo: '/images/sponsor4.png', note: 'Supporting scholarships and youth programs.' }
							].map(s => (
								<div key={s.id} className="sponsor-card" aria-label={`Sponsor ${s.name}`}>
									<div className="sponsor-logo-wrap">
										<img src={s.logo} alt={`${s.name} logo`} />
									</div>
									{ s.note && <p className="sponsor-note">{s.note}</p> }
								</div>
							))}

							
						</div>
					</section>
				</section>
			</main>

				{/* Floating donate heart (bottom-left) */}
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
