export interface Participant {
  id: number;
  chestNo: string;
  fullName: string;
  sectionId: number;
  avatar?: string;
  semester: number;
  gender: 'male' | 'female';
  createdAt: string;
  updatedAt: string;
}

export interface Section {
  id: number;
  name: string;
}