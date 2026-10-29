package com.aditya.finance_manager;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import com.aditya.finance_manager.repository.UserRepository;

import com.jayway.jsonpath.JsonPath;
import java.time.Instant;

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

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtEncoder jwtEncoder;

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

        var registeredUser = userRepository.findByEmailIgnoreCase("ada@example.com")
                .orElseThrow();
        org.junit.jupiter.api.Assertions.assertNotEquals("password1", registeredUser.getPassword());
        org.junit.jupiter.api.Assertions.assertTrue(
                passwordEncoder.matches("password1", registeredUser.getPassword())
        );

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
                        .header("Authorization", "Bearer invalid.token.value"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/expenses")
                        .header("Authorization", "Bearer " + expiredToken()))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/categories"))
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
                .andExpect(status().isCreated())
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

        mockMvc.perform(get("/api/categories")
                        .header("Authorization", "Bearer " + secondUserToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Food"));

        mockMvc.perform(delete("/api/categories/{id}", categoryId)
                        .header("Authorization", "Bearer " + secondUserToken))
                .andExpect(status().isConflict());
    }

    @Test
    void categoriesTrimNamesRejectDuplicatesAndCanDeleteWhenUnused() throws Exception {
        String token = registerAndLogin("categories@example.com", "Categories");

        MvcResult categoryResult = mockMvc.perform(post("/api/categories")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"  Travel  \"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Travel"))
                .andReturn();
        Long categoryId = ((Number) JsonPath.read(
                categoryResult.getResponse().getContentAsString(), "$.id"
        )).longValue();

        mockMvc.perform(post("/api/categories")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"travel\"}"))
                .andExpect(status().isConflict());

        mockMvc.perform(delete("/api/categories/{id}", categoryId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isNoContent());
    }

    @Test
    void rejectInvalidExpenseAmountsAndFutureDates() throws Exception {
        String token = registerAndLogin("validation@example.com", "Validation");
        Long categoryId = ((Number) JsonPath.read(
                mockMvc.perform(post("/api/categories")
                                .header("Authorization", "Bearer " + token)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("{\"name\":\"Bills\"}"))
                        .andExpect(status().isCreated())
                        .andReturn().getResponse().getContentAsString(), "$.id"
        )).longValue();

        mockMvc.perform(post("/api/expenses")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount":-1,"categoryId":%d,"expenseDate":"2026-10-29"}
                                """.formatted(categoryId)))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/expenses")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"amount":1,"categoryId":%d,"expenseDate":"2026-10-29"}
                                """.formatted(categoryId)))
                .andExpect(status().isBadRequest());
    }

    private String expiredToken() {
        Instant expiredAt = Instant.now().minusSeconds(120);
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("finance-manager")
                .subject("1")
                .issuedAt(expiredAt.minusSeconds(60))
                .expiresAt(expiredAt)
                .claim("email", "expired@example.com")
                .build();
        return jwtEncoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(), claims
        )).getTokenValue();
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
