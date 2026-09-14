package com.aditya.finance_manager.service;
import com.aditya.finance_manager.dto.CreateExpenseRequest;
import com.aditya.finance_manager.dto.ExpenseResponse;
import com.aditya.finance_manager.dto.ModifyExpenseRequest;
import com.aditya.finance_manager.entity.Category;
import com.aditya.finance_manager.entity.Expense;
import com.aditya.finance_manager.entity.User;
import com.aditya.finance_manager.exception.CategoryNotFoundException;
import com.aditya.finance_manager.exception.ExpenseNotFoundException;
import com.aditya.finance_manager.exception.UserNotFoundException;
import com.aditya.finance_manager.mapper.ExpenseMapper;
import com.aditya.finance_manager.repository.CategoryRepository;
import com.aditya.finance_manager.repository.ExpenseRepository;
import com.aditya.finance_manager.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final ExpenseMapper expenseMapper;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public ExpenseService(
            ExpenseRepository expenseRepository,
            ExpenseMapper expenseMapper,
            CategoryRepository categoryRepository, UserRepository userRepository
    ) {
        this.expenseRepository = expenseRepository;
        this.expenseMapper = expenseMapper;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    public List<ExpenseResponse> getAllExpenses() {

        List<Expense> expenses = expenseRepository.findAll();

        return expenses.stream()
                .map(expenseMapper::toResponse)
                .toList();
    }
    public ExpenseResponse createExpense(CreateExpenseRequest request) {

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() ->
                        new CategoryNotFoundException(request.getCategoryId()));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new UserNotFoundException(request.getUserId()));

        Expense expense = expenseMapper.toEntity(
                request,
                category,
                user
        );

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
    public ExpenseResponse modifyExpense(
            Long id,
            ModifyExpenseRequest request
    ) {

        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ExpenseNotFoundException(id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() ->
                        new CategoryNotFoundException(request.getCategoryId()));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() ->
                        new UserNotFoundException(request.getUserId()));

        expenseMapper.toEntity(
                request,
                expense,
                category,
                user
        );

        Expense savedExpense = expenseRepository.save(expense);

        return expenseMapper.toResponse(savedExpense);
    }

}