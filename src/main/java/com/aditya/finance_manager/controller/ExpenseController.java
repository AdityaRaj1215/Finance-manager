package com.aditya.finance_manager.controller;

import com.aditya.finance_manager.dto.CreateExpenseRequest;
import com.aditya.finance_manager.dto.ModifyExpenseRequest;
import com.aditya.finance_manager.entity.Expense;
import com.aditya.finance_manager.service.ExpenseService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping
    public List<Expense> getExpenses() {
        return expenseService.getAllExpenses();
    }

    @PostMapping
    public Expense createExpense(@RequestBody CreateExpenseRequest request) {
        return expenseService.createExpense(request);
    }
    @DeleteMapping("/{id}")
    public void deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
    }
    @GetMapping("/{id}")
    public Expense getExpenseById(@PathVariable Long id){
        return expenseService.getExpenseById(id);
    }
    @PutMapping("/{id}")
    public Expense modifyExpense(@PathVariable Long id, @RequestBody ModifyExpenseRequest request){
        return expenseService.modifyExpense(id, request);
    }

}