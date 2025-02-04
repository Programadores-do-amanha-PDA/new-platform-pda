import { MongoClient, ServerApiVersion } from "mongodb";

const MONGO_API_BASE_URL = process.env.MONGO_API_BASE_URL;
const MONGO_USERNAME = process.env.MONGO_USERNAME;
const MONGO_USER_PASSWORD = process.env.MONGO_USER_PASSWORD;
const MONGO_APP_NAME = process.env.MONGO_DB_NAME;

const uri = `mongodb+srv://${MONGO_USERNAME}:${MONGO_USER_PASSWORD}@${MONGO_API_BASE_URL}/?retryWrites=true&w=majority&appName=${MONGO_APP_NAME}`;

export const mongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});