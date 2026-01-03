namespace ExpenseTracker.Server.Models;

public class Budget
{
    public Guid Id { get; set; }
    public long? CategoryId { get; set; } // Null for overall budget
    public decimal Amount { get; set; }
    public BudgetPeriod Period { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public bool IsActive { get; set; }
    
    // Navigation property
    public Category? Category { get; set; }
}

