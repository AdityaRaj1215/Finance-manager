package com.aditya.finance_manager.dto;



import com.aditya.finance_manager.entity.Category;

import java.math.BigDecimal;
import java.time.LocalDate;

public class CreateExpenseRequest {

    private BigDecimal amount;
    private Category category;
    private String description;
    private LocalDate expenseDate;

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDate getExpenseDate() {
        return expenseDate;
    }

    public void setExpenseDate(LocalDate expenseDate) {
        this.expenseDate = expenseDate;
    }
}