package com.example.OmnasSmartphone.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "smartphones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Smartphone {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String brand;
    private String model;
    private String color;
    private String imageUrl;
    
    private int ram;          // in GB
    private int rom;          // in GB
    private String display;   
    private String processor;
    
    private String rearCamera;
    private String frontCamera;
    
    private int battery;      // in mAh
    private String warranty;
    private double price;
}
