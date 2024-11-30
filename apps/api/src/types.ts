export interface Participant {
  id: number;
  chestNo: string;
  fullName: string;
  sectionId: number | null;
  avatar: string | null;
  semester: number;
  gender: "male" | "female";
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Section {
  id: number;
  name: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Item {
  id: number;
  name: string;
  categoryId: number;
  isGroup: boolean;
  gender: "male" | "female" | "any";
  pointsFirst: number;
  pointsSecond: number;
  pointsThird: number;
  status: "yet_to_begin" | "active" | "completed" | "cancelled" | "hidden";
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Category {
  id: number;
  name: "sports" | "games" | "arts";
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Result {
  id: number;
  itemId: number;
  registrationId: number;
  position: "first" | "second" | "third";
  points: number;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface Registration {
  id: number;
  itemId: number;
  participantId: number;
  status: "registered" | "participated" | "not_participated";
  createdAt: string | null;
  updatedAt: string | null;
}

export interface LeaderboardEntry {
  sectionId: number;
  sectionName: string;
  totalPoints: number;
  firstCount: number;
  secondCount: number;
  thirdCount: number;
}
