import {
  integer,
  foreignKey,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

import { user } from "./auth";
import type { InterviewSession } from "@/lib/interviews";

export const learningStatus = pgEnum("learning_status", [
  "unseen",
  "unclear",
  "mastered",
  "review",
]);

export const questionProgress = pgTable(
  "question_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    questionId: text("question_id").notNull(),
    status: learningStatus("status").default("unseen").notNull(),
    reviewCount: integer("review_count").default(0).notNull(),
    firstViewedAt: timestamp("first_viewed_at", { withTimezone: true }),
    lastReviewedAt: timestamp("last_reviewed_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.questionId] })],
);

export const bookmark = pgTable(
  "bookmark",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    questionId: text("question_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.questionId] })],
);

export const studySet = pgTable(
  "study_set",
  {
    id: text("id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.id] })],
);

export const studySetItem = pgTable(
  "study_set_item",
  {
    studySetId: text("study_set_id").notNull(),
    userId: text("user_id").notNull(),
    questionId: text("question_id").notNull(),
    position: integer("position").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.studySetId, table.questionId] }),
    foreignKey({
      columns: [table.userId, table.studySetId],
      foreignColumns: [studySet.userId, studySet.id],
    }).onDelete("cascade"),
  ],
);

export const interviewRecord = pgTable(
  "interview_record",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    id: text("id").notNull(),
    data: jsonb("data").$type<InterviewSession>().notNull(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.id] })],
);

export const learningSyncState = pgTable("learning_sync_state", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  revision: integer("revision").notNull().default(0),
  lastMutationId: text("last_mutation_id"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
