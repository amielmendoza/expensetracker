namespace ExpenseTracker.Server.DTOs;

public class DashboardSummaryDto
{
    public decimal TodayTotal { get; set; }
    public int TodayCount { get; set; }
    public decimal YesterdayTotal { get; set; }
    public decimal ThisMonthTotal { get; set; }
    public decimal ThisMonthAverage { get; set; }
    public int DaysRemainingInMonth { get; set; }
    public List<CategorySpendingDto> TopCategories { get; set; } = new();
    public List<ExpenseDto> RecentExpenses { get; set; } = new();
}

public class CategorySpendingDto
{
    public long CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryIcon { get; set; } = string.Empty;
    public string CategoryColor { get; set; } = string.Empty;
    public decimal TotalAmount { get; set; }
    public int Count { get; set; }
    public double Percentage { get; set; }
}

