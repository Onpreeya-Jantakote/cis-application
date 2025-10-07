export interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  image: string;
  role: string;
  type: string;
  confirmed: boolean;
  education: Education;
  job: Job[];
  createdAt: string;
  updatedAt: string;
}

export interface Education {
  major: string;
  enrollmentYear: string;
  studentId: string;
  schoolId: string;
  school: School;
  advisorId: string;
  advisor: Advisor;
  image: string;
}

export interface School {
  _id: string;
  name: string;
  province: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

export interface Advisor {
  _id: string;
  name: string;
  email: string;
  image: string;
}

export interface Company {
  _id: string;
  name: string;
  province: string;
  logo: string;
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  _id: string;
  no: number;
  name: string;
  email: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export interface Status {
  _id: string;
  content: string;
  createdBy: User;
  like: string[];
  likeCount: number;
  hasLiked: boolean;
  comment: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  createdBy: User;
  like: string[];
  createdAt: string;
}

export interface Job {
  _id: string;
  title: string;
  company: Company;
  position: string;
  description: string;
  salary: number;
  location: string;
  type: string; // full-time, part-time, etc.
  createdBy: User;
  applicants: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}