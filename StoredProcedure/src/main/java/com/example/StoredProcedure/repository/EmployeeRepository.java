package com.example.StoredProcedure.repository;

import com.example.StoredProcedure.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.query.Procedure;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {

    @Procedure(name = "Employee.getEmployeesByRole")
    List<Employee> getEmployeesByRole(@Param("Role") String role);
}