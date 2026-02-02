package com.example.StoredProcedure.controller;

import com.example.StoredProcedure.model.Employee;
import com.example.StoredProcedure.service.EmployeeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/employees")
public class EmployeeController {

    private final EmployeeService employeeService;

    public EmployeeController(EmployeeService employeeService) {
        this.employeeService = employeeService;
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<Employee>> getEmployeesByRole(@PathVariable String role) {
        return ResponseEntity.ok(employeeService.getByRole(role));
    }

    @PostMapping
    public ResponseEntity<Employee> createEmployee(@RequestBody Employee employee) {
        return ResponseEntity.ok(employeeService.addEmployee(employee));
    }

    @PutMapping("/{id}/salary")
    public ResponseEntity<Employee> updateSalary(@PathVariable Integer id, @RequestParam BigDecimal salary) {
        return ResponseEntity.ok(employeeService.updateSalary(id, salary));
    }
}