import { sql } from "drizzle-orm";
import {
  sqliteTable,
  text,
  integer,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const sections = sqliteTable("sections", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  logo: text("logo"),
  color: text("color"),
  description: text("description"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const participants = sqliteTable(
  "participants",
  {
    id: integer("id").primaryKey(),
    chestNo: text("chest_no").notNull(),
    fullName: text("full_name").notNull(),
    sectionId: integer("section_id").references(() => sections.id).notNull(),
    avatar: text("avatar"),
    semester: integer("semester").notNull(),
    gender: text("gender", { enum: ["male", "female"] }).notNull(),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (table) => ({
    chestNoIdx: uniqueIndex("chest_no_idx").on(table.chestNo),
  }),
);

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey(),
  name: text("name", { enum: ["sports", "games", "arts"] }).notNull().unique(),
  certificateTemplate: text("certificate_template"),
  participationCertificateTemplate: text("participation_certificate_template"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const items = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  pointsFirst: integer("points_first").notNull(),
  pointsSecond: integer("points_second").notNull(),
  gender: text("gender", { enum: ["male", "female", "any"] }).notNull(),
  pointsThird: integer("points_third").notNull(),
  categoryId: integer("category_id")
    .references(() => categories.id, { onDelete: "cascade" })
    .notNull(),
  maxParticipants: integer("max_participants"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$default(() => new Date()),
});

export const groupItems = sqliteTable("group_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  pointsFirst: integer("points_first").notNull(),
  pointsSecond: integer("points_second").notNull(),
  pointsThird: integer("points_third").notNull(),
  gender: text("gender", { enum: ["male", "female", "any"] }).notNull(),
  categoryId: integer("category_id")
  .references(() => categories.id, { onDelete: "cascade" })
  .notNull(),
  minParticipants: integer("min_participants").notNull(),
  maxParticipants: integer("max_participants").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$default(() => new Date()),
});

export const groupRegistrations = sqliteTable("group_registrations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  groupItemId: integer("group_item_id")
    .references(() => groupItems.id, { onDelete: "cascade" })
    .notNull(),
  participantIds: text("participant_ids").notNull(), // Stored as JSON array of participant IDs
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$default(() => new Date()),
});

export const groupResults = sqliteTable("group_results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  groupRegistrationId: integer("group_registration_id")
    .references(() => groupRegistrations.id, { onDelete: "cascade" })
    .notNull(),
  position: text("position", { enum: ["first", "second", "third"] }).notNull(),
  points: integer("points").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$default(() => new Date()),
});

export const registrations = sqliteTable("registrations", {
  id: integer("id").primaryKey(),
  itemId: integer("item_id").references(() => items.id).notNull(),
  participantId: integer("participant_id").references(() => participants.id).notNull(),
  groupId: integer("group_id"),
  metaInfo: text("meta_info"),
  status: text("status", {
    enum: ["registered", "participated", "not_participated"],
  })
    .notNull()
    .default("registered"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const results = sqliteTable("results", {
  id: integer("id").primaryKey(),
  itemId: integer("item_id").references(() => items.id).notNull(),
  position: text("position", { enum: ["first", "second", "third"] }).notNull(),
  registrationId: integer("registration_id").references(() => registrations.id).notNull(),
  points: integer("points").notNull(),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const admins = sqliteTable(
  "admins",
  {
    id: integer("id").primaryKey(),
    email: text("email").notNull(),
    password: text("password").notNull(),
    name: text("name").notNull(),
    role: text("role", { enum: ["rep", "manager", "controller", "super_admin"] }).notNull(),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    emailIdx: uniqueIndex("email_idx").on(table.email),
  }),
);

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
