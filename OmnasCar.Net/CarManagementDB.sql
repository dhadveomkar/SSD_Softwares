CREATE DATABASE CarManagementDB;
GO
USE CarManagementDB;
GO
CREATE TABLE Categories (
    CategoryID INT PRIMARY KEY IDENTITY(1,1),
    CategoryName NVARCHAR(50) NOT NULL
);
GO
CREATE TABLE Cars (
    CarID INT PRIMARY KEY IDENTITY(1,1),
    ModelName NVARCHAR(100) NOT NULL,
    Brand NVARCHAR(50) NOT NULL,
    Year INT,
    Price DECIMAL(18,2),
    CategoryID INT FOREIGN KEY REFERENCES Categories(CategoryID)
);
GO
-- Seed some categories
INSERT INTO Categories (CategoryName) VALUES ('Sedan'), ('SUV'), ('Truck'), ('Luxury');
GO
-- 1. GET ALL CARS (Using JOIN)
CREATE PROCEDURE sp_GetAllCars
AS
BEGIN
    SELECT c.CarID, c.ModelName, c.Brand, c.Year, c.Price, cat.CategoryName
    FROM Cars c
    INNER JOIN Categories cat ON c.CategoryID = cat.CategoryID;
END;
GO
-- 2. GET CAR BY ID
CREATE PROCEDURE sp_GetCarById @CarId INT
AS
BEGIN
    SELECT * FROM Cars WHERE CarID = @CarId;
END;
GO
-- 3. INSERT CAR
CREATE PROCEDURE sp_InsertCar 
    @ModelName NVARCHAR(100), @Brand NVARCHAR(50), @Year INT, @Price DECIMAL(18,2), @CategoryID INT
AS
BEGIN
    INSERT INTO Cars (ModelName, Brand, Year, Price, CategoryID)
    VALUES (@ModelName, @Brand, @Year, @Price, @CategoryID);
END;
GO
-- 4. UPDATE CAR
CREATE PROCEDURE sp_UpdateCar
    @CarID INT, @ModelName NVARCHAR(100), @Brand NVARCHAR(50), @Year INT, @Price DECIMAL(18,2), @CategoryID INT
AS
BEGIN
    UPDATE Cars 
    SET ModelName = @ModelName, Brand = @Brand, Year = @Year, Price = @Price, CategoryID = @CategoryID
    WHERE CarID = @CarID;
END;
GO
-- 5. DELETE CAR
CREATE PROCEDURE sp_DeleteCar @CarId INT
AS
BEGIN
    DELETE FROM Cars WHERE CarID = @CarId;
END;
GO
ALTER PROCEDURE sp_GetAllCars
AS
BEGIN
    SELECT 
        c.CarID, 
        c.ModelName, 
        c.Brand, 
        c.Year, 
        c.Price, 
        c.CategoryID,  -- Explicitly select this!
        cat.CategoryName
    FROM Cars c
    INNER JOIN Categories cat ON c.CategoryID = cat.CategoryID;
END;
GO
CREATE TABLE MaintenanceLogs (
    LogID INT PRIMARY KEY IDENTITY(1,1),
    CarID INT FOREIGN KEY REFERENCES Cars(CarID) ON DELETE CASCADE,
    ServiceDate DATE NOT NULL,
    Description NVARCHAR(500),
    Cost DECIMAL(18,2)
);
GO
-- Stored Procedure to get logs for a specific car
CREATE PROCEDURE sp_GetMaintenanceByCarId @CarId INT
AS
BEGIN
    SELECT * FROM MaintenanceLogs WHERE CarID = @CarId ORDER BY ServiceDate DESC;
END;
GO
-- Stored Procedure to add a log
CREATE PROCEDURE sp_InsertMaintenanceLog
    @CarId INT, @ServiceDate DATE, @Description NVARCHAR(500), @Cost DECIMAL(18,2)
AS
BEGIN
    INSERT INTO MaintenanceLogs (CarID, ServiceDate, Description, Cost)
    VALUES (@CarId, @ServiceDate, @Description, @Cost);
END;
GO
CREATE PROCEDURE sp_GetDashboardSummary
AS
BEGIN
    -- Total Count and Total Value
    SELECT 
        COUNT(*) as TotalCars, 
        SUM(Price) as TotalInventoryValue 
    FROM Cars;

    -- Car Count per Category (JOIN)
    SELECT cat.CategoryName, COUNT(c.CarID) as [Count]
    FROM Categories cat
    LEFT JOIN Cars c ON cat.CategoryID = c.CategoryID
    GROUP BY cat.CategoryName;

    -- Most Expensive Car
    SELECT TOP 1 * FROM Cars ORDER BY Price DESC;
END;
GO
CREATE PROCEDURE sp_SearchCars
    @Brand NVARCHAR(50) = NULL,
    @MinPrice DECIMAL(18,2) = NULL,
    @MaxPrice DECIMAL(18,2) = NULL,
    @Year INT = NULL
AS
BEGIN
    SELECT c.CarID, c.ModelName, c.Brand, c.Year, c.Price, cat.CategoryName
    FROM Cars c
    INNER JOIN Categories cat ON c.CategoryID = cat.CategoryID
    WHERE (@Brand IS NULL OR c.Brand LIKE '%' + @Brand + '%')
      AND (@MinPrice IS NULL OR c.Price >= @MinPrice)
      AND (@MaxPrice IS NULL OR c.Price <= @MaxPrice)
      AND (@Year IS NULL OR c.Year = @Year);
END;
GO
