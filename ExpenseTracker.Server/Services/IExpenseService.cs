using ExpenseTracker.Server.DTOs;

namespace ExpenseTracker.Server.Services;

public interface IExpenseService
{
    Task<ExpenseDto?> GetByIdAsync(Guid id);
    Task<IEnumerable<ExpenseDto>> GetAllAsync(ExpenseFilterDto filter);
    Task<ExpenseDto> CreateAsync(CreateExpenseDto createDto);
    Task<ExpenseDto> UpdateAsync(Guid id, UpdateExpenseDto updateDto);
    Task DeleteAsync(Guid id);
    Task<IEnumerable<ExpenseDto>> GetTodayAsync();
    Task<IEnumerable<ExpenseDto>> GetThisMonthAsync();
}


