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
    private final CurrentUserService currentUserService;

    public ExpenseService(
            ExpenseRepository expenseRepository,
            ExpenseMapper expenseMapper,
            CategoryRepository categoryRepository,
            UserRepository userRepository,
            CurrentUserService currentUserService
    ) {
        this.expenseRepository = expenseRepository;
        this.expenseMapper = expenseMapper;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
    }

    public List<ExpenseResponse> getAllExpenses() {

        Long userId = currentUserService.getCurrentUserId();

        List<Expense> expenses =
                expenseRepository.findAllByUser_Id(userId);

        return expenses.stream()
                .map(expenseMapper::toResponse)
                .toList();
    }

    public ExpenseResponse createExpense(CreateExpenseRequest request) {

        Long userId = currentUserService.getCurrentUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new UserNotFoundException(userId));

        Category category = categoryRepository.findById(
                request.getCategoryId()
        ).orElseThrow(() ->
                new CategoryNotFoundException(
                        request.getCategoryId()
                ));

        Expense expense = expenseMapper.toEntity(
                request,
                category,
                user
        );

        Expense savedExpense = expenseRepository.save(expense);

        return expenseMapper.toResponse(savedExpense);
    }

    public void deleteExpense(Long id) {

        Long userId = currentUserService.getCurrentUserId();

        Expense expense = expenseRepository
                .findByIdAndUser_Id(id, userId)
                .orElseThrow(() ->
                        new ExpenseNotFoundException(id));

        expenseRepository.delete(expense);
    }

    public ExpenseResponse getExpenseById(Long id) {

        Long userId = currentUserService.getCurrentUserId();

        Expense expense = expenseRepository
                .findByIdAndUser_Id(id, userId)
                .orElseThrow(() ->
                        new ExpenseNotFoundException(id));

        return expenseMapper.toResponse(expense);
    }

    public ExpenseResponse modifyExpense(
            Long id,
            ModifyExpenseRequest request
    ) {

        Long userId = currentUserService.getCurrentUserId();

        Expense expense = expenseRepository
                .findByIdAndUser_Id(id, userId)
                .orElseThrow(() ->
                        new ExpenseNotFoundException(id));

        Category category = categoryRepository.findById(
                request.getCategoryId()
        ).orElseThrow(() ->
                new CategoryNotFoundException(
                        request.getCategoryId()
                ));

        expenseMapper.toEntity(
                request,
                expense,
                category
        );

        Expense savedExpense = expenseRepository.save(expense);

        return expenseMapper.toResponse(savedExpense);
    }
}