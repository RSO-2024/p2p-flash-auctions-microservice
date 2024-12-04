import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

interface DatabaseConfig {
  [key: string]: string;
}

// Define table names using environment variables
const dbConfig: DatabaseConfig = {
  p2pListingsTable: process.env.P2P_FP_TABLE || "none",
  usersTable: process.env.USERS_TABLE || "none"
};

// Export configuration
export const getTableName = (key: keyof DatabaseConfig): string => {
  if (!dbConfig[key]) {
    throw new Error(`Table name for ${key} is not defined in environment variables.`);
  }
  return dbConfig[key];
};

export default dbConfig;