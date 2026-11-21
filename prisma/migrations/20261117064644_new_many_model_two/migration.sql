/*
  Warnings:

  - Added the required column `rfId` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `role` to the `User` table without a default value. This is not possible if the table is not empty.

*/
BEGIN TRY

BEGIN TRAN;

-- AlterTable
ALTER TABLE [dbo].[User] ADD [rfId] NVARCHAR(1000) NOT NULL,
[role] NVARCHAR(1000) NOT NULL;

-- CreateTable
CREATE TABLE [dbo].[Group] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Group_status_df] DEFAULT 'use',
    CONSTRAINT [Group_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Section] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Section_status_df] DEFAULT 'use',
    CONSTRAINT [Section_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[MapUserSectionGroup] (
    [id] INT NOT NULL IDENTITY(1,1),
    [groupId] INT NOT NULL,
    [sectionId] INT NOT NULL,
    [userId] INT NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [MapUserSectionGroup_status_df] DEFAULT 'use',
    CONSTRAINT [MapUserSectionGroup_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Machine] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Machine_status_df] DEFAULT 'use',
    CONSTRAINT [Machine_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[Die] (
    [id] INT NOT NULL IDENTITY(1,1),
    [name] NVARCHAR(1000) NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [Die_status_df] DEFAULT 'use',
    CONSTRAINT [Die_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[MapDieMachineGroup] (
    [id] INT NOT NULL IDENTITY(1,1),
    [machineId] INT NOT NULL,
    [dieId] INT NOT NULL,
    [groupId] INT NOT NULL,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [MapDieMachineGroup_status_df] DEFAULT 'use',
    CONSTRAINT [MapDieMachineGroup_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[MapUserSectionGroup] ADD CONSTRAINT [MapUserSectionGroup_sectionId_fkey] FOREIGN KEY ([sectionId]) REFERENCES [dbo].[Section]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MapUserSectionGroup] ADD CONSTRAINT [MapUserSectionGroup_groupId_fkey] FOREIGN KEY ([groupId]) REFERENCES [dbo].[Group]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MapUserSectionGroup] ADD CONSTRAINT [MapUserSectionGroup_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MapDieMachineGroup] ADD CONSTRAINT [MapDieMachineGroup_machineId_fkey] FOREIGN KEY ([machineId]) REFERENCES [dbo].[Machine]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MapDieMachineGroup] ADD CONSTRAINT [MapDieMachineGroup_dieId_fkey] FOREIGN KEY ([dieId]) REFERENCES [dbo].[Die]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[MapDieMachineGroup] ADD CONSTRAINT [MapDieMachineGroup_groupId_fkey] FOREIGN KEY ([groupId]) REFERENCES [dbo].[Group]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
