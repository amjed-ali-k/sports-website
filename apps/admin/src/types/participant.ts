export interface Participant {
  id: number;
  chestNo: string;
  fullName: string;
  sectionId: number | null;
  avatar?: string | null;
  semester: number;
  gender: "male" | "female";
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Section {
  id: number;
  name: string;
}
