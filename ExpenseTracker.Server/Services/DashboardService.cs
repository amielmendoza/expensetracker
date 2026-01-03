using AutoMapper;
using ExpenseTracker.Server.DTOs;
using ExpenseTracker.Server.Repositories;

namespace ExpenseTracker.Server.Services;

public class DashboardService : IDashboardService
{
    private readonly IExpenseRepository _expenseRepository;
    private readonly IMapper _mapper;

    public DashboardService(IExpenseRepository expenseRepository, IMapper mapper)
    {
        _expenseRepository = expenseRepository ?? throw new ArgumentNullException(nameof(expenseRepository));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
    }

    public async Task<DashboardSummaryDto> GetSummaryAsync()
    {
        // Use UTC dates for PostgreSQL compatibility
        var utcNow = DateTime.UtcNow;
        var today = new DateTime(utcNow.Year, utcNow.Month, utcNow.Day, 0, 0, 0, DateTimeKind.Utc);
        var tomorrow = today.AddDays(1);
        var yesterday = today.AddDays(-1);
        var startOfMonth = new DateTime(today.Year, today.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var endOfMonth = startOfMonth.AddMonths(1).AddTicks(-1);
        var daysRemaining = DateTime.DaysInMonth(today.Year, today.Month) - today.Day;

        // Today's expenses
        var todayTotal = await _expenseRepository.GetTotalByDateRangeAsync(today, tomorrow.AddTicks(-1));
        var todayCount = await _expenseRepository.GetCountByDateRangeAsync(today, tomorrow.AddTicks(-1));

        // Yesterday's expenses
        var yesterdayTotal = await _expenseRepository.GetTotalByDateRangeAsync(yesterday, today.AddTicks(-1));

        // This month's expenses
        var thisMonthTotal = await _expenseRepository.GetTotalByDateRangeAsync(startOfMonth, endOfMonth);
        var daysInMonth = DateTime.DaysInMonth(today.Year, today.Month);
        var thisMonthAverage = daysInMonth > 0 ? thisMonthTotal / daysInMonth : 0;

        // Recent expenses
        var recentExpenses = await _expenseRepository.GetRecentAsync(10);
        var recentExpensesDto = _mapper.Map<IEnumerable<ExpenseDto>>(recentExpenses).ToList();

        // Top categories this month
        var monthExpenses = await _expenseRepository.GetAllAsync(new ExpenseFilterDto
        {
            StartDate = startOfMonth,
            EndDate = endOfMonth
        });

        var categorySpending = monthExpenses
            .Where(e => e.Category != null)
            .GroupBy(e => new { e.CategoryId, e.Category!.Name, e.Category.Icon, e.Category.Color })
            .Select(g => new CategorySpendingDto
            {
                CategoryId = g.Key.CategoryId,
                CategoryName = g.Key.Name,
                CategoryIcon = g.Key.Icon,
                CategoryColor = g.Key.Color,
                TotalAmount = g.Sum(e => e.Amount),
                Count = g.Count()
            })
            .OrderByDescending(c => c.TotalAmount)
            .Take(5)
            .ToList();

        // Calculate percentages
        if (thisMonthTotal > 0)
        {
            foreach (var category in categorySpending)
            {
                category.Percentage = (double)(category.TotalAmount / thisMonthTotal * 100);
            }
        }

        return new DashboardSummaryDto
        {
            TodayTotal = todayTotal,
            TodayCount = todayCount,
            YesterdayTotal = yesterdayTotal,
            ThisMonthTotal = thisMonthTotal,
            ThisMonthAverage = thisMonthAverage,
            DaysRemainingInMonth = daysRemaining,
            TopCategories = categorySpending,
            RecentExpenses = recentExpensesDto
        };
    }
}

