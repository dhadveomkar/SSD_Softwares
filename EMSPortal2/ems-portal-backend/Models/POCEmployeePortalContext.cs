using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace POCEmployeePortal.Models
{
    public partial class POCEmployeePortalContext : DbContext
    {
        public POCEmployeePortalContext()
        {
        }

        public POCEmployeePortalContext(DbContextOptions<POCEmployeePortalContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Attendance> Attendances { get; set; } = null!;
        public virtual DbSet<AttendanceRegularization> AttendanceRegularizations { get; set; } = null!;
        public virtual DbSet<DailyTask> DailyTasks { get; set; } = null!;
        public virtual DbSet<Holiday> Holidays { get; set; } = null!;
        public virtual DbSet<LeaveBalance> LeaveBalances { get; set; } = null!;
        public virtual DbSet<LeaveRequest> LeaveRequest { get; set; } = null!;
        public virtual DbSet<LeaveType> LeaveTypes { get; set; } = null!;
        public virtual DbSet<OfficeAddress> OfficeAddresses { get; set; } = null!;
        public virtual DbSet<Project> Projects { get; set; } = null!;
        public virtual DbSet<ProjectTask> ProjectTasks { get; set; } = null!;
        public virtual DbSet<TimeEntry> TimeEntries { get; set; } = null!;
        public virtual DbSet<WeeklyTimesheet> WeeklyTimesheets { get; set; } = null!;
        public virtual DbSet<Timesheet> Timesheets { get; set; } = null!;
        public virtual DbSet<Users> Users { get; set; } = null!;
        public virtual DbSet<LeaveCount> LeaveCount { get; set; } = null!;
        public virtual DbSet<TimesheetLeave> TimesheetLeaves { get; set; } = null!;

        public virtual DbSet<CompanyDetail> CompanyDetail { get; set; }

        public virtual DbSet<UserRoles> UserRoles { get; set; }

        public virtual DbSet<Designations> Designations { get; set; }

        public virtual DbSet<DepartmentNames> DepartmentNames { get; set; }

        public virtual DbSet<LeaveProData> LeaveProData { get; set; } = null!;

        public virtual DbSet<FiscalWeekMaster> FiscalWeekMasters { get; set; } = null!;
        protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        {
            if (!optionsBuilder.IsConfigured)
            {
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see http://go.microsoft.com/fwlink/?LinkId=723263.
                optionsBuilder.UseSqlServer("Server=LAPTOP-4E2DJM1J;Database=POCEmployeePortal;Trusted_Connection=True;");
            }
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Attendance>(entity =>
            {
                entity.ToTable("Attendance");

                entity.Property(e => e.CheckIn).HasColumnType("datetime");

                entity.Property(e => e.CheckOut).HasColumnType("datetime");

                entity.Property(e => e.Date).HasColumnType("date");

                entity.Property(e => e.Description)
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.Property(e => e.EmpId)
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.ManagerRemark)
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.Property(e => e.Name)
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.Shift)
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<CompanyDetail>(entity =>
            {
                entity.ToTable("CompanyDetail");

                entity.HasKey(e => e.CompanyId);

                entity.Property(e => e.CompanyName)
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.Property(e => e.StartDate)
                    .HasColumnType("date");

                entity.Property(e => e.EndDate)
                    .HasColumnType("date");
            });



            modelBuilder.Entity<DepartmentNames>(entity =>
            {
                entity.ToTable("DepartmentNames");

                entity.HasKey(x => x.DepartmentId);

                entity.Property(x => x.DepartmentName)
                    .HasMaxLength(100)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<Designations>(entity =>
            {
                entity.ToTable("Designations");

                entity.HasKey(x => x.DesignationId);

                entity.Property(x => x.DesignationName)
                    .HasMaxLength(100)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<UserRoles>(entity =>
            {
                entity.ToTable("UserRoles");

                entity.HasKey(x => x.RoleId);

                entity.Property(x => x.RoleName)
                    .HasMaxLength(100)
                    .IsUnicode(false);
            });



            modelBuilder.Entity<AttendanceRegularization>(entity =>
            {
                entity.HasKey(e => e.RequestId)
                    .HasName("PK__Attendan__33A8517AA0EC1107");

                entity.ToTable("AttendanceRegularization");

                entity.Property(e => e.CheckIn).HasColumnType("datetime");

                entity.Property(e => e.CheckOut).HasColumnType("datetime");

                entity.Property(e => e.Date).HasColumnType("date");

                entity.Property(e => e.EmpId)
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.Reason)
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.Property(e => e.Shift)
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<DailyTask>(entity =>
            {
                entity.HasKey(e => e.TaskId)
                    .HasName("PK__DailyTas__7C6949B16C7AF2DC");

                entity.ToTable("DailyTask");

                entity.Property(e => e.CompletedInHours).HasColumnType("decimal(10, 2)");

                entity.Property(e => e.EmpId).HasMaxLength(50);

                entity.Property(e => e.EndDate).HasColumnType("datetime");

                entity.Property(e => e.EstimatedHours).HasColumnType("decimal(10, 2)");

                entity.Property(e => e.ManagerName)
                    .IsUnicode(false)
                    .HasColumnName("managerName");

                entity.Property(e => e.Name).HasMaxLength(100);

                entity.Property(e => e.ProjectName)
                    .IsUnicode(false)
                    .HasColumnName("projectName");

                entity.Property(e => e.StartDate).HasColumnType("datetime");

                entity.Property(e => e.Status).HasMaxLength(50);
            });

            modelBuilder.Entity<Holiday>(entity =>
            {
                entity.Property(e => e.Date).HasColumnType("date");

                entity.Property(e => e.Description).HasColumnType("text");

                entity.Property(e => e.Type).HasColumnType("text");

                entity.Property(e => e.HolidaySet).HasColumnType("text");

                entity.Property(e => e.Name)
                    .HasMaxLength(100)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<LeaveBalance>(entity =>
            {
                entity.HasKey(e => e.BalanceId)
                    .HasName("PK__LeaveBal__A760D5BEC2D4A4CD");

                entity.Property(e => e.EmpId)
                    .HasMaxLength(20)
                    .IsUnicode(false);
            });


            modelBuilder.Entity<LeaveCount>(entity =>
            {
                entity.HasKey(e => e.LeaveCountId)
                    .HasName("PK__LeaveCount__A760D5BEC2D4A4CD");

                entity.Property(e => e.TypeOfLeaveRequest)
                   .HasMaxLength(20)
                   .IsUnicode(false);

                entity.Property(e => e.CompanyName)
                   .HasMaxLength(20)
                   .IsUnicode(false);

                entity.Property(e => e.Count)
                   .HasMaxLength(20)
                   .IsUnicode(false);

                entity.Property(e => e.CreatedBy)
                   .HasMaxLength(20)
                   .IsUnicode(false);

                entity.Property(e => e.CreatedOn)
                   .HasMaxLength(20)
                   .IsUnicode(false);

                entity.Property(e => e.ModifiedBy)
                   .HasMaxLength(20)
                   .IsUnicode(false);

                entity.Property(e => e.ModifiedOn)
                   .HasMaxLength(20)
                   .IsUnicode(false);

                entity.Property(e => e.IsDeleted)
                   .HasMaxLength(20)
                   .IsUnicode(false);

                entity.Property(e => e.IsSatSun)
                   .IsUnicode(false);
            });

            modelBuilder.Entity<LeaveRequest>(entity =>
            {
                entity.HasKey(e => e.ApplicationId)
                    .HasName("PK__LeaveReq__C93A4C994604B788");

                entity.ToTable("LeaveRequest");

                entity.Property(e => e.Description)
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.Property(e => e.EmpId)
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.EndDate).HasColumnType("date");

                entity.Property(e => e.LeaveType)
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.ManagerRemark)
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.Property(e => e.Name)
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.StartDate).HasColumnType("date");

                entity.Property(e => e.Status)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.LeaveDuration)
                   .HasMaxLength(50)
                   .IsUnicode(false);

                entity.Property(e => e.To)
                 .HasMaxLength(50)
                 .IsUnicode(false);

                entity.Property(e => e.Cc)
                 .HasMaxLength(50)
                 .IsUnicode(false);

                entity.Property(e => e.LeaveCount);

                entity.Property(e => e.CreatedOn).HasColumnType("date");

                entity.Property(e => e.ApprovalName)
                .HasMaxLength(200)
                .IsUnicode(false);

                entity.Property(e => e.ApprovalEmail)
                .HasMaxLength(255)
                .IsUnicode(false);

                entity.Property(e => e.MailBody)
                .HasColumnType("nvarchar(max)");

            });

            modelBuilder.Entity<LeaveType>(entity =>
            {
                entity.Property(e => e.Description).HasColumnType("text");

                entity.Property(e => e.Name)
                    .HasMaxLength(100)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<OfficeAddress>(entity =>
            {
                entity.HasKey(e => e.AddressId)
                    .HasName("PK__OfficeAd__091C2AFB99D3FDF5");

                entity.ToTable("OfficeAddress");

                entity.Property(e => e.AddressId).HasDefaultValueSql("((1))");

                entity.Property(e => e.Address).HasMaxLength(200);

                entity.Property(e => e.City).HasMaxLength(50);

                entity.Property(e => e.CompanyName).HasMaxLength(100);

                entity.Property(e => e.Country).HasMaxLength(50);

                entity.Property(e => e.State).HasMaxLength(50);
            });

            modelBuilder.Entity<Project>(entity =>
            {
                entity.Property(e => e.Description).HasColumnType("text");

                entity.Property(e => e.EndDate).HasColumnType("date");

                entity.Property(e => e.Name)
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.Property(e => e.StartDate).HasColumnType("date");
            });

            modelBuilder.Entity<ProjectTask>(entity =>
            {
                entity.ToTable("ProjectTask");

                entity.Property(e => e.Description).HasColumnType("text");

                entity.Property(e => e.Name)
                    .HasMaxLength(100)
                    .IsUnicode(false);
            });

            modelBuilder.Entity<WeeklyTimesheet>(entity =>

            {

                entity.HasKey(e => e.TimesheetId)

                    .HasName("PK__WeeklyTi__848CBE2DF14089D3");

                entity.ToTable("WeeklyTimesheet");

                entity.Property(e => e.EmpId)

                    .HasMaxLength(100)

                    .IsUnicode(false);

                entity.Property(e => e.EmployeeName).HasMaxLength(100);

                entity.Property(e => e.FiscalWeek).HasMaxLength(50);

                entity.Property(e => e.FriDescription).HasMaxLength(1000);

                entity.Property(e => e.FriHours)

                    .HasColumnType("decimal(4, 2)")

                    .HasDefaultValueSql("((0))");

                entity.Property(e => e.FriLeave).HasMaxLength(1000);

                entity.Property(e => e.LeaveType).HasMaxLength(50);

                entity.Property(e => e.MonDescription).HasMaxLength(1000);

                entity.Property(e => e.MonHours)

                    .HasColumnType("decimal(4, 2)")

                    .HasDefaultValueSql("((0))");

                entity.Property(e => e.MonLeave).HasMaxLength(1000);

                entity.Property(e => e.Month).HasMaxLength(20);

                entity.Property(e => e.ProjectManager).HasMaxLength(100);

                entity.Property(e => e.ProjectName).HasMaxLength(100);

                entity.Property(e => e.SatDescription).HasMaxLength(1000);

                entity.Property(e => e.SatHours)

                    .HasColumnType("decimal(4, 2)")

                    .HasDefaultValueSql("((0))");

                entity.Property(e => e.SatLeave).HasMaxLength(1000);

                entity.Property(e => e.SunDescription).HasMaxLength(1000);

                entity.Property(e => e.SunHours)

                    .HasColumnType("decimal(4, 2)")

                    .HasDefaultValueSql("((0))");

                entity.Property(e => e.SunLeave).HasMaxLength(1000);

                entity.Property(e => e.ThursDescription).HasMaxLength(1000);

                entity.Property(e => e.ThursHours)

                    .HasColumnType("decimal(4, 2)")

                    .HasDefaultValueSql("((0))");

                entity.Property(e => e.ThursLeave).HasMaxLength(1000);

                entity.Property(e => e.TimesheetSatus).HasMaxLength(1000);

                entity.Property(e => e.TotalWeekHours).HasColumnType("decimal(5, 2)");

                entity.Property(e => e.TuesDescription).HasMaxLength(1000);

                entity.Property(e => e.TuesHours)

                    .HasColumnType("decimal(4, 2)")

                    .HasDefaultValueSql("((0))");

                entity.Property(e => e.TuesLeave).HasMaxLength(1000);

                entity.Property(e => e.WedDescription).HasMaxLength(1000);

                entity.Property(e => e.WedHours)

                    .HasColumnType("decimal(4, 2)")

                    .HasDefaultValueSql("((0))");

                entity.Property(e => e.WedLeave).HasMaxLength(1000);

            });
            modelBuilder.Entity<FiscalWeekMaster>(entity =>
            {
                entity.HasKey(e => e.FiscalWeekId)
                    .HasName("PK__FiscalWe__8394FB9F695A2B7B");

                entity.ToTable("FiscalWeekMaster");

                entity.Property(e => e.FiscalWeekId).HasColumnName("FiscalWeekID");

                entity.Property(e => e.EndDate).HasColumnType("date");

                entity.Property(e => e.StartDate).HasColumnType("date");
            });

            modelBuilder.Entity<TimeEntry>(entity =>
            {
                entity.HasKey(e => e.EntryId)
                    .HasName("PK__TimeEntr__F57BD2F70DA77F6C");

                entity.Property(e => e.Date).HasColumnType("date");

                entity.Property(e => e.Description).HasColumnType("text");

                entity.Property(e => e.EmpId)
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.Hours).HasColumnType("decimal(5, 2)");
            });

            modelBuilder.Entity<Timesheet>(entity =>
            {
                entity.Property(e => e.CreatedDate).HasColumnType("datetime");

                entity.Property(e => e.EmpId).HasMaxLength(50);

                entity.Property(e => e.FilePath).HasMaxLength(255);

                entity.Property(e => e.UserName).HasMaxLength(100);
            });

            modelBuilder.Entity<LeaveProData>(entity =>
            {
                entity.ToTable("LeaveProData");

                entity.HasKey(e => e.Id);

                entity.Property(e => e.Month)
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.PaidLeaveBefore15)
                    .HasColumnType("decimal(10,2)");

                entity.Property(e => e.PaidLeaveAfter15)
                    .HasColumnType("decimal(10,2)");

                entity.Property(e => e.SickLeaveCasualLeaveBefore15)
                    .HasColumnName("SickLeave/CasualLeaveBefore15")
                    .HasColumnType("decimal(10,2)");

                entity.Property(e => e.SickLeaveCasualLeaveAfter15)
                    .HasColumnName("SickLeave/CasualLeaveAfter15")
                    .HasColumnType("decimal(10,2)");

                entity.Property(e => e.FlexHoliday)
                    .HasColumnType("decimal(10,2)");
            });


            modelBuilder.Entity<Users>(entity =>
            {
                entity.HasKey(e => e.EmpId)
                    .HasName("PK__Users__AF2DBB9963D88B63");

                entity.HasIndex(e => e.Email, "UQ__Users__A9D10534829954CD")
                    .IsUnique();

                entity.Property(e => e.EmpId)
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.Address)
                    .HasMaxLength(200)
                    .IsUnicode(false);

                entity.Property(e => e.DateOfBirth).HasColumnType("date");


                

              

                entity.Property(e => e.Holiday)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.Email)
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.Property(e => e.FirstName)
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.Property(e => e.Gender)
                    .HasMaxLength(10)
                    .IsUnicode(false);

                entity.Property(e => e.IsManagerAssigned).HasDefaultValueSql("((0))");

                entity.Property(e => e.JoiningDate).HasColumnType("date");

                entity.Property(e => e.LastName)
                    .HasMaxLength(100)
                    .IsUnicode(false);

                // entity.Property(e => e.ManagerId)
                //   .HasMaxLength(20)TimesheetLeave
                //   .IsUnicode(false);

                entity.Property(e => e.MiddleName)
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.Property(e => e.MobileNumber)
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.Password)
                    .HasMaxLength(255)
                    .IsUnicode(false);

                entity.Property(e => e.ReportingManager)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.Role)
                    .HasMaxLength(50)
                    .IsUnicode(false);

                entity.Property(e => e.UserName)
                    .HasMaxLength(100)
                    .IsUnicode(false);

                entity.Property(e => e.Timesheet)
                      .HasMaxLength(500)
                      .IsUnicode(false);

                entity.Property(e => e.CompanyId)
                    .HasMaxLength(20)
                    .IsUnicode(false);

                entity.Property(e => e.ResetOtp).HasMaxLength(10);

                entity.Property(e => e.ResetOtpExpiry).HasColumnType("datetime");

                entity.Property(e => e.IsOtpVerified).HasDefaultValueSql("((0))");
            });
            modelBuilder.Entity<TimesheetLeave>(entity =>
            {
                entity.HasKey(e => e.SrNo)
                    .HasName("PK__Timeshee__C3A4D3AC5AA49DE9");

                entity.ToTable("TimesheetLeave");

                entity.Property(e => e.Day).HasMaxLength(20);

                entity.Property(e => e.EmployeeName).HasMaxLength(100);

                entity.Property(e => e.FiscalWeek).HasMaxLength(50);

                entity.Property(e => e.LeaveType).HasMaxLength(50);

                entity.Property(e => e.Allocate)
                         .HasColumnType("float");   // SQL Server double

                entity.Property(e => e.Taken)
                      .HasColumnType("float");
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
