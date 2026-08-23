package com.aditya.finance_manager.controller;

import com.aditya.finance_manager.dto.CreateCategoryRequest;
import com.aditya.finance_manager.entity.Category;
import com.aditya.finance_manager.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @PostMapping
    public Category createCategory(
            @Valid @RequestBody CreateCategoryRequest request
    ) {
        return categoryService.createCategory(request);
    }

    @GetMapping
    public List<Category> getCategories() {
        return categoryService.getAllCategories();
    }
}