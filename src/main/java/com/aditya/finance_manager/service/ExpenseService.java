package com.aditya.finance_manager.service;
import com.aditya.finance_manager.dto.CreateExpenseRequest;
import com.aditya.finance_manager.dto.ModifyExpenseRequest;
import com.aditya.finance_manager.entity.Expense;
import com.aditya.finance_manager.exception.ExpenseNotFoundException;
import com.aditya.finance_manager.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }
    public Expense createExpense(CreateExpenseRequest request) {

        Expense expense = new Expense();

        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setDescription(request.getDescription());
        expense.setExpenseDate(request.getExpenseDate());

        return expenseRepository.save(expense);
    }
    public void deleteExpense(Long id) {
        if(!expenseRepository.existsById(id)){
            throw new ExpenseNotFoundException(id);
        }
        expenseRepository.deleteById(id);
    }
    public Expense getExpenseById(Long id){
        return expenseRepository.getReferenceById(id);
    }
    public Expense modifyExpense(Long id, ModifyExpenseRequest request){
        if(!expenseRepository.existsById(id)){
            throw new ExpenseNotFoundException(id);
        }
        Expense expense = expenseRepository.getReferenceById(id);
        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory());
        expense.setDescription(request.getDescription());
        expense.setExpenseDate(request.getExpenseDate());

        return expenseRepository.save(expense);
}
}