package com.example.OmnasSmartphone.controller;

import com.example.OmnasSmartphone.model.Review;
import com.example.OmnasSmartphone.service.ReviewService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api/reviews")
public class ReviewController 
{
    @Autowired
    private ReviewService service;

    @PostMapping
    public ResponseEntity<String> create(@RequestBody Review review) {
        service.createReview(review);
        return ResponseEntity.ok("Review added successfully.");
    }

    // FIXED Error 1: Changed getBySmartphone to getReviewsByPhone
    @GetMapping("/smartphone/{phoneId}")
    public List<Review> getByPhone(@PathVariable long phoneId) {
        return service.getReviewsByPhone(phoneId); 
    }

    // FIXED Error 2: Passed rating and comment separately to match Service signature
    @PutMapping("/{id}")
    public ResponseEntity<String> update(@PathVariable long id, @RequestBody Review review) {
        service.updateReview(id, review.getRating(), review.getComment());
        return ResponseEntity.ok("Review updated.");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable long id) {
        service.removeReview(id);
        return ResponseEntity.ok("Review deleted.");
    }

    // New Endpoint to use your Average Rating logic
    @GetMapping("/smartphone/{phoneId}/average")
    public ResponseEntity<Double> getAverage(@PathVariable long phoneId) {
        return ResponseEntity.ok(service.getAverageRating(phoneId));
    }
}