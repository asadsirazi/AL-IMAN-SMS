
import { StudentData, ApiResponse, SettingsData, AcademicRecord } from '../types';

const API_URL = 'https://script.google.com/macros/s/AKfycbxDvUdsElKlXcYXK69DOC544C7iuYrliLD9x1VD7Ty7-XNPnEjFi84O1NfOwEAPG3c2/exec';
const AUTH_API_URL = 'https://script.google.com/macros/s/AKfycbzLrT9i19rL1-jHicL6DuNi8dDQXcvVdsDAfsLIwiS370vFX2XMmyCmsJMej4Bz8z-w/exec';

/**
 * শিটের হেডারের অতিরিক্ত স্পেস রিমুভ করার জন্য হেল্পার।
 */
const cleanData = (data: any): any => {
  if (!data) return data;
  if (Array.isArray(data)) return data.map(cleanData);
  if (typeof data === 'object') {
    return Object.keys(data).reduce((acc: any, key) => {
      const cleanKey = key.trim();
      acc[cleanKey] = data[key];
      return acc;
    }, {});
  }
  return data;
};

const post = async (body: any, customUrl?: string) => {
  try {
    const response = await fetch(customUrl || API_URL, {
      method: 'POST',
      body: JSON.stringify(body)
    });
    return await response.json();
  } catch (error) {
    console.error("API POST Error:", error);
    return { status: 'error', message: 'Network error' };
  }
};

const get = async (query: string) => {
  try {
    const response = await fetch(`${API_URL}?${query}`);
    const result: ApiResponse = await response.json();
    if (result.status === 'success' && result.data) {
      return cleanData(result.data);
    }
    return [];
  } catch (error) {
    console.error("API GET Error:", error);
    return [];
  }
};

export const gasService = {
  loginUser: async (email: string, password: string): Promise<ApiResponse> => {
    return await post({
      action: 'login',
      data: { email, password }
    }, AUTH_API_URL);
  },

  fetchSettings: async (): Promise<SettingsData> => {
    return {
      Class_List: ['নার্সারী', 'নুরানী প্রথম', 'নুরানী দ্বিতীয়', 'ইবতেদায়ী তৃতীয়', 'ইবতেদায়ী চতুর্থ', 'ইবতেদায়ী পঞ্চম', 'দাখিল ষষ্ঠ', 'দাখিল সপ্তম', 'দাখিল অষ্টম', 'দাখিল নবম', 'দাখিল দশম', 'আলিম প্রথম বর্ষ', 'আলিম দ্বিতীয় বর্ষ'],
      Section_List: ['বালিকা', 'বালক', 'বালক-বালিকা'],
      Year_List: ['2024', '2025', '2026', '2027', '2028']
    };
  },

  createProfile: (data: StudentData) => post({ 
    action: 'create', 
    table: 'profile', 
    data 
  }),
  
  updateProfile: (data: StudentData) => {
    const { Student_UID, Form_No, Reg_No, Name_Bangla, Name_English, Birth_Reg_No, DOB, DOB_Day, DOB_Month, DOB_Year, Gender, Father_Name_BN, Father_Name_EN, Father_NID, Mother_Name_BN, Mother_Name_EN, Mother_NID, Mobile_Primary, Mobile_Optional, Village, Union_Post, Upazila, District, Photo_URL, Current_Status } = data;
    const profileOnly = { Student_UID, Form_No, Reg_No, Name_Bangla, Name_English, Birth_Reg_No, DOB, DOB_Day, DOB_Month, DOB_Year, Gender, Father_Name_BN, Father_Name_EN, Father_NID, Mother_Name_BN, Mother_Name_EN, Mother_NID, Mobile_Primary, Mobile_Optional, Village, Union_Post, Upazila, District, Photo_URL, Current_Status };
    return post({ 
      action: 'update', 
      table: 'profile', 
      data: profileOnly 
    });
  },
  
  readProfiles: (year?: string | number) => {
    const query = year ? `action=read_joined&year=${year}` : 'action=read_joined';
    return get(query);
  },
  
  getPending: (year: string | number) => get(`action=get_pending&year=${year}`),
  
  enrollStudent: (data: AcademicRecord) => post({ 
    action: 'create', 
    table: 'history', 
    data 
  }),

  bulkEnroll: (data: any[]) => post({
    action: 'bulk_enroll',
    data
  }),
  
  updateHistory: (data: Partial<AcademicRecord>) => post({ 
    action: 'update', 
    table: 'history', 
    data 
  }),
  
  deleteFull: (uid: string) => post({ 
    action: 'delete', 
    mode: 'full_student', 
    data: { Student_UID: uid } 
  })
};
