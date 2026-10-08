// Testimonials live in src/content/testimonials.json (dashboard → آراء العملاء).
import data from "@/content/testimonials.json";

export type Testimonial = {
  name: string;
  project: string;
  quote: string;
  rating: number; // out of 5
};

export const testimonials: Testimonial[] = data.items;
export const testimonialStats = data.stats;
