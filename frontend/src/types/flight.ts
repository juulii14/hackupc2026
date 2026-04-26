export interface Destino {
  pais: string;
  ciudad: string;
}

export interface RecepcionInfo {
  num_imagenes: number;
  destinos: Destino[];
}

export interface FlightResultData {
  id: string;
  price: number;        // Cambiado a number para poder operar (sumar, filtrar)
  currency: string;     // Ej: "EUR"
  origin: string;       // Código IATA de origen
  destination: string;  // Código IATA de destino
  departure: string;    // ISO Date (ej: 2026-06-15T14:30:00)
  arrival: string;      // ISO Date
  stops: number;        // 0 para directo, 1+ para escalas
  airlineName: string;
  airlineLogo?: string; // URL de la imagen de la aerolínea
  durationMinutes: number;
  bookingUrl?: string;  // El enlace para que el usuario compre el vuelo
}