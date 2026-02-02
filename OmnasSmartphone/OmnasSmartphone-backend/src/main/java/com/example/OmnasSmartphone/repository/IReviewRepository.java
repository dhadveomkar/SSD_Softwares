package com.example.OmnasSmartphone.repository;

import java.util.List;
import java.util.Optional;
import com.example.OmnasSmartphone.model.Review;

public interface IReviewRepository {
    void save(Review review); // Changed to void as the Procedure handles the insert
    List<Review> findBySmartphoneId(long smartphoneId);
    Optional<Review> findById(long id);
    void update(Review review);
    void deleteById(long id);
}
