using AutoMapper;
using ExpenseTracker.Server.DTOs;
using ExpenseTracker.Server.Models;
using ExpenseTracker.Server.Repositories;

namespace ExpenseTracker.Server.Services;

public class ExpenseService : IExpenseService
{
    private readonly IExpenseRepository _expenseRepository;
    private readonly ICategoryRepository _categoryRepository;
    private readonly IMapper _mapper;

    public ExpenseService(
        IExpenseRepository expenseRepository,
        ICategoryRepository categoryRepository,
        IMapper mapper)
    {
        _expenseRepository = expenseRepository ?? throw new ArgumentNullException(nameof(expenseRepository));
        _categoryRepository = categoryRepository ?? throw new ArgumentNullException(nameof(categoryRepository));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
    }

    public async Task<ExpenseDto?> GetByIdAsync(Guid id)
    {
        var expense = await _expenseRepository.GetByIdAsync(id);
        return expense == null ? null : _mapper.Map<ExpenseDto>(expense);
    }

    public async Task<IEnumerable<ExpenseDto>> GetAllAsync(ExpenseFilterDto filter)
    {
        if (filter == null)
        {
            filter = new ExpenseFilterDto();
        }
        var expenses = await _expenseRepository.GetAllAsync(filter);
        return _mapper.Map<IEnumerable<ExpenseDto>>(expenses);
    }

    public async Task<ExpenseDto> CreateAsync(CreateExpenseDto createDto)
    {
        if (createDto == null)
        {
            throw new ArgumentNullException(nameof(createDto));
        }

        if (createDto.Amount <= 0)
        {
            throw new ArgumentException("Amount must be greater than zero", nameof(createDto));
        }

        var category = await _categoryRepository.GetByIdAsync(createDto.CategoryId);
        if (category == null)
        {
            throw new ArgumentException("Category not found", nameof(createDto.CategoryId));
        }

        var expense = _mapper.Map<Expense>(createDto);
        var createdExpense = await _expenseRepository.CreateAsync(expense);
        return _mapper.Map<ExpenseDto>(createdExpense);
    }

    public async Task<ExpenseDto> UpdateAsync(Guid id, UpdateExpenseDto updateDto)
    {
        if (updateDto == null)
        {
            throw new ArgumentNullException(nameof(updateDto));
        }

        if (updateDto.Amount <= 0)
        {
            throw new ArgumentException("Amount must be greater than zero", nameof(updateDto));
        }

        var existingExpense = await _expenseRepository.GetByIdAsync(id);
        if (existingExpense == null)
        {
            throw new KeyNotFoundException($"Expense with ID {id} not found");
        }

        var category = await _categoryRepository.GetByIdAsync(updateDto.CategoryId);
        if (category == null)
        {
            throw new ArgumentException("Category not found", nameof(updateDto.CategoryId));
        }

        _mapper.Map(updateDto, existingExpense);
        var updatedExpense = await _expenseRepository.UpdateAsync(existingExpense);
        return _mapper.Map<ExpenseDto>(updatedExpense);
    }

    public async Task DeleteAsync(Guid id)
    {
        var expense = await _expenseRepository.GetByIdAsync(id);
        if (expense == null)
        {
            throw new KeyNotFoundException($"Expense with ID {id} not found");
        }

        await _expenseRepository.DeleteAsync(id);
    }

    public async Task<IEnumerable<ExpenseDto>> GetTodayAsync()
    {
        // Use UTC dates for PostgreSQL compatibility
        var utcNow = DateTime.UtcNow;
        var today = new DateTime(utcNow.Year, utcNow.Month, utcNow.Day, 0, 0, 0, DateTimeKind.Utc);
        var tomorrow = today.AddDays(1);
        var filter = new ExpenseFilterDto
        {
            StartDate = today,
            EndDate = tomorrow.AddTicks(-1)
        };
        return await GetAllAsync(filter);
    }

    public async Task<IEnumerable<ExpenseDto>> GetThisMonthAsync()
    {
        // Use UTC dates for PostgreSQL compatibility
        var utcNow = DateTime.UtcNow;
        var startOfMonth = new DateTime(utcNow.Year, utcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var endOfMonth = startOfMonth.AddMonths(1).AddTicks(-1);
        var filter = new ExpenseFilterDto
        {
            StartDate = startOfMonth,
            EndDate = endOfMonth
        };
        return await GetAllAsync(filter);
    }
}

