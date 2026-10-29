package com.aditya.finance_manager;

import com.aditya.finance_manager.dto.CategoryResponse;
import com.aditya.finance_manager.dto.CreateCategoryRequest;
import com.aditya.finance_manager.entity.Category;
import com.aditya.finance_manager.exception.CategoryAlreadyExistsException;
import com.aditya.finance_manager.exception.CategoryInUseException;
import com.aditya.finance_manager.mapper.CategoryMapper;
import com.aditya.finance_manager.repository.CategoryRepository;
import com.aditya.finance_manager.repository.ExpenseRepository;
import com.aditya.finance_manager.service.CategoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CategoryServiceTests {

    private CategoryRepository categoryRepository;
    private CategoryMapper categoryMapper;
    private ExpenseRepository expenseRepository;
    private CategoryService categoryService;

    @BeforeEach
    void setUp() {
        categoryRepository = mock(CategoryRepository.class);
        categoryMapper = mock(CategoryMapper.class);
        expenseRepository = mock(ExpenseRepository.class);
        categoryService = new CategoryService(
                categoryRepository,
                categoryMapper,
                expenseRepository
        );
    }

    @Test
    void trimsNameAndReturnsMappedCategory() {
        CreateCategoryRequest request = new CreateCategoryRequest();
        request.setName("  Food  ");
        Category category = new Category();
        CategoryResponse response = new CategoryResponse();
        response.setName("Food");

        when(categoryRepository.existsByNameIgnoreCase("Food")).thenReturn(false);
        when(categoryMapper.toEntity(any(CreateCategoryRequest.class))).thenReturn(category);
        when(categoryRepository.save(category)).thenReturn(category);
        when(categoryMapper.toResponse(category)).thenReturn(response);

        assertEquals("Food", categoryService.createCategory(request).getName());
        verify(categoryMapper).toEntity(any(CreateCategoryRequest.class));
    }

    @Test
    void rejectsDuplicateCategoryName() {
        CreateCategoryRequest request = new CreateCategoryRequest();
        request.setName("Food");
        when(categoryRepository.existsByNameIgnoreCase("Food")).thenReturn(true);

        assertThrows(CategoryAlreadyExistsException.class,
                () -> categoryService.createCategory(request));
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    void preventsDeletingCategoryInUse() {
        Category category = new Category();
        when(categoryRepository.findById(7L)).thenReturn(Optional.of(category));
        when(expenseRepository.existsByCategory_Id(7L)).thenReturn(true);

        assertThrows(CategoryInUseException.class,
                () -> categoryService.deleteCategory(7L));
        verify(categoryRepository, never()).delete(category);
    }

    @Test
    void deletesUnusedCategory() {
        Category category = new Category();
        when(categoryRepository.findById(7L)).thenReturn(Optional.of(category));
        when(expenseRepository.existsByCategory_Id(7L)).thenReturn(false);

        categoryService.deleteCategory(7L);

        verify(categoryRepository).delete(category);
    }
}
