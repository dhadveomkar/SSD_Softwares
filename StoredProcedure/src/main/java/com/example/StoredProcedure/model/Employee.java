package com.example.StoredProcedure.model;

import jakarta.persistence.*;
import java.io.Serializable;
import java.math.BigDecimal;

@Entity
@Table(name = "Employees")
@NamedStoredProcedureQuery(
    name = "Employee.getEmployeesByRole",
    procedureName = "dbo.GetEmployeesByRole",
    resultClasses = Employee.class,
    parameters = {
        @StoredProcedureParameter(mode = ParameterMode.IN, name = "Role", type = String.class)
    }
)
public class Employee implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id") // Maps to SQL 'Id'
    private Integer id;

    @Column(name = "Name") // Maps to SQL 'Name'
    private String name;

    @Column(name = "Role") // Maps to SQL 'Role'
    private String role;

    @Column(name = "Salary") // Maps to SQL 'Salary'
    private BigDecimal salary;

    public Employee() {}

    public Employee(String name, String role, BigDecimal salary) {
        this.name = name;
        this.role = role;
        this.salary = salary;
    }

    // Getters and Setters
    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public BigDecimal getSalary() { return salary; }
    public void setSalary(BigDecimal salary) { this.salary = salary; }
}