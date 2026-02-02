package com.example.OmnasSmartphone.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

public class Review {
    private long id;

    @JsonProperty("smartphone_id") // Matches your SQL column and JSON input
    private long smartphoneId;

    @JsonProperty("customer_name")
    private String customerName;

    private int rating;
    private String comment;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    // Default Constructor (Required for RowMapper)
    public Review() {}

    // Getters and Setters
    public long getId() { return id; }
    public void setId(long id) { this.id = id; }

    public long getSmartphoneId() { return smartphoneId; }
    public void setSmartphoneId(long smartphoneId) { this.smartphoneId = smartphoneId; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public int getRating() { return rating; }
    public void setRating(int rating) { this.rating = rating; }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}