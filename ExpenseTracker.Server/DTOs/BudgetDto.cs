using ExpenseTracker.Server.Models;

namespace ExpenseTracker.Server.DTOs;

public class BudgetDto
{
    public Guid Id { get; set; }
    public long? CategoryId { get; set; }
    public string? CategoryName { get; set; }
    public decimal Amount { get; set; }
    public BudgetPeriod Period { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
    public decimal? SpentAmount { get; set; }
    public decimal? RemainingAmount { get; set; }
}

public class CreateBudgetDto
{
    public long? CategoryId { get; set; }
    public decimal Amount { get; set; }
    public BudgetPeriod Period { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
}

