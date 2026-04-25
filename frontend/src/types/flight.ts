export interface Destino {
  pais: string;
  ciudad: string;
}

export interface RecepcionInfo {
  num_imagenes: number;
  destinos: Destino[];
}

export interface FlightResult {
  ciudad: string;
  precio?: string;
  error?: string;
}