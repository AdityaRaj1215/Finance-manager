package com.aditya.finance_manager.repository;



import com.aditya.finance_manager.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findAllByUser_Id(Long userId);

    Optional<Expense> findByIdAndUser_Id(Long expenseId, Long userId);
}