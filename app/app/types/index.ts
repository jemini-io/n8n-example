export interface FormData {
  name: string;
  phone: string;
  email: string;
}

export interface BookRequest extends FormData {
  successUrl: string;
  cancelUrl: string;
}

export interface BookResponse {
  sessionUrl: string;
}

export interface ErrorResponse {
  error: string;
} 