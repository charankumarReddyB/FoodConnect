package com.foodconnect.controller;

import com.foodconnect.service.AdminService;
import com.foodconnect.service.UserService;
import com.foodconnect.repository.UserRepository;
import com.foodconnect.mapper.UserMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminService adminService;

    @MockBean
    private UserService userService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private UserMapper userMapper;

    @Test
    @WithMockUser(username = "donor@foodconnect.org", roles = {"DONOR"})
    @DisplayName("GET /api/v1/admin/stats - Non-Admin Role Receives 403 Forbidden")
    void getStats_NonAdminRole_Forbidden() throws Exception {
        mockMvc.perform(get("/api/v1/admin/stats"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "admin@foodconnect.org", roles = {"ADMIN"})
    @DisplayName("GET /api/v1/admin/stats - Admin Role Success")
    void getStats_AdminRole_Success() throws Exception {
        when(adminService.getDashboardStats()).thenReturn(Map.of("totalUsers", 100, "totalDonations", 50));

        mockMvc.perform(get("/api/v1/admin/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalUsers").value(100));
    }
}
