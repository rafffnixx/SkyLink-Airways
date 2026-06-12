import { flightService } from '../services/api.js';

const Flights = {
    async render(searchParams = '') {
        let flights = [];
        let searchInfo = '';
        
        try {
            const params = new URLSearchParams(searchParams);
            const filters = {};
            if (params.get('origin')) filters.origin = params.get('origin');
            if (params.get('destination')) filters.destination = params.get('destination');
            if (params.get('date')) filters.date = params.get('date');
            
            flights = await flightService.getAllFlights(filters);
            
            if (Object.keys(filters).length > 0) {
                searchInfo = `
                    <div class="alert alert-info" style="background: #DBEAFE; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                        <strong>Search Results:</strong> 
                        ${filters.origin ? `From ${filters.origin}` : ''} 
                        ${filters.destination ? `To ${filters.destination}` : ''} 
                        ${filters.date ? `on ${filters.date}` : ''}
                        <button onclick="window.App.navigateTo('flights')" style="margin-left: 1rem; padding: 0.25rem 0.5rem; background: #1D4ED8; color: white; border: none; border-radius: 4px; cursor: pointer;">Clear</button>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading flights:', error);
        }
        
        let flightsHtml = '<div class="flights-list">';
        
        if (flights.length === 0) {
            flightsHtml += `
                <div class="alert alert-info" style="text-align: center; padding: 3rem;">
                    <h3>No flights found</h3>
                    <p>Try different search criteria or check back later for more flights.</p>
                    <button onclick="window.App.navigateTo('home')" class="btn-primary" style="margin-top: 1rem;">Back to Home</button>
                </div>
            `;
        } else {
            flights.forEach(flight => {
                const price = (flight.base_price * flight.price_multiplier).toFixed(2);
                flightsHtml += `
                    <div class="flight-card">
                        <div class="flight-card-content">
                            <div style="display: flex; justify-content: space-between; align-items: start;">
                                <div>
                                    <h3>${flight.origin_code} → ${flight.dest_code}</h3>
                                    <p><strong>${flight.airline}</strong> - ${flight.flight_number}</p>
                                </div>
                                <span class="price">$${price}</span>
                            </div>
                            <div class="flight-details">
                                <div>
                                    <strong>Departure</strong><br>
                                    ${new Date(flight.departure_time).toLocaleString()}
                                </div>
                                <div>
                                    <strong>Arrival</strong><br>
                                    ${new Date(flight.arrival_time).toLocaleString()}
                                </div>
                                <div>
                                    <strong>Available Seats</strong><br>
                                    ${flight.available_seats} / ${flight.total_seats}
                                </div>
                            </div>
                            <div style="margin-top: 1rem;">
                                <button onclick="window.bookFlight(${flight.id})" class="btn-book" ${flight.available_seats === 0 ? 'disabled' : ''}>
                                    ${flight.available_seats === 0 ? 'Sold Out' : 'Book This Flight'}
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            });
        }
        
        flightsHtml += '</div>';
        
        return `
            <div class="container">
                <h1>Available Flights</h1>
                ${searchInfo}
                ${flightsHtml}
            </div>
        `;
    },
    
    attachEvents() {
        // Any flight-specific event handlers
    }
};

export default Flights;