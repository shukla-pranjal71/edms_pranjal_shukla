
import { countries } from '@/data/hardcodedData';

export interface Country {
  id: number;
  name: string;
  created_at: string;
}

// Simulate async operations with promises
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, 100));

export const countryService = {
  // Get all countries
  async getAllCountries(): Promise<Country[]> {
    await simulateDelay();
    console.log('Returning hardcoded countries:', countries);
    return [...countries];
  },
  
  // Create a new country
  async createCountry(name: string): Promise<Country | null> {
    await simulateDelay();
    
    const newCountry: Country = {
      id: Math.max(...countries.map(c => c.id)) + 1,
      name: name.trim(),
      created_at: new Date().toISOString()
    };
    
    countries.push(newCountry);
    console.log('Created new country:', newCountry);
    return newCountry;
  },
  
  // Update a country
  async updateCountry(id: number, name: string): Promise<void> {
    await simulateDelay();
    
    const countryIndex = countries.findIndex(c => c.id === id);
    if (countryIndex !== -1) {
      countries[countryIndex].name = name.trim();
      console.log('Updated country:', countries[countryIndex]);
    }
  },
  
  // Delete a country
  async deleteCountry(id: number): Promise<void> {
    await simulateDelay();
    
    const countryIndex = countries.findIndex(c => c.id === id);
    if (countryIndex !== -1) {
      const deletedCountry = countries.splice(countryIndex, 1)[0];
      console.log('Deleted country:', deletedCountry);
    }
  }
};
