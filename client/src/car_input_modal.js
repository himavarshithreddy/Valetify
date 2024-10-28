import React, { useState } from 'react';
import DatabaseService from './database_service';

const CarInputModal = ({ onClose }) => {
  const [carNumber, setCarNumber] = useState('');
  const [carBrand, setCarBrand] = useState('');
  const [keyId, setKeyId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const isTaken = await DatabaseService.isKeyIdTaken(keyId);
      if (isTaken) {
        alert('Key ID is already taken. Please enter a unique Key ID.');
        setIsLoading(false);
        return;
      }

      const carDetails = new CarDetails({
        carNumber: carNumber.toUpperCase(),
        carBrand,
        keyId,
        phoneNumber,
      });

      const carId = await DatabaseService.saveCarDetails(carDetails);
      await generateLink(carId);

      console.log('Car details saved successfully');
      onClose();
    } catch (error) {
      console.error('Error saving car details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateLink = async (carId) => {
    try {
      const response = await fetch(`/api/generate-link/${carId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      if (response.ok) {
        const data = await response.json();
        const link = data.link;

        if (link) {
          showLinkDialog(link);
        } else {
          throw new Error('Generated link is empty or null');
        }
      } else {
        throw new Error(`Server returned status code ${response.status}`);
      }
    } catch (error) {
      console.error('Error generating link:', error);
    }
  };

  const showLinkDialog = (link) => {
    // Show a dialog or modal with the generated link and QR code
    // You can use a library like react-qrcode for generating the QR code
    console.log('Generated link:', link);
  };

  const handleKeyIdGeneration = async () => {
    const newKeyId = await DatabaseService.generateUniqueKeyId();
    setKeyId(newKeyId);
  };

  return (
    <div>
      <h2>New Car Entry</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Car Number:
          <input
            type="text"
            value={carNumber}
            onChange={(event) => setCarNumber(event.target.value)}
            required
          />
        </label>
        <label>
          Car Brand:
          <input
            type="text"
            value={carBrand}
            onChange={(event) => setCarBrand(event.target.value)}
            required
          />
        </label>
        <label>
          Key ID:
          <div>
            <input
              type="text"
              value={keyId}
              onChange={(event) => setKeyId(event.target.value)}
              required
            />
            <button type="button" onClick={handleKeyIdGeneration}>
              Generate
            </button>
          </div>
        </label>
        <label>
          Customer Phone Number:
          <input
            type="text"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            required
          />
        </label>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Details & Generate Link'}
        </button>
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </form>
    </div>
  );
};

export default CarInputModal;