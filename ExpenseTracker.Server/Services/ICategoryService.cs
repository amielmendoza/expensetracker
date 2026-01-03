using ExpenseTracker.Server.DTOs;

namespace ExpenseTracker.Server.Services;

public interface ICategoryService
{
    Task<IEnumerable<CategoryDto>> GetAllAsync();
    Task<CategoryDto?> GetByIdAsync(long id);
    Task<CategoryDto> CreateAsync(CreateCategoryDto createDto);
    Task<CategoryDto> UpdateAsync(long id, CreateCategoryDto updateDto);
    Task DeleteAsync(long id);
}

