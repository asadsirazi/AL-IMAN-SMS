
export interface AcademicRecord {
  Record_ID: string;
  Student_UID: string;
  Academic_Year: string | number;
  Class_Name: string;
  Section: string;
  Roll_No: string | number;
  Session?: string;
  Status?: string;
  Entry_Date: string;
}

export interface StudentProfile {
  Student_UID: string;
  Form_No: string | number;
  Reg_No: string | number;
  Name_Bangla: string;
  Name_English: string;
  Birth_Reg_No: string;
  DOB: string;
  DOB_Day?: string | number;
  DOB_Month?: string | number;
  DOB_Year?: string | number;
  Gender: string;
  Father_Name_BN: string;
  Father_Name_EN: string;
  Father_NID: string | number;
  Mother_Name_BN: string;
  Mother_Name_EN: string;
  Mother_NID: string | number;
  Mobile_Primary: string | number;
  Mobile_Optional: string | number;
  Village: string;
  Union_Post: string;
  Upazila: string;
  District: string;
  Photo_URL: string;
  Current_Status: 'Active' | 'TC' | 'Graduated';
  Profile_Created_At: string;
}

export interface StudentData extends Partial<StudentProfile> {
  Student_UID: string;
  History?: AcademicRecord[];
  Class_Name?: string;
  Section?: string;
  Roll_No?: string | number;
  Academic_Year?: string | number;
  Session?: string;
  Entry_Date?: string;
  Record_ID?: string;
}

export interface SettingsData {
  Class_List: string[];
  Section_List: string[];
  Year_List: string[];
}

export type ViewTab = 'dashboard' | 'admission' | 'list' | 'migration' | 'profile_entry' | 'profile_list' | 'admission_entry' | 'admission_list' | 'final_list' | 'custom_report';

export type ModalMode = 'profile_only' | 'admission_only' | 'full';

// Fix: Added 'user' property to ApiResponse to support login responses where 
// the user data is returned in a top-level 'user' field rather than 'data'.
export interface ApiResponse {
  status: 'success' | 'error';
  data?: any;
  user?: any;
  message?: string;
}
