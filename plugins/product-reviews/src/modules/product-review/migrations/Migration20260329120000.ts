import { Migration } from '@mikro-orm/migrations';

export class Migration20260329120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(
      `alter table if exists "product_review" add column if not exists "audio_url" text null;`,
    );
    this.addSql(
      `alter table if exists "product_review" add column if not exists "audio_status" text check ("audio_status" in ('pending', 'ready', 'failed')) null;`,
    );
    this.addSql(
      `alter table if exists "product_review" add column if not exists "featured_for_audio" boolean not null default false;`,
    );
    this.addSql(
      `alter table if exists "product_review" add column if not exists "audio_generated_at" timestamptz null;`,
    );
    this.addSql(
      `alter table if exists "product_review" add column if not exists "language" text null;`,
    );
    this.addSql(
      `alter table if exists "product_review" add column if not exists "voice_gender" text check ("voice_gender" in ('female', 'male')) not null default 'female';`,
    );
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "product_review" drop column if exists "voice_gender";`);
    this.addSql(`alter table if exists "product_review" drop column if exists "language";`);
    this.addSql(`alter table if exists "product_review" drop column if exists "audio_generated_at";`);
    this.addSql(`alter table if exists "product_review" drop column if exists "featured_for_audio";`);
    this.addSql(`alter table if exists "product_review" drop column if exists "audio_status";`);
    this.addSql(`alter table if exists "product_review" drop column if exists "audio_url";`);
  }
}
