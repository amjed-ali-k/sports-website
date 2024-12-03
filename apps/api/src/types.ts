import * as schema from "@sports/database";

export type Participant = typeof schema.participants.$inferInsert;
export type Section = typeof schema.sections.$inferInsert;
export type Item = typeof schema.items.$inferInsert;
export type Category = typeof schema.events.$inferInsert;
export type Result = typeof schema.results.$inferInsert;
export type Registration = typeof schema.registrations.$inferInsert;

export interface LeaderboardEntry {
  sectionId: number;
  sectionName: string;
  totalPoints: number;
  firstCount: number;
  secondCount: number;
  thirdCount: number;
}
