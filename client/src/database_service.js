const { MongoClient, ObjectId } = require('mongodb');
const MongoDBConfig = require('./mongodb_config');
const CarDetails = require('./car_details');

class DatabaseService {
  static instance = null;

  static getInstance() {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  constructor() {
    this.client = null;
    this.db = null;
  }

  async connect() {
    if (!this.client) {
      this.client = await MongoClient.connect(MongoDBConfig.connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      this.db = this.client.db(MongoDBConfig.dbName);
    }
  }

  async getActiveCars() {
    await this.connect();
    const cars = await this.db
      .collection(MongoDBConfig.carCollection)
      .find({ isDelivered: false })
      .toArray();

    return cars.map((doc) => CarDetails.fromJson({
      ...doc,
      _id: doc._id.toString(),
      isRequested: doc.isRequested || false,
    }));
  }

  async markAsDelivered(carId) {
    await this.connect();
    const objectId = new ObjectId(carId);
    await this.db.collection(MongoDBConfig.carCollection).updateOne(
      { _id: objectId },
      { $set: { isDelivered: true } }
    );
  }

  async saveCarDetails(carDetails) {
    await this.connect();
    const result = await this.db.collection(MongoDBConfig.carCollection).insertOne(carDetails.toJson());
    return result.insertedId.toString();
  }

  async generateUniqueKeyId() {
    const usedKeyIds = await this.getUsedKeyIds();
    let keyId;
    const random = () => Math.floor(Math.random() * 26) + 65; // Random alphabet A-Z
    const randomNumber = () => Math.floor(Math.random() * 100).toString().padStart(2, '0'); // Random number from 00 to 99

    do {
      keyId = String.fromCharCode(random()) + randomNumber();
    } while (usedKeyIds.includes(keyId));

    return keyId;
  }

  async getUsedKeyIds() {
    await this.connect();
    const cursor = await this.db
      .collection(MongoDBConfig.carCollection)
      .find({ isDelivered: false })
      .toArray();

    return cursor.map((doc) => doc.keyId);
  }

  async getExistingKeyIds() {
    await this.connect();
    const cars = await this.db
      .collection(MongoDBConfig.carCollection)
      .find({ isDelivered: false })
      .toArray();

    return new Set(cars.map((doc) => doc.keyId));
  }

  async isKeyIdTaken(keyId) {
    await this.connect();
    const count = await this.db
      .collection(MongoDBConfig.carCollection)
      .countDocuments({ keyId, isDelivered: false });
    return count > 0;
  }
}

module.exports = DatabaseService.getInstance();