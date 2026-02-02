-- 1. Create Database
CREATE DATABASE OmnasSmartphone;
GO

USE OmnasSmartphone;
GO

-- 2. Create Table
CREATE TABLE smartphones (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    brand NVARCHAR(50),
    model NVARCHAR(50),
    color NVARCHAR(30),
    image_url NVARCHAR(MAX),
    ram INT,
    rom INT,
    display NVARCHAR(100),
    processor NVARCHAR(100),
    rear_camera NVARCHAR(100),
    front_camera NVARCHAR(100),
    battery INT,
    warranty NVARCHAR(50),
    price DECIMAL(18, 2)
);
GO

CREATE PROCEDURE sp_InsertSmartphone
    @brand NVARCHAR(50), @model NVARCHAR(50), @color NVARCHAR(30),
    @image_url NVARCHAR(MAX), @ram INT, @rom INT, @display NVARCHAR(100),
    @processor NVARCHAR(100), @rear_camera NVARCHAR(100), @front_camera NVARCHAR(100),
    @battery INT, @warranty NVARCHAR(50), @price DECIMAL(18, 2)
AS
BEGIN
    INSERT INTO smartphones (brand, model, color, image_url, ram, rom, display, processor, rear_camera, front_camera, battery, warranty, price)
    VALUES (@brand, @model, @color, @image_url, @ram, @rom, @display, @processor, @rear_camera, @front_camera, @battery, @warranty, @price);
END;
GO

select * from dbo.smartphones;
