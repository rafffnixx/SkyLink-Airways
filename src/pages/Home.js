import { flightService } from '../services/api.js';

const Home = {
    async render() {
        let flightsHtml = '<div class="container"><h2>Popular Flights</h2><div class="flights-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem; margin-top: 2rem;">';
        
        try {
            const flights = await flightService.getAllFlights();
            const recentFlights = flights.slice(0, 6);
            
            if (recentFlights.length === 0) {
                flightsHtml += '<p>No flights available at the moment. Please check back later.</p>';
            } else {
                recentFlights.forEach(flight => {
                    const price = (flight.base_price * flight.price_multiplier).toFixed(2);
                    flightsHtml += `
                        <div class="flight-card">
                            <div class="flight-card-content">
                                <div class="flight-route">
                                    <span class="airport-code">${flight.origin_code || 'N/A'}</span>
                                    <span>✈️</span>
                                    <span class="airport-code">${flight.dest_code || 'N/A'}</span>
                                </div>
                                <div class="flight-details">
                                    <div><strong>${flight.airline || 'Unknown'}</strong></div>
                                    <div>Flight: ${flight.flight_number || 'N/A'}</div>
                                    <div>Departure: ${new Date(flight.departure_time).toLocaleString()}</div>
                                    <div>Arrival: ${new Date(flight.arrival_time).toLocaleString()}</div>
                                    <div>Available: ${flight.available_seats}/${flight.total_seats} seats</div>
                                </div>
                                <div class="flight-info">
                                    <span class="price">$${price}</span>
                                    <button onclick="window.bookFlight(${flight.id})" class="btn-book" ${flight.available_seats === 0 ? 'disabled' : ''}>Book Now</button>
                                </div>
                            </div>
                        </div>
                    `;
                });
            }
        } catch (error) {
            console.error('Error loading flights:', error);
            flightsHtml += '<p class="error">Unable to load flights. Please make sure the backend server is running.</p>';
        }
        
        flightsHtml += '</div></div>';
        
        return `
            <section class="hero">
                <div class="hero-content">
                    <h1>Welcome to SkyLink Airways</h1>
                    <p>Experience luxury travel at affordable prices. Book your next adventure with us!</p>
                </div>
                <div class="search-form">
                    <h3 style="margin-bottom: 1rem; color: #0A2342;">Search Flights</h3>
                    <form id="search-flight-form">
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 1rem;">
                            <div class="form-group">
                                <label>From</label>
                                <input type="text" id="origin" placeholder="Origin Airport Code (e.g., JFK)">
                            </div>
                            <div class="form-group">
                                <label>To</label>
                                <input type="text" id="destination" placeholder="Destination Airport Code (e.g., LAX)">
                            </div>
                            <div class="form-group">
                                <label>Date</label>
                                <input type="date" id="date">
                            </div>
                            <div class="form-group">
                                <label>&nbsp;</label>
                                <button type="submit" class="btn-primary">Search Flights</button>
                            </div>
                        </div>
                    </form>
                </div>
            </section>
            ${flightsHtml}
        `;
    },
    
    attachEvents() {
        const searchForm = document.getElementById('search-flight-form');
        if (searchForm) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const origin = document.getElementById('origin').value;
                const destination = document.getElementById('destination').value;
                const date = document.getElementById('date').value;
                
                const params = new URLSearchParams();
                if (origin) params.append('origin', origin.toUpperCase());
                if (destination) params.append('destination', destination.toUpperCase());
                if (date) params.append('date', date);
                
                if (window.App && typeof window.App.navigateTo === 'function') {
                    window.App.navigateTo('flights', params.toString());
                }
            });
        }
    }
};

export default Home;