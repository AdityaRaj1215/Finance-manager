package com.aditya.finance_manager.service;

import com.aditya.finance_manager.dto.CreateCategoryRequest;
import com.aditya.finance_manager.entity.Category;
import com.aditya.finance_manager.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public Category createCategory(CreateCategoryRequest request) {

        Category category = new Category();
        category.setName(request.getName());

        return categoryRepository.save(category);
    }

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
}