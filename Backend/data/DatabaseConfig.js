//based on name create a database object and return it
import PostgresAdaptor from "./PostgresAdaptor.js";

const dbConfig = {
  esn_test: {
    connectionString:
      "postgres://ens_test_user:hemD3PDp7kbBP3fIIkseYP1xrR2bwOEj@dpg-cncifeen7f5s73bgvscg-a.oregon-postgres.render.com/ens_test",
  },

  esndb: {
    connectionString:
      "postgres://esndb_user:et7mC1o2lS6pkaqHFnT6eL1tu6unAwFo@dpg-cmu671uv3ddc738f944g-a.oregon-postgres.render.com/esndb",
  },
};

class DatabaseConfig {
  static createDatabase(databaseName) {
    switch (databaseName) {
      case "esn_test":
        return new PostgresAdaptor(dbConfig.esn_test.connectionString);
      case "esndb":
        return new PostgresAdaptor(dbConfig.esndb.connectionString);
      default:
        throw new Error("Database not found");
    }
  }
}

export default DatabaseConfig;
