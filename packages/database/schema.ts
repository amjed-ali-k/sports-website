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
  slug: text("slug"),
  organizationId: integer("organization_id")
    .references(() => organizations.id)
    .notNull(),
  description: text("description"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const participants = sqliteTable("participants", {
  id: integer("id").primaryKey(),
  chestNo: text("chest_no"),
  fullName: text("full_name").notNull(),
  no: text("no").unique(),
  sectionId: integer("section_id")
    .references(() => sections.id)
    .notNull(),
  avatar: text("avatar"),
  organizationId: integer("organization_id")
    .references(() => organizations.id)
    .notNull(),
  batch: text("batch").notNull(),
  gender: text("gender", { enum: ["male", "female"] }).notNull(),
  createdAt: text("created_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
});

type Cert = {
  certificateElements: {
    text?: string;
    styles: {};
    variable?:
      | "name"
      | "eventName"
      | "itemName"
      | "position"
      | "points"
      | "date"
      | "sectionName"
      | "id";
  }[];
  height: number;
  width: number;
  fonts: string[];
  certificateBackground?: string | undefined;
};

export const events = sqliteTable("events", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  description: text("description"),
  eventStartTime: text("event_start_time"),
  eventEndTime: text("event_end_time"),
  registrationStartDate: text("registration_start_date"),
  registrationEndDate: text("registration_end_date"),
  image: text("image"),
  certificateTemplates: text("certificate_templates", { mode: "json" }).$type<{
    participation?: Cert | undefined;
    first?: Cert | undefined;
    second?: Cert | undefined;
    third?: Cert | undefined;
  }>(),
  logo: text("logo"),
  maxRegistrationPerParticipant: integer(
    "max_registration_per_participant"
  ).notNull(),
  organizationId: integer("organization_id")
    .references(() => organizations.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const organizations = sqliteTable("organizations", {
  id: integer("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const items = sqliteTable("items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  pointsFirst: integer("points_first").notNull(),
  pointsSecond: integer("points_second").notNull(),
  gender: text("gender", { enum: ["male", "female", "any"] }).notNull(),
  pointsThird: integer("points_third").notNull(),
  iconName: text("icon_name"),
  canRegister: integer("can_register").default(1).notNull(),
  isFinished: integer("is_finished").default(0).notNull(),
  isResultPublished: integer("is_result_published").default(0).notNull(),
  status: text("status", { enum: ["scheduled", "on-going", "finished"] })
    .default("scheduled")
    .notNull(),
  eventId: integer("event_id")
    .references(() => events.id, { onDelete: "cascade" })
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
  iconName: text("icon_name"),
  eventId: integer("event_id")
    .references(() => events.id, { onDelete: "cascade" })
    .notNull(),
  canRegister: integer("can_register").default(1).notNull(),
  isFinished: integer("is_finished").default(0).notNull(),
  isResultPublished: integer("is_result_published").default(0).notNull(),
  status: text("status", { enum: ["scheduled", "on-going", "finished"] })
    .default("scheduled")
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
  name: text("name"),
  sectionId: integer("section_id").references(() => sections.id),
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
  groupItemId: integer("group-item_id")
    .references(() => groupItems.id)
    .notNull(),
  position: text("position", { enum: ["first", "second", "third"] }).notNull(),
  points: integer("points").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$default(() => new Date()),
});

export const registrations = sqliteTable("registrations", {
  id: integer("id").primaryKey(),
  itemId: integer("item_id")
    .references(() => items.id)
    .notNull(),
  participantId: integer("participant_id")
    .references(() => participants.id)
    .notNull(),
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
  itemId: integer("item_id")
    .references(() => items.id)
    .notNull(),
  position: text("position", { enum: ["first", "second", "third"] }).notNull(),
  registrationId: integer("registration_id")
    .references(() => registrations.id)
    .notNull(),
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
    description: text("description"),
    avatar: text("avatar"),
    organizationId: integer("organization_id")
      .references(() => organizations.id)
      .notNull(),
    name: text("name").notNull(),
    role: text("role", {
      enum: ["rep", "manager", "controller", "super_admin"],
    }).notNull(),
    createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    emailIdx: uniqueIndex("email_idx").on(table.email),
  })
);

export const settings = sqliteTable("settings", {
  id: integer("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  organizationId: integer("organization_id")
    .references(() => organizations.id)
    .notNull(),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});

export const certificates = sqliteTable("certificates", {
  id: integer("id").primaryKey(),
  key: text("key").notNull().unique(),
  type: text("type", {
    enum: ["participation", "first", "second", "third", "custom"],
  }),
  itemtype: text("itemtype", {
    enum: ["event", "item", "group-item"],
  }).default('item'),
  data: text("data", {mode: 'json'}),
  ref: integer("ref"),
  itemId: integer("itemId"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
