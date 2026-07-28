package com.foodconnect.service;

import com.foodconnect.dto.common.PagedResponse;

import java.util.Map;

public interface AdminService {
    Map<String, Object> getDashboardStats();
    PagedResponse<?> getAllActivityLogs(int page, int size);
}
