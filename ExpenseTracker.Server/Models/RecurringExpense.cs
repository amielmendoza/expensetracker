namespace ExpenseTracker.Server.Models;

public class RecurringExpense
{
    public Guid Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public long CategoryId { get; set; }
    public RecurringFrequency Frequency { get; set; }
    public DateTime NextDueDate { get; set; }
    public bool IsActive { get; set; }
    
    // Navigation property
    public Category Category { get; set; } = null!;
}

