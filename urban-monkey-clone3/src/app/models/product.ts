export interface Product {
  id: number;
  name: string;
  subtitle?: string;
  img: string;
  category?: string;
  color?: string;
  material?: string;
  size?: string;
  rating?: number;
  bestFor?: string[];      // e.g. ['Adventure','Running']
  frameSize?: string;      // LARGE / MEDIUM
  frameType?: string;      // EYEGLASSES / SUNGLASSES
  frameStyle?: string;     // RECTANGLE / SQUARE / OVAL / TEARDROP
  price: number;
  oldPrice?: number;
  inStock?: boolean;
  createdAt?: string;      // ISO date
}
