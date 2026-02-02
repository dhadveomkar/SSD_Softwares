-- 07/01/26
select * from dbo.smartphones;

CREATE TABLE reviews (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    smartphone_id BIGINT NOT NULL,
    customer_name NVARCHAR(100),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT FK_Smartphone_Review FOREIGN KEY (smartphone_id) 
        REFERENCES smartphones(id) ON DELETE CASCADE
);

-- CRUD: Create Review
CREATE PROCEDURE sp_InsertReview
    @smartphone_id BIGINT, @customer_name NVARCHAR(100), @rating INT, @comment NVARCHAR(MAX)
AS
BEGIN
    INSERT INTO reviews (smartphone_id, customer_name, rating, comment)
    VALUES (@smartphone_id, @customer_name, @rating, @comment);
END;

-- CRUD: Update Review
CREATE PROCEDURE sp_UpdateReview
    @id BIGINT, @rating INT, @comment NVARCHAR(MAX)
AS
BEGIN
    UPDATE reviews 
    SET rating = @rating, comment = @comment, created_at = GETDATE()
    WHERE id = @id;
END;

-- CRUD: Delete Review
CREATE PROCEDURE sp_DeleteReview
    @id BIGINT
AS
BEGIN
    DELETE FROM reviews WHERE id = @id;
END;

-- Calculate Average rating
SELECT 
    s.brand, 
    s.model, 
    AVG(CAST(r.rating AS DECIMAL(10,2))) AS AverageRating,
    COUNT(r.id) AS TotalReviews
FROM smartphones s
LEFT JOIN reviews r ON s.id = r.smartphone_id
GROUP BY s.brand, s.model;

-- Virtual Table to view calculated review
CREATE VIEW vw_SmartphoneRatings AS
SELECT 
    s.id,
    s.brand,
    s.model,
    s.price,
    ISNULL(AVG(CAST(r.rating AS DECIMAL(10,2))), 0) AS AverageRating,
    COUNT(r.id) AS TotalReviews
FROM smartphones s
LEFT JOIN reviews r ON s.id = r.smartphone_id
GROUP BY s.id, s.brand, s.model, s.price;

-- To see the results:
SELECT * FROM vw_SmartphoneRatings;

-- Other
SELECT id, brand, model FROM smartphones;

SELECT * FROM reviews WHERE smartphone_id = 6;

EXEC sp_InsertReview @smartphone_id = 6, @customer_name = 'Test User', @rating = 5, @comment = 'Manual Test';
SELECT * FROM reviews WHERE smartphone_id = 6;

select * from dbo.reviews;

-- Updated query
-- 1. Create the Table
IF OBJECT_ID('dbo.reviews', 'U') IS NOT NULL DROP TABLE dbo.reviews;
GO

CREATE TABLE reviews (
    id BIGINT IDENTITY(1,1) PRIMARY KEY,
    smartphone_id BIGINT NOT NULL,
    customer_name NVARCHAR(100),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment NVARCHAR(MAX),
    created_at DATETIME DEFAULT GETDATE()
);
GO

-- 2. Create Insert Procedure (The GO above makes this the "first statement")
CREATE OR ALTER PROCEDURE sp_InsertReview
    @smartphone_id BIGINT, 
    @customer_name NVARCHAR(100), 
    @rating INT, 
    @comment NVARCHAR(MAX)
AS
BEGIN
    INSERT INTO reviews (smartphone_id, customer_name, rating, comment)
    VALUES (@smartphone_id, @customer_name, @rating, @comment);
END;
GO

-- 3. Create Update Procedure
CREATE OR ALTER PROCEDURE sp_UpdateReview
    @id BIGINT, 
    @rating INT, 
    @comment NVARCHAR(MAX)
AS
BEGIN
    UPDATE reviews 
    SET rating = @rating, comment = @comment, created_at = GETDATE()
    WHERE id = @id;
END;
GO

-- 4. Create Delete Procedure
CREATE OR ALTER PROCEDURE sp_DeleteReview
    @id BIGINT
AS
BEGIN
    DELETE FROM reviews WHERE id = @id;
END;
GO

-- 5. Create the View
CREATE OR ALTER VIEW vw_SmartphoneRatings AS
SELECT 
    smartphone_id,
    AVG(CAST(rating AS DECIMAL(10,2))) AS AverageRating,
    COUNT(*) AS TotalReviews
FROM reviews
GROUP BY smartphone_id;
GO

-- To see results
select * from dbo.reviews;
SELECT * FROM vw_SmartphoneRatings;

