-- AlterTable
alter table "Member" add column "isResource" boolean not null default true;

-- AlterTable
alter table "Technology" add column "customSvg" text;
