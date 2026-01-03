using ExpenseTracker.Server.DTOs;

namespace ExpenseTracker.Server.Services;

public interface IDashboardService
{
    Task<DashboardSummaryDto> GetSummaryAsync();
}


