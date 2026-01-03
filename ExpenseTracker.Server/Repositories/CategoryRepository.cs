using Microsoft.EntityFrameworkCore;
using ExpenseTracker.Server.Data;
using ExpenseTracker.Server.Models;

namespace ExpenseTracker.Server.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly ExpenseTrackerDbContext _context;

    public CategoryRepository(ExpenseTrackerDbContext context)
    {
        _context = context ?? throw new ArgumentNullException(nameof(context));
    }

    public async Task<IEnumerable<Category>> GetAllAsync()
    {
        return await _context.Categories
            .OrderBy(c => c.Name)
            .ToListAsync();
    }

    public async Task<Category?> GetByIdAsync(long id)
    {
        return await _context.Categories.FindAsync(id);
    }

    public async Task<Category> CreateAsync(Category category)
    {
        if (category == null)
        {
            throw new ArgumentNullException(nameof(category));
        }

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task<Category> UpdateAsync(Category category)
    {
        if (category == null)
        {
            throw new ArgumentNullException(nameof(category));
        }

        _context.Categories.Update(category);
        await _context.SaveChangesAsync();
        return category;
    }

    public async Task DeleteAsync(long id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category != null)
        {
            if (category.IsDefault)
            {
                throw new InvalidOperationException("Cannot delete default category");
            }

            var hasExpenses = await _context.Expenses.AnyAsync(e => e.CategoryId == id);
            if (hasExpenses)
            {
                throw new InvalidOperationException("Cannot delete category with associated expenses");
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
        }
    }
}

