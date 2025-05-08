const getEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const env = {
  stripe: {
    secretKey: getEnvVar('STRIPE_SECRET_KEY'),
    publishableKey: getEnvVar('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'),
    priceId: getEnvVar('STRIPE_PRICE_ID'),
  },
} as const; 
