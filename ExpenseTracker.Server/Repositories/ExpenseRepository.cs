using Microsoft.EntityFrameworkCore;
using ExpenseTracker.Server.Data;
using ExpenseTracker.Server.Models;
using ExpenseTracker.Server.DTOs;

namespace ExpenseTracker.Server.Repositories;

public class ExpenseRepository : IExpenseRepository
{
    private readonly ExpenseTrackerDbContext _context;

    public ExpenseRepository(ExpenseTrackerDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<Expense?> GetByIdAsync(Guid id)
    {
        return await _context.Expenses
            .Include(e => e.Category)
            .FirstOrDefaultAsync(e => e.Id == id);
    }

    public async Task<IEnumerable<Expense>> GetAllAsync(ExpenseFilterDto filter)
    {
        if (filter == null)
        {
            filter = new ExpenseFilterDto();
        }

        var query = _context.Expenses.Include(e => e.Category).AsQueryable();

        if (filter.StartDate.HasValue)
        {
            // Ensure DateTime is UTC for PostgreSQL
            var startUtc = filter.StartDate.Value.Kind == DateTimeKind.Local 
                ? filter.StartDate.Value.ToUniversalTime() 
                : (filter.StartDate.Value.Kind == DateTimeKind.Unspecified 
                    ? DateTime.SpecifyKind(filter.StartDate.Value, DateTimeKind.Utc) 
                    : filter.StartDate.Value);
            query = query.Where(e => e.Date >= startUtc);
        }

        if (filter.EndDate.HasValue)
        {
            // Ensure DateTime is UTC for PostgreSQL
            var endUtc = filter.EndDate.Value.Kind == DateTimeKind.Local 
                ? filter.EndDate.Value.ToUniversalTime() 
                : (filter.EndDate.Value.Kind == DateTimeKind.Unspecified 
                    ? DateTime.SpecifyKind(filter.EndDate.Value, DateTimeKind.Utc) 
                    : filter.EndDate.Value);
            query = query.Where(e => e.Date <= endUtc);
        }

        if (filter.CategoryId.HasValue)
        {
            query = query.Where(e => e.CategoryId == filter.CategoryId.Value);
        }

        if (filter.MinAmount.HasValue)
        {
            query = query.Where(e => e.Amount >= filter.MinAmount.Value);
        }

        if (filter.MaxAmount.HasValue)
        {
            query = query.Where(e => e.Amount <= filter.MaxAmount.Value);
        }

        if (filter.PaymentMethod.HasValue)
        {
            query = query.Where(e => e.PaymentMethod == filter.PaymentMethod.Value);
        }

        if (filter.SearchTerm != null && filter.SearchTerm.Length > 0)
        {
            var searchTerm = filter.SearchTerm.Trim().ToLower();
            if (searchTerm.Length > 0)
            {
                query = query.Where(e => 
                    e.Description.ToLower().Contains(searchTerm) ||
                    (e.Notes != null && e.Notes.ToLower().Contains(searchTerm)));
            }
        }

        return await query.OrderByDescending(e => e.Date).ThenByDescending(e => e.CreatedAt).ToListAsync();
    }

    public async Task<Expense> CreateAsync(Expense expense)
    {
        if (expense == null)
        {
            throw new ArgumentNullException(nameof(expense));
        }

        expense.CreatedAt = DateTime.UtcNow;
        expense.UpdatedAt = DateTime.UtcNow;

        _context.Expenses.Add(expense);
        await _context.SaveChangesAsync();
        await _context.Entry(expense).Reference(e => e.Category).LoadAsync();
        return expense;
    }

    public async Task<Expense> UpdateAsync(Expense expense)
    {
        if (expense == null)
        {
            throw new ArgumentNullException(nameof(expense));
        }

        expense.UpdatedAt = DateTime.UtcNow;
        _context.Expenses.Update(expense);
        await _context.SaveChangesAsync();
        await _context.Entry(expense).Reference(e => e.Category).LoadAsync();
        return expense;
    }

    public async Task DeleteAsync(Guid id)
    {
        var expense = await _context.Expenses.FindAsync(id);
        if (expense != null)
        {
            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();
        }
    }

    public async Task<decimal> GetTotalByDateRangeAsync(DateTime start, DateTime end)
    {
        // Ensure DateTime values are UTC for PostgreSQL
        var startUtc = start.Kind == DateTimeKind.Local ? start.ToUniversalTime() : (start.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(start, DateTimeKind.Utc) : start);
        var endUtc = end.Kind == DateTimeKind.Local ? end.ToUniversalTime() : (end.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(end, DateTimeKind.Utc) : end);
        
        return await _context.Expenses
            .Where(e => e.Date >= startUtc && e.Date <= endUtc)
            .SumAsync(e => e.Amount);
    }

    public async Task<IEnumerable<Expense>> GetByCategoryAsync(long categoryId, DateTime? start, DateTime? end)
    {
        var query = _context.Expenses
            .Include(e => e.Category)
            .Where(e => e.CategoryId == categoryId);

        if (start.HasValue)
        {
            // Ensure DateTime is UTC for PostgreSQL
            var startUtc = start.Value.Kind == DateTimeKind.Local ? start.Value.ToUniversalTime() : (start.Value.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(start.Value, DateTimeKind.Utc) : start.Value);
            query = query.Where(e => e.Date >= startUtc);
        }

        if (end.HasValue)
        {
            // Ensure DateTime is UTC for PostgreSQL
            var endUtc = end.Value.Kind == DateTimeKind.Local ? end.Value.ToUniversalTime() : (end.Value.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(end.Value, DateTimeKind.Utc) : end.Value);
            query = query.Where(e => e.Date <= endUtc);
        }

        return await query.OrderByDescending(e => e.Date).ToListAsync();
    }

    public async Task<IEnumerable<Expense>> GetRecentAsync(int count)
    {
        return await _context.Expenses
            .Include(e => e.Category)
            .OrderByDescending(e => e.Date)
            .ThenByDescending(e => e.CreatedAt)
            .Take(count)
            .ToListAsync();
    }

    public async Task<int> GetCountByDateRangeAsync(DateTime start, DateTime end)
    {
        // Ensure DateTime values are UTC for PostgreSQL
        var startUtc = start.Kind == DateTimeKind.Local ? start.ToUniversalTime() : (start.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(start, DateTimeKind.Utc) : start);
        var endUtc = end.Kind == DateTimeKind.Local ? end.ToUniversalTime() : (end.Kind == DateTimeKind.Unspecified ? DateTime.SpecifyKind(end, DateTimeKind.Utc) : end);
        
        return await _context.Expenses
            .Where(e => e.Date >= startUtc && e.Date <= endUtc)
            .CountAsync();
    }
}

