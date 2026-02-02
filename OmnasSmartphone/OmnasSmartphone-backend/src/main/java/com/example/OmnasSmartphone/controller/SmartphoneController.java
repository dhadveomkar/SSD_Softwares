package com.example.OmnasSmartphone.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.OmnasSmartphone.model.Smartphone;
import com.example.OmnasSmartphone.service.SmartphoneService;

@RestController
@RequestMapping("/api/v1/smartphones")
@CrossOrigin(origins = "http://localhost:4200") // Allows Angular to connect
public class SmartphoneController {
    @Autowired
    private SmartphoneService service;

    @GetMapping
    public List<Smartphone> getAll() {
        return service.getAllSmartphones();
    }

    @PostMapping
    public Smartphone create(@RequestBody Smartphone smartphone) {
        return service.saveSmartphone(smartphone);
    }

    @GetMapping("/{id}")
    public Smartphone getById(@PathVariable Long id) {
        return service.getSmartphoneById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.deleteSmartphone(id);
    }
}
