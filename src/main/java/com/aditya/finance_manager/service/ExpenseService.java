package com.aditya.finance_manager.service;
import com.aditya.finance_manager.dto.CreateExpenseRequest;
import com.aditya.finance_manager.dto.ExpenseResponse;
import com.aditya.finance_manager.dto.ModifyExpenseRequest;
import com.aditya.finance_manager.entity.Expense;
import com.aditya.finance_manager.exception.ExpenseNotFoundException;
import com.aditya.finance_manager.mapper.ExpenseMapper;
import com.aditya.finance_manager.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseMapper expenseMapper;

    public ExpenseService(ExpenseRepository expenseRepository, ExpenseMapper expenseMapper) {
        this.expenseRepository = expenseRepository;
        this.expenseMapper = expenseMapper;
    }

    public List<ExpenseResponse> getAllExpenses() {

        List<Expense> expenses = expenseRepository.findAll();

        return expenses.stream()
                .map(expenseMapper::toResponse)
                .toList();
    }
    public ExpenseResponse createExpense(CreateExpenseRequest request) {

        Expense expense = expenseMapper.toEntity(request);

        Expense savedExpense = expenseRepository.save(expense);

        return expenseMapper.toResponse(savedExpense);
    }
    public void deleteExpense(Long id) {
        if(!expenseRepository.existsById(id)){
            throw new ExpenseNotFoundException(id);
        }
        expenseRepository.deleteById(id);
    }
    public ExpenseResponse getExpenseById(Long id) {

        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ExpenseNotFoundException(id));

        return expenseMapper.toResponse(expense);
    }
    public ExpenseResponse modifyExpense(Long id, ModifyExpenseRequest request){
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ExpenseNotFoundException(id));
        Expense updatedexpense= expenseMapper.toEntity(request,expense);

        Expense savedExpense = expenseRepository.save(updatedexpense);

        return expenseMapper.toResponse(savedExpense);
}
}