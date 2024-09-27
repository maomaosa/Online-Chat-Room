import UserAppointmentData from "../model/UserAppointmentData.js";

class UserAppointmentService {
  static isDateFormatted(time) {
    const dateTimeRegex =
      /^\d{2}:\d{2}-\d{2}:\d{2} \d{2}\/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\/\d{4}$/;

    return dateTimeRegex.test(time);
  }

  static async scheduleAppointment(req, res) {
    try {
      const { time, receiver_id, receivee_id } = req.body;
      if (UserAppointmentService.isDateFormatted(time)) {
        const appointment = await UserAppointmentData.scheduleAppointment(
          time,
          receiver_id,
          receivee_id
        );
        res.status(201).json({ appointment, format: "format great" });
        return;
      } else {
        res.status(400).send("format not match");
        return;
      }
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  }
}

export default UserAppointmentService;
