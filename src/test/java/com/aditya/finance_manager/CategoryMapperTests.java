package com.aditya.finance_manager;

import com.aditya.finance_manager.dto.CategoryResponse;
import com.aditya.finance_manager.dto.CreateCategoryRequest;
import com.aditya.finance_manager.entity.Category;
import com.aditya.finance_manager.mapper.CategoryMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CategoryMapperTests {

    private final CategoryMapper mapper = new CategoryMapper();

    @Test
    void mapsCategoryRequestsAndResponses() {
        CreateCategoryRequest request = new CreateCategoryRequest();
        request.setName("Food");

        Category entity = mapper.toEntity(request);
        entity.setName("Food");
        CategoryResponse response = mapper.toResponse(entity);

        assertEquals("Food", entity.getName());
        assertEquals("Food", response.getName());
    }
}
