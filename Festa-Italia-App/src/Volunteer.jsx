import { useState } from 'react';
import './Volunteer.css';

export default function Volunteer() {
    const [selectedBooth, setSelectedBooth] = useState('');
    const [selectedSlots, setSelectedSlots] = useState([])

    const booths = [
        'Pasta/Arancini',
        'Steak/Sausage Sandwiches',
        'Coffee',
        'Beer and Wine',
        'Merchandice',
        'Pizza',
        'Ice Cream',
        'Canoli',
        'Calamri',
        'Tokens',
    ];

    // Generate hourly slots starting from 9:00 AM (1-hour increments)
    const startHour = 9
    const endHour = 20 // last slot will be 8:00 PM - 9:00 PM

    function formatRange(h) {
        const to12 = (n) => {
            const hour = ((n + 11) % 12) + 1
            const ampm = n < 12 ? 'AM' : 'PM'
            return `${hour}:00 ${ampm}`
        }
        return `${to12(h)} - ${to12(h + 1)}`
    }

    const scheduleData = []
    for (let h = startHour; h <= endHour; h++) {
        scheduleData.push({ id: h, friday: formatRange(h), saturday: formatRange(h), sunday: formatRange(h) })
    }

    function toggleSlot(day, hour) {
        const key = `${day}-${hour}`
        setSelectedSlots(prev => {
            const exists = prev.includes(key)
            if (exists) return prev.filter(p => p !== key)
            return [...prev, key]
        })
    }

    function signUpForSelected() {
        if (selectedBooth === ''){
            alert('Please select a booth')
            return
        }
        if (selectedSlots.length === 0) {
            alert('Please select at least one time slot to sign up.')
            return
        }
        // Placeholder behavior: show chosen slots
        alert('Signing up for:\n' + selectedSlots.join('\n'))
    }

    return (
        <div className="volunteer-container">
            <h1 className="volunteer-title">Volunteer Page</h1>

            <div className="volunteer-section">
                <select
                    id="booth-dropdown"
                    className="booth-dropdown"
                    value={selectedBooth}
                    onChange={(e) => setSelectedBooth(e.target.value)}
                >
                    <option value="">-- Select a booth --</option>
                    {booths.map((booth, index) => (
                        <option key={index} value={booth}>
                            {booth}
                        </option>
                    ))}
                </select>
            </div>

            <div className="schedule-wrapper">
                <table className="schedule-table">
                    <thead>
                        <tr>
                            <th>Friday</th>
                            <th>Saturday</th>
                            <th>Sunday</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scheduleData.map((row) => (
                            <tr key={row.id}>
                                <td className={selectedSlots.includes(`friday-${row.id}`) ? 'selected' : ''} onClick={() => toggleSlot('friday', row.id)}>{row.friday}</td>
                                <td className={selectedSlots.includes(`saturday-${row.id}`) ? 'selected' : ''} onClick={() => toggleSlot('saturday', row.id)}>{row.saturday}</td>
                                <td className={selectedSlots.includes(`sunday-${row.id}`) ? 'selected' : ''} onClick={() => toggleSlot('sunday', row.id)}>{row.sunday}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div style={{textAlign:'right', marginTop: '1rem'}}>
                <button className="signup-button" onClick={signUpForSelected}>Sign up for selected times</button>
            </div>
        </div>
    );
}
