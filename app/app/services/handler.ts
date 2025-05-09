import { AuthService, TechnicianService, AppointmentService, CustomerService, JobService } from './services';
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

    // Filter shifts for the next 2 weeks, including today
    const twoWeeksFromNow = new Date(today);
    twoWeeksFromNow.setDate(today.getDate() + 14);
    const filteredShifts = shifts.filter((shift: any) => {
        const shiftDate = new Date(shift.start);
        // Include today's shifts by comparing only the date part
        return shiftDate.toISOString().split('T')[0] >= todayStr && shiftDate <= twoWeeksFromNow;
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
            const oneHourFromNow = new Date(today.getTime() + 60 * 60 * 1000);
            if (isAvailable && (shiftDate !== todayStr || currentTime > oneHourFromNow)) {
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

async function createJobAppointmentHandler(name: string, email: string, phone: string, startTime: string, endTime: string): Promise<any> {
    const authService = new AuthService(environment);
    const customerService = new CustomerService(environment);
    const jobService = new JobService(environment);

    // Get auth token
    const authToken = await authService.getAuthToken(clientId, clientSecret);

    // Create customer data with the specified structure
    const customerData = {
        name,
        type: "Residential",
        doNotMail: true,
        doNotService: false,
        locations: [{
            name: `${name} Residence`,
            address: {
                street: "123 Test",
                unit: "",
                city: "Test",
                state: "TX",
                zip: "12345",
                country: "USA"
            },
            contacts: [
                {
                    type: "Phone",
                    value: phone,
                    memo: null
                },
                {
                    type: "Email",
                    value: email,
                    memo: null
                }
            ]
        }],
        address: {
            street: "123 Test",
            unit: "",
            city: "Test",
            state: "TX",
            zip: "12345",
            country: "USA"
        }
    };

    // Create customer
    const customerResponse = await customerService.createCustomer(authToken, appKey, tenantId, customerData);
    const customerId = customerResponse.id;
    const locationId = customerResponse.locations[0].id;

    // Create job
    const jobData = {
        customerId,
        locationId,
        businessUnitId: 4282891, //TODO: Make this dynamic
        jobTypeId: 1689, //TODO: Make this dynamic
        priority: "Normal", //TODO: Make this dynamic
        campaignId: 49668727, //TODO: Make this dynamic
        appointments: [{
            start: startTime,
            end: endTime,
            arrivalWindowStart: startTime,
            arrivalWindowEnd: endTime,
            technicianIds: [technicianId]
        }],
        summary: "Jemini test of services" //TODO: Make this dynamic
    };

    const jobResponse = await jobService.createJob(authToken, appKey, tenantId, jobData);
    return jobResponse;
}

export { getAvailableTimeSlots, createJobAppointmentHandler }; 