package com.aditya.finance_manager.mapper;

import com.aditya.finance_manager.dto.CreateExpenseRequest;
import com.aditya.finance_manager.dto.ExpenseResponse;
import com.aditya.finance_manager.dto.ModifyExpenseRequest;
import com.aditya.finance_manager.entity.Category;
import com.aditya.finance_manager.entity.Expense;
import org.springframework.stereotype.Component;

@Component
public class ExpenseMapper {

    public Expense toEntity(CreateExpenseRequest request, Category category) {

        Expense expense = new Expense();

        expense.setAmount(request.getAmount());
        expense.setCategory(category);
        expense.setDescription(request.getDescription());
        expense.setExpenseDate(request.getExpenseDate());

        return expense;
    }

    public Expense toEntity(
            ModifyExpenseRequest request,
            Expense expense,
            Category category
    ) {
        expense.setAmount(request.getAmount());
        expense.setCategory(category);
        expense.setDescription(request.getDescription());
        expense.setExpenseDate(request.getExpenseDate());

        return expense;
    }
    public ExpenseResponse toResponse(Expense expense) {
        ExpenseResponse response = new ExpenseResponse();

        response.setId(expense.getId());
        response.setAmount(expense.getAmount());
        response.setCategory(expense.getCategory());
        response.setDescription(expense.getDescription());
        response.setExpenseDate(expense.getExpenseDate());

        return response;
    }
}