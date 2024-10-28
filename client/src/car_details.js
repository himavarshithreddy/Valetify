class CarDetails {
    constructor(data) {
      this.id = data._id;
      this.carNumber = data.carNumber;
      this.carBrand = data.carBrand;
      this.keyId = data.keyId;
      this.phoneNumber = data.phoneNumber;
      this.timestamp = data.createdAt ? new Date(data.createdAt) : new Date();
      this.isDelivered = data.isDelivered || false;
      this.isRequested = data.isRequested || false;
      this.shortCode = data.shortCode;
    }
  
    toJson() {
      return {
        carNumber: this.carNumber.toUpperCase(),
        carBrand: this.carBrand,
        keyId: this.keyId,
        phoneNumber: this.phoneNumber,
        createdAt: this.timestamp.toISOString(),
        isDelivered: this.isDelivered,
        isRequested: this.isRequested,
        shortCode: this.shortCode,
      };
    }
  
    static fromJson(json) {
      return new CarDetails(json);
    }
  }
  
  module.exports = CarDetails;