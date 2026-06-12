import { flightService } from '../services/api.js';

const Home = {
    async render() {
        // Show loading spinner while fetching flights
        let flightsHtml = `
            <div class="container">
                <h2>Popular Flights</h2>
                <div class="loading-spinner" style="text-align: center; padding: 3rem;"></div>
            </div>
        `;
        
        try {
            const flights = await flightService.getAllFlights();
            const recentFlights = flights.slice(0, 6);
            
            if (recentFlights.length === 0) {
                flightsHtml = `
                    <div class="container">
                        <h2>Popular Flights</h2>
                        <div class="empty-state" style="text-align: center; padding: 3rem;">
                            <p>No flights available at the moment. Please check back later.</p>
                        </div>
                    </div>
                `;
            } else {
                let flightsCardsHtml = '';
                recentFlights.forEach(flight => {
                    const price = (flight.base_price * flight.price_multiplier).toFixed(2);
                    const departureDate = new Date(flight.departure_time);
                    const arrivalDate = new Date(flight.arrival_time);
                    
                    flightsCardsHtml += `
                        <div class="flight-card">
                            <div class="flight-card-content">
                                <div class="flight-route">
                                    <span class="airport-code">${flight.origin_code || 'N/A'}</span>
                                    <span class="flight-arrow">✈️</span>
                                    <span class="airport-code">${flight.dest_code || 'N/A'}</span>
                                </div>
                                <div class="flight-airline">
                                    <strong>${flight.airline || 'Unknown'}</strong>
                                    <span class="flight-number">${flight.flight_number || 'N/A'}</span>
                                </div>
                                <div class="flight-details">
                                    <div class="flight-time">
                                        <span class="time-label">Departure</span>
                                        <span class="time-value">${departureDate.toLocaleDateString()} ${departureDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <div class="flight-time">
                                        <span class="time-label">Arrival</span>
                                        <span class="time-value">${arrivalDate.toLocaleDateString()} ${arrivalDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                    </div>
                                    <div class="flight-seats">
                                        <span class="seats-label">Available Seats</span>
                                        <span class="seats-value">${flight.available_seats}/${flight.total_seats}</span>
                                    </div>
                                </div>
                                <div class="flight-info">
                                    <span class="price">$${price}</span>
                                    <button onclick="window.bookFlight(${flight.id})" class="btn-book" ${flight.available_seats === 0 ? 'disabled' : ''}>
                                        ${flight.available_seats === 0 ? 'Sold Out' : 'Book Now'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                });
                
                flightsHtml = `
                    <div class="container">
                        <h2>Popular Flights</h2>
                        <div class="flights-grid">
                            ${flightsCardsHtml}
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading flights:', error);
            flightsHtml = `
                <div class="container">
                    <h2>Popular Flights</h2>
                    <div class="error-state" style="text-align: center; padding: 3rem;">
                        <p>⚠️ Unable to load flights. Please make sure the backend server is running.</p>
                        <button onclick="window.location.reload()" class="btn-primary" style="margin-top: 1rem;">Retry</button>
                    </div>
                </div>
            `;
        }
        
        return `
            <section class="hero">
                <div class="hero-content">
                    <h1>Welcome to SkyLink Airways</h1>
                    <p>Experience luxury travel at affordable prices. Book your next adventure with us!</p>
                </div>
                <div class="search-form">
                    <h3>Search Flights</h3>
                    <form id="search-flight-form">
                        <div class="search-grid">
                            <div class="form-group">
                                <label>From</label>
                                <input type="text" id="origin" placeholder="e.g., JFK" autocomplete="off">
                            </div>
                            <div class="form-group">
                                <label>To</label>
                                <input type="text" id="destination" placeholder="e.g., LAX" autocomplete="off">
                            </div>
                            <div class="form-group">
                                <label>Date</label>
                                <input type="date" id="date">
                            </div>
                            <div class="form-group search-btn-group">
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
                if (origin) params.append('origin', origin.toUpperCase().trim());
                if (destination) params.append('destination', destination.toUpperCase().trim());
                if (date) params.append('date', date);
                
                if (window.App && typeof window.App.navigateTo === 'function') {
                    window.App.navigateTo('flights', params.toString());
                }
            });
        }
    }
};

export default Home;