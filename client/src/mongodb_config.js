const dotenv = require('dotenv');
dotenv.config();

const MongoDBConfig = {
  username: process.env.MONGODB_USERNAME || 'default_username',
  password: process.env.MONGODB_PASSWORD || 'default_password',
  cluster: 'smartvalet.0br3z.mongodb.net',
  dbName: 'smartvalet',
  serverUrl: 'smartvalet.vercel.app',
  carCollection: 'cars',
  get connectionString() {
    return `mongodb+srv://${this.username}:${this.password}@${this.cluster}/${this.dbName}?retryWrites=true&w=majority&appName=SmartValet`;
  },
};

module.exports = MongoDBConfig;