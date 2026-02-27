-- add start/end dates to project
alter table "Project" add column "startDate" timestamp(3);
alter table "Project" add column "endDate" timestamp(3);

-- create sprint table
create table "Sprint" (
    "id" text not null,
    "titre" text not null,
    "description" text,
    "dateDebut" timestamp(3) not null,
    "dateFin" timestamp(3) not null,
    "projectId" text not null,
    "createdAt" timestamp(3) not null default current_timestamp,

    constraint "Sprint_pkey" primary key ("id")
);

-- add new columns to task
alter table "Task" add column "isCompleted" boolean not null default false;
alter table "Task" add column "sprintId" text;

-- migrate existing SPRINT-type tasks into Sprint records
insert into "Sprint" ("id", "titre", "dateDebut", "dateFin", "projectId", "createdAt")
select "id", "titre", "dateDebut", "dateFin", "projectId", "createdAt"
from "Task"
where "type" = 'SPRINT';

-- remove migrated sprint rows from Task
delete from "Task" where "type" = 'SPRINT';

-- foreign keys
alter table "Sprint" add constraint "Sprint_projectId_fkey"
    foreign key ("projectId") references "Project"("id") on delete cascade on update cascade;

alter table "Task" add constraint "Task_sprintId_fkey"
    foreign key ("sprintId") references "Sprint"("id") on delete set null on update cascade;
