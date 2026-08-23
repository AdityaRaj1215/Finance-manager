package com.aditya.finance_manager.repository;

import com.aditya.finance_manager.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}