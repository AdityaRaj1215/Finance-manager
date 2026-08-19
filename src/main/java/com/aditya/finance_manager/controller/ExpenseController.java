package com.aditya.finance_manager.controller;

import com.aditya.finance_manager.dto.CreateExpenseRequest;
import com.aditya.finance_manager.dto.ExpenseResponse;
import com.aditya.finance_manager.dto.ModifyExpenseRequest;
import com.aditya.finance_manager.entity.Expense;
import com.aditya.finance_manager.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public List<ExpenseResponse> getExpenses() {
        return expenseService.getAllExpenses();
    }
    @PostMapping
    public ResponseEntity<ExpenseResponse> createExpense(
            @Valid @RequestBody CreateExpenseRequest request
    ) {
        ExpenseResponse response = expenseService.createExpense(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {

        expenseService.deleteExpense(id);

        return ResponseEntity.noContent().build();
    }
    @GetMapping("/{id}")
    public ExpenseResponse getExpenseById(@PathVariable Long id){
        return expenseService.getExpenseById(id);
    }
    @PutMapping("/{id}")
    public ExpenseResponse modifyExpense(@PathVariable Long id, @RequestBody ModifyExpenseRequest request){
        return expenseService.modifyExpense(id, request);
    }

}