package com.aditya.finance_manager.controller;

import com.aditya.finance_manager.dto.CategoryResponse;
import com.aditya.finance_manager.dto.CreateCategoryRequest;
import com.aditya.finance_manager.service.CategoryService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<CategoryResponse> createCategory(
            @Valid @RequestBody CreateCategoryRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoryService.createCategory(request));
    }

    @GetMapping
    public List<CategoryResponse> getCategories() {
        return categoryService.getAllCategories();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.noContent().build();
    }
}
