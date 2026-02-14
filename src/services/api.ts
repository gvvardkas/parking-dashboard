import {
  ValidateAccessResponse,
  CheckSessionResponse,
  Spot,
  AddSpotResponse,
  VerifyPinResponse,
  UpdateSpotResponse,
  DeleteSpotResponse,
  RentSpotResponse,
  RenterInfo
} from '../types';
import { CONFIG } from '../config/constants';
import { getSession } from '../utils/session';

export const api = {
  async validateAccess(code: string): Promise<ValidateAccessResponse> {
    try {
      const params = new URLSearchParams({ action: 'validateAccess', code });
      const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?${params.toString()}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async checkSession(version: number): Promise<CheckSessionResponse> {
    try {
      const params = new URLSearchParams({ action: 'checkSession', version: String(version) });
      const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?${params.toString()}`);
      return await response.json();
    } catch (error) {
      return { valid: false };
    }
  },

  async fetchSpots(): Promise<Spot[]> {
    try {
      const response = await fetch(CONFIG.GOOGLE_SCRIPT_URL + '?action=getSpots');
      const data = await response.json();
      return data.spots as Spot[];
    } catch (error) {
      console.error('Error fetching spots:', error);
      return []
    }
  },

  async addSpot(spotData: {
    venmo: string;
    email: string;
    phone: string;
    spotNumber: string;
    size: string;
    floor: string;
    notes: string;
    availableFrom: string;
    availableTo: string;
    pricePerDay: number;
    pin: string;
  }): Promise<AddSpotResponse> {
    try {
      const session = getSession();
      const params = new URLSearchParams({
        action: 'addSpot',
        accessCode: session?.code || '',
        data: JSON.stringify(spotData)
      });
      const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?${params.toString()}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async verifyPin(spotId: string, pin: string): Promise<VerifyPinResponse> {
    try {
      const session = getSession();
      const params = new URLSearchParams({
        action: 'verifyPin',
        accessCode: session?.code || '',
        spotId,
        pin
      });
      const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?${params.toString()}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async updateSpot(
    spotId: string,
    pin: string,
    spotData: {
      venmo: string;
      email: string;
      phone: string;
      spotNumber: string;
      size: string;
      floor: string;
      notes: string;
      availableFrom: string;
      availableTo: string;
      pricePerDay: number;
    }
  ): Promise<UpdateSpotResponse> {
    try {
      const session = getSession();
      const params = new URLSearchParams({
        action: 'updateSpot',
        accessCode: session?.code || '',
        spotId,
        pin,
        data: JSON.stringify(spotData)
      });
      const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?${params.toString()}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  async deleteSpot(spotId: string, pin: string): Promise<DeleteSpotResponse> {
    try {
      const session = getSession();
      const params = new URLSearchParams({
        action: 'deleteSpot',
        accessCode: session?.code || '',
        spotId,
        pin
      });
      const response = await fetch(`${CONFIG.GOOGLE_SCRIPT_URL}?${params.toString()}`);
      return await response.json();
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  // FIXED: Use POST request for rentSpot because screenshots are too large for URL parameters
  async rentSpot(
    spotId: string,
    startDateTime: string,
    endDateTime: string,
    renterInfo: RenterInfo
  ): Promise<RentSpotResponse> {
    try {
      const session = getSession();
      const url = CONFIG.GOOGLE_SCRIPT_URL;
      
      if (!url) {
        return { success: false, error: 'API URL not configured' };
      }
      
      // Use POST request to handle large screenshot data
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain', // Google Apps Script requires text/plain for CORS
        },
        body: JSON.stringify({
          action: 'rentSpot',
          accessCode: session?.code || '',
          spotId,
          startDateTime,
          endDateTime,
          renterInfo: renterInfo // Include the full renterInfo object with screenshot
        })
      });
      
      return await response.json();
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
};
