import DatabaseManager from "../data/DatabaseManager.js";

class UserAppointmentData {
  static async scheduleAppointment(dateTimeString, reserver_id, receivee_id) {
    function toUnixTimestamp(dateTimeString, type) {
      const parts = dateTimeString.split(" ");
      const timePart = parts[0];
      const datePart = parts[1];

      const times = timePart.split("-");
      const startTime = times[0];
      const endTime = times[1];

      const dateTime =
        type === "start"
          ? `${datePart} ${startTime}`
          : `${datePart} ${endTime}`;

      const [day, month, year] = datePart.split("/");
      const [hour, minute] = (type === "start" ? startTime : endTime).split(
        ":"
      );

      // JavaScript Date interprets dates in "month day, year" format
      const date = new Date(`${month} ${day}, ${year} ${hour}:${minute}:00`);

      // Assuming the server is running in UTC
      return Math.floor(date.getTime() / 1000);
    }
    const startTimestamp = toUnixTimestamp(dateTimeString, "start");
    const endTimestamp = toUnixTimestamp(dateTimeString, "end");
    const sqlQuery = `
    INSERT INTO esn_appointment (reserver_id, reservee_id, start_schedule_date, end_schedule_date) 
    VALUES ($1, $2, $3, $4) RETURNING *`;
    const values = [reserver_id, receivee_id, startTimestamp, endTimestamp];

    try {
      const result = await DatabaseManager.getDb().query(sqlQuery, values);
      return result.rows[0];
    } catch (error) {
      throw new Error("Error scheduling appointment: " + error.message);
    }
  }
}

export default UserAppointmentData;
