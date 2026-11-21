BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[TransactionMachine] (
    [id] INT NOT NULL IDENTITY(1,1),
    [machineId] INT NOT NULL,
    [dieId] INT NOT NULL,
    [groupId] INT NOT NULL,
    [speedTarget] FLOAT(53) NOT NULL,
    [speedActual] FLOAT(53) NOT NULL,
    [qcStatus] NVARCHAR(1000) NOT NULL,
    [standByOneDieId] INT NOT NULL,
    [sortOneStatus] NVARCHAR(1000) NOT NULL,
    [standByTwoDieId] INT NOT NULL,
    [sortTwoStatus] NVARCHAR(1000) NOT NULL,
    [bal] FLOAT(53) NOT NULL,
    [state] NVARCHAR(1000) NOT NULL,
    [timeStmp] DATETIME2 NOT NULL CONSTRAINT [TransactionMachine_timeStmp_df] DEFAULT CURRENT_TIMESTAMP,
    [status] NVARCHAR(1000) NOT NULL CONSTRAINT [TransactionMachine_status_df] DEFAULT 'use',
    CONSTRAINT [TransactionMachine_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[LocTransactionMachine] (
    [id] INT NOT NULL IDENTITY(1,1),
    [transactionMachineId] INT NOT NULL,
    [machineId] INT NOT NULL,
    [dieId] INT NOT NULL,
    [groupId] INT NOT NULL,
    [speedTarget] FLOAT(53) NOT NULL,
    [speedActual] FLOAT(53) NOT NULL,
    [qcStatus] NVARCHAR(1000) NOT NULL,
    [standByOneDieId] INT NOT NULL,
    [sortOneStatus] NVARCHAR(1000) NOT NULL,
    [standByTwoDieId] INT NOT NULL,
    [sortTwoStatus] NVARCHAR(1000) NOT NULL,
    [bal] FLOAT(53) NOT NULL,
    [state] NVARCHAR(1000) NOT NULL,
    [userId] INT NOT NULL,
    [timeStmp] DATETIME2 NOT NULL CONSTRAINT [LocTransactionMachine_timeStmp_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [LocTransactionMachine_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[TransactionMachine] ADD CONSTRAINT [TransactionMachine_machineId_fkey] FOREIGN KEY ([machineId]) REFERENCES [dbo].[Machine]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[TransactionMachine] ADD CONSTRAINT [TransactionMachine_dieId_fkey] FOREIGN KEY ([dieId]) REFERENCES [dbo].[Die]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[TransactionMachine] ADD CONSTRAINT [TransactionMachine_groupId_fkey] FOREIGN KEY ([groupId]) REFERENCES [dbo].[Group]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[LocTransactionMachine] ADD CONSTRAINT [LocTransactionMachine_userId_fkey] FOREIGN KEY ([userId]) REFERENCES [dbo].[User]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[LocTransactionMachine] ADD CONSTRAINT [LocTransactionMachine_machineId_fkey] FOREIGN KEY ([machineId]) REFERENCES [dbo].[Machine]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[LocTransactionMachine] ADD CONSTRAINT [LocTransactionMachine_dieId_fkey] FOREIGN KEY ([dieId]) REFERENCES [dbo].[Die]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[LocTransactionMachine] ADD CONSTRAINT [LocTransactionMachine_groupId_fkey] FOREIGN KEY ([groupId]) REFERENCES [dbo].[Group]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[LocTransactionMachine] ADD CONSTRAINT [LocTransactionMachine_transactionMachineId_fkey] FOREIGN KEY ([transactionMachineId]) REFERENCES [dbo].[TransactionMachine]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
