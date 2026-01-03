using ExpenseTracker.Server.Models;
using ExpenseTracker.Server.DTOs;

namespace ExpenseTracker.Server.Repositories;

public interface IExpenseRepository
{
    Task<Expense?> GetByIdAsync(Guid id);
    Task<IEnumerable<Expense>> GetAllAsync(ExpenseFilterDto filter);
    Task<Expense> CreateAsync(Expense expense);
    Task<Expense> UpdateAsync(Expense expense);
    Task DeleteAsync(Guid id);
    Task<decimal> GetTotalByDateRangeAsync(DateTime start, DateTime end);
    Task<IEnumerable<Expense>> GetByCategoryAsync(long categoryId, DateTime? start, DateTime? end);
    Task<IEnumerable<Expense>> GetRecentAsync(int count);
    Task<int> GetCountByDateRangeAsync(DateTime start, DateTime end);
}

