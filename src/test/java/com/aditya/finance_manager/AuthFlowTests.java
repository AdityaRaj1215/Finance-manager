package com.aditya.finance_manager;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import com.jayway.jsonpath.JsonPath;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthFlowTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void registerLoginAndRejectUnauthenticatedExpenseAccess() throws Exception {
        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Ada",
                                  "email": "Ada@Example.com",
                                  "password": "password1"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value("ada@example.com"))
                .andExpect(jsonPath("$.password").doesNotExist());

        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Ada",
                                  "email": "ada@example.com",
                                  "password": "password1"
                                }
                                """))
                .andExpect(status().isConflict());

        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "ADA@example.com",
                                  "password": "password1"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();

        String token = JsonPath.read(
                login.getResponse().getContentAsString(),
                "$.token"
        );

        mockMvc.perform(get("/api/expenses"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/expenses")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "ada@example.com",
                                  "password": "wrong-password"
                                }
                                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rejectShortPasswordOnRegistration() throws Exception {
        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Ada",
                                  "email": "short@example.com",
                                  "password": "short"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void usersCannotAccessAnotherUsersExpenses() throws Exception {
        String firstUserToken = registerAndLogin("first@example.com", "First");
        String secondUserToken = registerAndLogin("second@example.com", "Second");

        MvcResult categoryResult = mockMvc.perform(post("/api/categories")
                        .header("Authorization", "Bearer " + firstUserToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Food\"}"))
                .andExpect(status().isOk())
                .andReturn();
        Number categoryIdValue = JsonPath.read(
                categoryResult.getResponse().getContentAsString(),
                "$.id"
        );
        Long categoryId = categoryIdValue.longValue();

        MvcResult expenseResult = mockMvc.perform(post("/api/expenses")
                        .header("Authorization", "Bearer " + firstUserToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "amount": 12.50,
                                  "categoryId": %d,
                                  "description": "Lunch",
                                  "expenseDate": "2026-10-26"
                                }
                                """.formatted(categoryId)))
                .andExpect(status().isCreated())
                .andReturn();
        Number expenseIdValue = JsonPath.read(
                expenseResult.getResponse().getContentAsString(),
                "$.id"
        );
        Long expenseId = expenseIdValue.longValue();

        mockMvc.perform(get("/api/expenses")
                        .header("Authorization", "Bearer " + secondUserToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isEmpty());

        mockMvc.perform(get("/api/expenses/{id}", expenseId)
                        .header("Authorization", "Bearer " + secondUserToken))
                .andExpect(status().isNotFound());

        mockMvc.perform(put("/api/expenses/{id}", expenseId)
                        .header("Authorization", "Bearer " + secondUserToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "amount": 99.00,
                                  "categoryId": %d,
                                  "description": "Changed",
                                  "expenseDate": "2026-10-27"
                                }
                                """.formatted(categoryId)))
                .andExpect(status().isNotFound());

        mockMvc.perform(delete("/api/expenses/{id}", expenseId)
                        .header("Authorization", "Bearer " + secondUserToken))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/expenses/{id}", expenseId)
                        .header("Authorization", "Bearer " + firstUserToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Lunch"));
    }

    private String registerAndLogin(String email, String name) throws Exception {
        mockMvc.perform(post("/api/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "%s",
                                  "email": "%s",
                                  "password": "password1"
                                }
                                """.formatted(name, email)))
                .andExpect(status().isCreated());

        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "password1"
                                }
                                """.formatted(email)))
                .andExpect(status().isOk())
                .andReturn();

        return JsonPath.read(
                login.getResponse().getContentAsString(),
                "$.token"
        );
    }
}
