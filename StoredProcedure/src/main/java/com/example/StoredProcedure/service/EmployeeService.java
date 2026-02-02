package com.example.StoredProcedure.service;

import com.example.StoredProcedure.model.Employee;
import com.example.StoredProcedure.repository.EmployeeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
public class EmployeeService {

    private final EmployeeRepository repository;

    public EmployeeService(EmployeeRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<Employee> getByRole(String role) {
        return repository.getEmployeesByRole(role);
    }

    @Transactional
    public Employee addEmployee(Employee employee) {
        return repository.save(employee);
    }

    @Transactional
    public Employee updateSalary(Integer id, BigDecimal salary) {
        Employee emp = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        emp.setSalary(salary);
        return repository.save(emp);
    }
}