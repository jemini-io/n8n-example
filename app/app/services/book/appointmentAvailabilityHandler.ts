import { AuthService, TechnicianService, AppointmentService } from './services';
import { env } from "@/app/config/env";

const { servicetitan: { clientId, clientSecret, appKey, tenantId, technicianId }, environment } = env;

async function getAvailableTimeSlots(): Promise<any> {
    const authService = new AuthService(environment);
    const technicianService = new TechnicianService(environment);
    const appointmentService = new AppointmentService(environment);

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    // Get auth token
    const authToken = await authService.getAuthToken(clientId, clientSecret);

    // Fetch technician shifts
    const shiftsResponse = await technicianService.getTechShifts(authToken, appKey, tenantId, technicianId, todayStr);
    const shifts = shiftsResponse.data;

    // Filter shifts for the next 2 weeks
    const twoWeeksFromNow = new Date(today);
    twoWeeksFromNow.setDate(today.getDate() + 14);
    const filteredShifts = shifts.filter((shift: any) => {
        const shiftDate = new Date(shift.start);
        return shiftDate >= today && shiftDate <= twoWeeksFromNow;
    });

    // Fetch appointments
    const appointmentsResponse = await appointmentService.getAppointments(authToken, appKey, tenantId, todayStr, technicianId);
    const appointments = appointmentsResponse.data;

    // Process available time slots
    const availableTimeSlots: { date: string, timeSlots: string[] }[] = [];

    filteredShifts.forEach((shift: any) => {
        const shiftDate = new Date(shift.start).toISOString().split('T')[0];
        const shiftStart = new Date(shift.start);
        const shiftEnd = new Date(shift.end);

        // Create 30-minute blocks
        let currentTime = new Date(shiftStart);
        const timeSlots: string[] = [];

        while (currentTime < shiftEnd) {
            const currentTimeStr = currentTime.toISOString().split('T')[1].substring(0, 5);
            const nextTime = new Date(currentTime);
            nextTime.setMinutes(currentTime.getMinutes() + 30);

            // Check if the current time block is available
            const isAvailable = !appointments.some((appointment: any) => {
                const appointmentStart = new Date(appointment.arrivalWindowStart);
                const appointmentEnd = new Date(appointment.arrivalWindowEnd);
                return currentTime >= appointmentStart && currentTime < appointmentEnd;
            });

            // Add time slot if available and meets the criteria
            if (isAvailable && (shiftDate !== todayStr || currentTime > new Date(today.getTime() + 60 * 60 * 1000))) {
                timeSlots.push(currentTimeStr);
            }

            currentTime = nextTime;
        }

        if (timeSlots.length > 0) {
            availableTimeSlots.push({ date: shiftDate, timeSlots });
        }
    });

    console.log(availableTimeSlots);

    return availableTimeSlots;
}

export { getAvailableTimeSlots }; 