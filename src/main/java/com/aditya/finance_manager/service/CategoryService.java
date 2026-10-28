package com.aditya.finance_manager.service;

import com.aditya.finance_manager.dto.CategoryResponse;
import com.aditya.finance_manager.dto.CreateCategoryRequest;
import com.aditya.finance_manager.entity.Category;
import com.aditya.finance_manager.exception.CategoryAlreadyExistsException;
import com.aditya.finance_manager.exception.CategoryInUseException;
import com.aditya.finance_manager.exception.CategoryNotFoundException;
import com.aditya.finance_manager.mapper.CategoryMapper;
import com.aditya.finance_manager.repository.CategoryRepository;
import com.aditya.finance_manager.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final ExpenseRepository expenseRepository;

    public CategoryService(
            CategoryRepository categoryRepository,
            CategoryMapper categoryMapper,
            ExpenseRepository expenseRepository
    ) {
        this.categoryRepository = categoryRepository;
        this.categoryMapper = categoryMapper;
        this.expenseRepository = expenseRepository;
    }

    public CategoryResponse createCategory(CreateCategoryRequest request) {

        String name = request.getName().trim();
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new CategoryAlreadyExistsException(name);
        }

        CreateCategoryRequest normalizedRequest = new CreateCategoryRequest();
        normalizedRequest.setName(name);
        Category category = categoryMapper.toEntity(normalizedRequest);

        Category savedCategory = categoryRepository.save(category);

        return categoryMapper.toResponse(savedCategory);
    }
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new CategoryNotFoundException(id));
        if (expenseRepository.existsByCategory_Id(id)) {
            throw new CategoryInUseException(id);
        }
        categoryRepository.delete(category);
    }
}
