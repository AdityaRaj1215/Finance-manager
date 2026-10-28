package com.aditya.finance_manager.exception;

public class CategoryInUseException extends RuntimeException {

    public CategoryInUseException(Long id) {
        super("Category cannot be deleted while expenses use it: " + id);
    }
}
