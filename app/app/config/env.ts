const getEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const env = {
  environment: "integration",
  stripe: {
    secretKey: "",
    publishableKey: "",
    priceId: "",
  },
  servicetitan: {
    clientId: "",
    clientSecret: "",
    appKey: "",
    tenantId: "989893806",
    technicianId: "34365881",
  },
} as const; 
