package com.aditya.finance_manager;

import com.aditya.finance_manager.dto.CreateExpenseRequest;
import com.aditya.finance_manager.dto.ExpenseResponse;
import com.aditya.finance_manager.entity.Category;
import com.aditya.finance_manager.entity.Expense;
import com.aditya.finance_manager.entity.User;
import com.aditya.finance_manager.mapper.ExpenseMapper;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ExpenseMapperTests {

    private final ExpenseMapper mapper = new ExpenseMapper();

    @Test
    void mapsExpenseRequestAndResponse() {
        CreateExpenseRequest request = new CreateExpenseRequest();
        request.setAmount(new BigDecimal("12.50"));
        request.setDescription("Lunch");
        request.setExpenseDate(LocalDate.of(2026, 10, 26));

        Category category = new Category();
        category.setName("Food");
        User user = new User();
        user.setName("Ada");

        Expense expense = mapper.toEntity(request, category, user);
        ExpenseResponse response = mapper.toResponse(expense);

        assertEquals(new BigDecimal("12.50"), response.getAmount());
        assertEquals("Lunch", response.getDescription());
        assertEquals(LocalDate.of(2026, 10, 26), response.getExpenseDate());
        assertEquals("Food", response.getCategory().getName());
    }
}
