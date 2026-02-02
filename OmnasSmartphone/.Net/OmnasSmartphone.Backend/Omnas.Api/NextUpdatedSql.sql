select * from dbo.Devices;
select * from dbo.Tablets;
select * from dbo.Wearables;


-- Create Table for Wearable Inventory
CREATE TABLE Wearables (
    Id INT PRIMARY KEY IDENTITY(1,1),
    DeviceName NVARCHAR(100) NOT NULL,
    OSVersion NVARCHAR(50),
    LastSync DATETIME DEFAULT GETDATE()
);

-- Create Table for Tablet Inventory
CREATE TABLE Tablets (
    Id INT PRIMARY KEY IDENTITY(1,1),
    DeviceName NVARCHAR(100) NOT NULL,
    OSVersion NVARCHAR(50),
    LastSync DATETIME DEFAULT GETDATE()
);

CREATE PROCEDURE sp_GetLiveInventory
AS
BEGIN
    SELECT 'Smartphone' AS Category, DeviceName, OSVersion, LastSync FROM Devices
    UNION ALL
    SELECT 'Wearable' AS Category, DeviceName, OSVersion, LastSync FROM Wearables
    UNION ALL
    SELECT 'Tablet' AS Category, DeviceName, OSVersion, LastSync FROM Tablets;
END;

CREATE PROCEDURE sp_AddInventoryItem
    @Category NVARCHAR(20), -- 'Smartphone', 'Wearable', or 'Tablet'
    @Name NVARCHAR(100),
    @OS NVARCHAR(50)
AS
BEGIN
    IF @Category = 'Smartphone'
        INSERT INTO Devices (DeviceName, OSVersion, LastSync) VALUES (@Name, @OS, GETDATE());
    ELSE IF @Category = 'Wearable'
        INSERT INTO Wearables (DeviceName, OSVersion, LastSync) VALUES (@Name, @OS, GETDATE());
    ELSE IF @Category = 'Tablet'
        INSERT INTO Tablets (DeviceName, OSVersion, LastSync) VALUES (@Name, @OS, GETDATE());
END;

-- Adding Wearables from your UI
EXEC sp_AddInventoryItem 'Wearable', 'Apple Pixel Watch 3', 'wathoIS 10';
EXEC sp_AddInventoryItem 'Wearable', 'Google Pixel Watch 3', 'Wear OS 4';
EXEC sp_AddInventoryItem 'Wearable', 'Samsung Galaxy Watch 7', 'ipados 18';

-- Adding Tablets from your UI
EXEC sp_AddInventoryItem 'Tablet', 'Samsung Galaxy Tab S9 Ultra', 'Android 14';
EXEC sp_AddInventoryItem 'Tablet', 'Apple IPad Pro (M3)', 'IPadOS 18';

-- Procedure for Smartphones
CREATE PROCEDURE sp_GetSmartphones
AS
BEGIN
    SELECT * FROM Devices; -- This matches your existing table
END;
GO

-- Procedure for Wearables
CREATE PROCEDURE sp_GetWearables
AS
BEGIN
    SELECT * FROM Wearables;
END;
GO

-- Procedure for Tablets
CREATE PROCEDURE sp_GetTablets
AS
BEGIN
    SELECT * FROM Tablets;
END;
GO