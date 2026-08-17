package com.aditya.finance_manager.mapper;

import com.aditya.finance_manager.dto.ExpenseResponse;
import com.aditya.finance_manager.entity.Expense;

public ExpenseResponse toResponse(Expense expense) {

    ExpenseResponse response = new ExpenseResponse();

    response.setId(expense.getId());
    response.setAmount(expense.getAmount());
    response.setCategory(expense.getCategory());
    response.setDescription(expense.getDescription());
    response.setExpenseDate(expense.getExpenseDate());

    return response;
}