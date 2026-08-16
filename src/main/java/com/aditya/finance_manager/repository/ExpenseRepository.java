package com.aditya.finance_manager.repository;


import com.aditya.finance_manager.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {
}
