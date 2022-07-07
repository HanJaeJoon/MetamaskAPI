CREATE TABLE [dbo].[USER_INFO](
    [UserInfoIdx] [BIGINT] IDENTITY(1,1) NOT NULL,
    [Email] [NVARCHAR](50) NOT NULL,
    [Name] [NVARCHAR](10) NULL,
    [AuthKey] [CHAR](36) NOT NULL,
    [WalletAddress] [NVARCHAR](100) NULL,
    [IsSent] [BIT] NOT NULL
) ON [PRIMARY]
GO

ALTER TABLE [dbo].[USER_INFO] ADD  CONSTRAINT [DF_AuthKey]  DEFAULT (NEWID()) FOR [AuthKey]
GO