// 地理位置类型
export interface GeoLocation {
  latitude: number;
  longitude: number;
}

// 联系信息类型
export interface ContactInfo {
  phone: string;
  email: string;
  website: string;
}

// 时间段类型
export interface TimeSlot {
  day: string; // 星期几，如 "周一", "周二" 等
  startTime: string; // 格式 "HH:MM"
  endTime: string; // 格式 "HH:MM"
  available: boolean; // 是否可预约
}

// 医院类型
export interface Hospital {
  id: string;
  name: string;
  address: string;
  specialties: string[]; // 专科列表
  rating: number; // 评分，1-5
  description: string;
  location: GeoLocation;
  contactInfo: ContactInfo;
  imageUrl?: string; // 医院图片URL
}

// 医生类型
export interface Doctor {
  id: string;
  name: string;
  hospitalId: string; // 关联的医院ID
  specialty: string; // 专科
  title: string; // 职称，如 "主任医师", "副主任医师" 等
  availability: TimeSlot[]; // 可预约时间段
  rating: number; // 评分，1-5
  education: string[]; // 教育背景
  experience: number; // 工作年限
  biography: string; // 简介
  imageUrl?: string; // 医生照片URL
}

// 预约类型
export interface Appointment {
  id: string;
  patientName: string;
  patientPhone: string;
  doctorId: string;
  hospitalId: string;
  timeSlot: TimeSlot;
  reason: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string; // ISO日期字符串
}

// 导航信息类型
export interface NavigationInfo {
  origin: GeoLocation;
  destination: GeoLocation;
  distance: string; // 如 "5.2公里"
  duration: string; // 如 "15分钟"
  steps: NavigationStep[];
}

// 导航步骤类型
export interface NavigationStep {
  instruction: string; // 如 "向北行驶100米"
  distance: string;
  duration: string;
}

// 工具类型
export enum ToolType {
  SEARCH = 'search',
  HOSPITAL_QUERY = 'hospital_query',
  DOCTOR_QUERY = 'doctor_query',
  APPOINTMENT = 'appointment',
  NAVIGATION = 'navigation'
}

// 工具调用参数
export interface ToolCallParams {
  toolType: ToolType;
  params: any;
}

// 工具调用结果
export interface ToolCallResult {
  toolType: ToolType;
  result: any;
}
