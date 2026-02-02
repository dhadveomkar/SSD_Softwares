package com.example.OmnasSmartphone.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.stereotype.Repository;

import com.example.OmnasSmartphone.model.Smartphone;

@Repository
public interface SmartphoneRepository extends JpaRepository<Smartphone, Long>{
    @Procedure(procedureName = "sp_InsertSmartphone")
    void insertSmartphone(
        String brand, String model, String color, String imageUrl, 
        int ram, int rom, String display, String processor, 
        String rearCamera, String frontCamera, int battery, 
        String warranty, double price
    );
}
