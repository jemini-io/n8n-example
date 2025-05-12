import axios from 'axios';

class AuthService {
    private baseUrl: string;

    constructor(environment: string) {
        this.baseUrl = environment === 'prod' ? 'https://auth.servicetitan.io' : 'https://auth-integration.servicetitan.io';
    }

    async getAuthToken(clientId: string, clientSecret: string): Promise<string> {
        const url = `${this.baseUrl}/connect/token`;
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        };
        const data = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        });

        const response = await axios.post(url, data, { headers });
        return response.data.access_token;
    }
}

class CustomerService {
    private baseUrl: string;

    constructor(environment: string) {
        this.baseUrl = environment === 'prod' ? 'https://api.servicetitan.io' : 'https://api-integration.servicetitan.io';
    }

    async createCustomer(authToken: string, appKey: string, tenantId: string, customerData: object): Promise<any> {
        const url = `${this.baseUrl}/crm/v2/tenant/${tenantId}/customers`;
        const headers = {
            'ST-App-Key': appKey,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        };

        const response = await axios.post(url, customerData, { headers });
        return response.data;
    }
}

class JobService {
    private baseUrl: string;

    constructor(environment: string) {
        this.baseUrl = environment === 'prod' ? 'https://api.servicetitan.io' : 'https://api-integration.servicetitan.io';
    }

    async createJob(authToken: string, appKey: string, tenantId: string, jobData: object): Promise<any> {
        const url = `${this.baseUrl}/jpm/v2/tenant/${tenantId}/jobs`;
        const headers = {
            'ST-App-Key': appKey,
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`
        };

        const response = await axios.post(url, jobData, { headers });
        return response.data;
    }

    async getJob(authToken: string, appKey: string, tenantId: string, technicianId: string, customerId: string, appointmentStartsOnOrAfter: string, appointmentStartsBefore: string): Promise<any> {
        const url = `${this.baseUrl}/jpm/v2/tenant/${tenantId}/jobs?technicianId=${technicianId}&customerId=${customerId}&appointmentStartsOnOrAfter=${appointmentStartsOnOrAfter}&appointmentStartsBefore=${appointmentStartsBefore}`;
        const headers = {
            'ST-App-Key': appKey,
            'Authorization': `Bearer ${authToken}`
        };

        const response = await axios.get(url, { headers });
        return response.data;
    }
}

class TechnicianService {
    private baseUrl: string;

    constructor(environment: string) {
        this.baseUrl = environment === 'prod' ? 'https://api.servicetitan.io' : 'https://api-integration.servicetitan.io';
    }

    async getTechShifts(authToken: string, appKey: string, tenantId: string, technicianId: string, startsOnOrAfter: string): Promise<any> {
        const url = `${this.baseUrl}/dispatch/v2/tenant/${tenantId}/technician-shifts?technicianId=${technicianId}&startsOnOrAfter=${startsOnOrAfter}`;
        const headers = {
            'ST-App-Key': appKey,
            'Authorization': `Bearer ${authToken}`
        };

        const response = await axios.get(url, { headers });
        return response.data;
    }
}

class AppointmentService {
    private baseUrl: string;

    constructor(environment: string) {
        this.baseUrl = environment === 'prod' ? 'https://api.servicetitan.io' : 'https://api-integration.servicetitan.io';
    }

    async getAppointments(authToken: string, appKey: string, tenantId: string, startsOnOrAfter: string, technicianId: string): Promise<any> {
        const url = `${this.baseUrl}/jpm/v2/tenant/${tenantId}/appointments?startsOnOrAfter=${startsOnOrAfter}&technicianId=${technicianId}`;
        const headers = {
            'ST-App-Key': appKey,
            'Authorization': `Bearer ${authToken}`
        };

        const response = await axios.get(url, { headers });
        return response.data;
    }
}

export { AuthService, CustomerService, JobService, TechnicianService, AppointmentService }; 