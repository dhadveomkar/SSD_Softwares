package com.example.OmnasSmartphone.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.OmnasSmartphone.model.Review;
import com.example.OmnasSmartphone.repository.IReviewRepository;
@Service
public class ReviewService 
{
    private final IReviewRepository reviewRepository;

    public ReviewService(IReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    public void createReview(Review review) {
        if (review.getRating() < 1 || review.getRating() > 5) {
            throw new IllegalArgumentException("Rating must be between 1 and 5.");
        }
        reviewRepository.save(review);
    }

    public List<Review> getReviewsByPhone(Long phoneId) {
        return reviewRepository.findBySmartphoneId(phoneId);
    }

    public void updateReview(Long id, Integer rating, String comment) {
        Review existing = reviewRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Review not found"));
        
        existing.setRating(rating);
        existing.setComment(comment);
        reviewRepository.update(existing);
    }

    public void removeReview(Long id) {
        reviewRepository.deleteById(id);
    }

    public Double getAverageRating(Long phoneId) {
    List<Review> reviews = reviewRepository.findBySmartphoneId(phoneId);
    if (reviews.isEmpty()) return 0.0;
    
    return reviews.stream()
                  .mapToInt(Review::getRating)
                  .average()
                  .orElse(0.0);
}
}
