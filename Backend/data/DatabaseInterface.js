//define basic database interface
class DatabaseInterface {
  async connect() {
    // connect to the database
  }

  async disconnect() {
    // disconnect from the database
  }

  async query(sqlQuery, values) {
    // query the database
  }
}
export default DatabaseInterface;
