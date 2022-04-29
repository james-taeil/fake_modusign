CREATE TABLE `users` (
  `id` TEXT PRIMARY KEY,
  `name` TEXT NOT NULL,
  `email` TEXT NOT NULL,
  `password` TEXT NOT NULL,
  `created_at` TEXT,
  `updated_at` TEXT
);
CREATE UNIQUE INDEX `idx_users_on_email` ON `users`(`email`);

CREATE TABLE `participants` (
  `id` TEXT PRIMARY KEY,
  `document_id` TEXT NOT NULL,
  `name` TEXT NOT NULL,
  `email` TEXT NOT NULL,
  `status` TEXT NOT NULL,
  `signature` TEXT,
  `created_at` TEXT,
  `updated_at` TEXT
);
CREATE UNIQUE INDEX `idx_participants_on_document_id_and_email` ON `participants`(`document_id`, `email`);

CREATE TABLE `participant_histories` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `participant_id` TEXT NOT NULL,
  `type` TEXT NOT NULL,
  `data` JSON,
  `created_at` TEXT
);
CREATE INDEX `idx_participant_histories_on_participant_id` ON `participant_histories`(`participant_id`);

CREATE TABLE `documents` (
  `id` TEXT PRIMARY KEY,
  `user_id` TEXT NOT NULL,
  `title` TEXT NOT NULL,
  `content` TEXT NOT NULL,
  `status` TEXT NOT NULL,
  `created_at` TEXT,
  `updated_at` TEXT
);
CREATE INDEX `idx_documents_on_user_id` ON `documents`(`user_id`);

CREATE TABLE `document_histories` (
  `id` INTEGER PRIMARY KEY AUTOINCREMENT,
  `document_id` TEXT NOT NULL,
  `type` TEXT NOT NULL,
  `data` JSON,
  `created_at` TEXT
);
CREATE INDEX `idx_document_histories_on_document_id` ON `document_histories`(`document_id`);