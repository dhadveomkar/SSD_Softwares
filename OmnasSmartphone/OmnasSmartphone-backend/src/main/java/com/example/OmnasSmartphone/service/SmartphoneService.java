package com.example.OmnasSmartphone.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.OmnasSmartphone.model.Smartphone;
import com.example.OmnasSmartphone.repository.SmartphoneRepository;

@Service
public class SmartphoneService {
 @Autowired
    private SmartphoneRepository repository;

    public List<Smartphone> getAllSmartphones() {
        return repository.findAll();
    }

    public Smartphone saveSmartphone(Smartphone smartphone) {
        return repository.save(smartphone);
    }

    public Smartphone getSmartphoneById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public void deleteSmartphone(Long id) {
        repository.deleteById(id);
    }   
}
