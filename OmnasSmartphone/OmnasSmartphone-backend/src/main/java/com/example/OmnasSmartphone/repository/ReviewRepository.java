package com.example.OmnasSmartphone.repository;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.simple.SimpleJdbcCall;
import org.springframework.stereotype.Repository;

import com.example.OmnasSmartphone.model.Review;
@Repository
public class ReviewRepository implements IReviewRepository {
    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void save(Review review) {
        // Calls the stored procedure: sp_InsertReview
        SimpleJdbcCall jdbcCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_InsertReview");

        MapSqlParameterSource in = new MapSqlParameterSource()
                .addValue("smartphone_id", review.getSmartphoneId())
                .addValue("customer_name", review.getCustomerName())
                .addValue("rating", review.getRating())
                .addValue("comment", review.getComment());

        jdbcCall.execute(in);
    }

    @Override
    public void update(Review review) {
        // Calls the stored procedure: sp_UpdateReview
        SimpleJdbcCall jdbcCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_UpdateReview");

        MapSqlParameterSource in = new MapSqlParameterSource()
                .addValue("id", review.getId())
                .addValue("rating", review.getRating())
                .addValue("comment", review.getComment());

        jdbcCall.execute(in);
    }

    @Override
    public void deleteById(long id) {
        // Calls the stored procedure: sp_DeleteReview
        SimpleJdbcCall jdbcCall = new SimpleJdbcCall(jdbcTemplate)
                .withProcedureName("sp_DeleteReview");

        MapSqlParameterSource in = new MapSqlParameterSource()
                .addValue("id", id);

        jdbcCall.execute(in);
    }

    @Override
    public List<Review> findBySmartphoneId(long smartphoneId) {
        // Standard SQL Query to fetch reviews for a specific phone (ID 6, 7, or 8)
        String sql = "SELECT * FROM reviews WHERE smartphone_id = ?";
        
        // BeanPropertyRowMapper maps snake_case DB columns to camelCase Java properties
        return jdbcTemplate.query(sql, new BeanPropertyRowMapper<>(Review.class), smartphoneId);
    }

    @Override
    public Optional<Review> findById(long id) {
        String sql = "SELECT * FROM reviews WHERE id = ?";
        try {
            Review review = jdbcTemplate.queryForObject(sql, new BeanPropertyRowMapper<>(Review.class), id);
            return Optional.ofNullable(review);
        } catch (Exception e) {
            return Optional.empty();
        }
    }
}
