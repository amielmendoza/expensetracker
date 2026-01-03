namespace ExpenseTracker.Server.Models;

public class Expense
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public long CategoryId { get; set; }
    public DateTime Date { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public string Tags { get; set; } = string.Empty; // JSON array stored as string
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    
    // Navigation property
    public Category Category { get; set; } = null!;
}

