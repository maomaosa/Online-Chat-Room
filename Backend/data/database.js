import pkg from "pg";
const { Client } = pkg;

const connectionString =
  "postgres://esndb_user:et7mC1o2lS6pkaqHFnT6eL1tu6unAwFo@dpg-cmu671uv3ddc738f944g-a.oregon-postgres.render.com/esndb";

const client = new Client({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

client
  .connect()
  .then(() => {
    // console.log("Connected to PostgreSQL");
  })
  .catch((error) => {
    console.error("Error connecting to PostgreSQL:", error);
  });

export default client;
