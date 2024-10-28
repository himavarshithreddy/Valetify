import React, { useState, useEffect } from 'react';
import DatabaseService from './database_service';
import CarInputModal from './car_input_modal';

const HomeScreen = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [activeCars, setActiveCars] = useState([]);
  const [filteredCars, setFilteredCars] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadActiveCars();
  }, []);

  useEffect(() => {
    filterCars();
  }, [activeCars, searchQuery]);

  const loadActiveCars = async () => {
    setIsLoading(true);
    try {
      const cars = await DatabaseService.getActiveCars();
      setActiveCars(cars);
    } catch (error) {
      console.error('Error loading cars:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterCars = () => {
    const query = searchQuery.toLowerCase();
    const filtered = activeCars.filter((car) =>
      car.carNumber.toLowerCase().includes(query) ||
      car.carBrand.toLowerCase().includes(query) ||
      car.keyId.toLowerCase().includes(query)
    );

    // Sort cars to show requested cars first
    filtered.sort((a, b) => {
      if (a.isRequested && !b.isRequested) return -1;
      if (!a.isRequested && b.isRequested) return 1;
      return new Date(b.timestamp) - new Date(a.timestamp); // Then by timestamp
    });

    setFilteredCars(filtered);
  };

  const markAsDelivered = async (car) => {
    const confirmed = window.confirm(`Are you sure you want to mark ${car.carNumber} as delivered?`);
    if (confirmed) {
      try {
        await DatabaseService.markAsDelivered(car.id);
        await loadActiveCars();
        console.log(`Car ${car.carNumber} marked as delivered`);
      } catch (error) {
        console.error('Error updating car status:', error);
      }
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleModalClose = () => {
    setShowModal(false);
    loadActiveCars();
  };

  return (
    <div>
      <header>
        <h1>Active Cars</h1>
        <input
          type="text"
          placeholder="Search by car number, brand, or key ID"
          value={searchQuery}
          onChange={handleSearchChange}
        />
        <button onClick={() => setShowModal(true)}>Add New Car</button>
      </header>

      {isLoading ? (
        <div>Loading...</div>
      ) : filteredCars.length === 0 ? (
        <div>No active cars</div>
      ) : (
        <ul>
          {filteredCars.map((car) => (
            <li key={car.id}>
              <div>
                <h3>{car.carNumber}</h3>
                {car.isRequested && <span>REQUESTED</span>}
              </div>
              <p>Brand: {car.carBrand}</p>
              <p>Key ID: {car.keyId}</p>
              <p>Phone Number: {car.phoneNumber}</p>
              {car.shortCode && <p>Short Code: {car.shortCode}</p>}
              <p>Time: {car.timestamp.toLocaleTimeString()}</p>
              <button onClick={() => markAsDelivered(car)}>Delivered</button>
            </li>
          ))}
        </ul>
      )}

      {showModal && <CarInputModal onClose={handleModalClose} />}
    </div>
  );
};

export default HomeScreen;