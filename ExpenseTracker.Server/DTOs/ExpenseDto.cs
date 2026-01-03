using ExpenseTracker.Server.Models;

namespace ExpenseTracker.Server.DTOs;

public class ExpenseDto
{
    public Guid Id { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public long CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryIcon { get; set; } = string.Empty;
    public string CategoryColor { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public List<string> Tags { get; set; } = new();
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateExpenseDto
{
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public long CategoryId { get; set; }
    public DateTime Date { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public List<string> Tags { get; set; } = new();
    public string? Notes { get; set; }
}

public class UpdateExpenseDto
{
    public decimal Amount { get; set; }
    public string Description { get; set; } = string.Empty;
    public long CategoryId { get; set; }
    public DateTime Date { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public List<string> Tags { get; set; } = new();
    public string? Notes { get; set; }
}

public class ExpenseFilterDto
{
    public DateTime? StartDate { get; set; }
    public DateTime? EndDate { get; set; }
    public long? CategoryId { get; set; }
    public decimal? MinAmount { get; set; }
    public decimal? MaxAmount { get; set; }
    public PaymentMethod? PaymentMethod { get; set; }
    public string? SearchTerm { get; set; }
}

