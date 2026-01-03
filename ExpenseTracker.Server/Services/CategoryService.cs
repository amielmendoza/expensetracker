using AutoMapper;
using ExpenseTracker.Server.DTOs;
using ExpenseTracker.Server.Models;
using ExpenseTracker.Server.Repositories;

namespace ExpenseTracker.Server.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;
    private readonly IMapper _mapper;

    public CategoryService(ICategoryRepository categoryRepository, IMapper mapper)
    {
        _categoryRepository = categoryRepository ?? throw new ArgumentNullException(nameof(categoryRepository));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
    }

    public async Task<IEnumerable<CategoryDto>> GetAllAsync()
    {
        var categories = await _categoryRepository.GetAllAsync();
        return _mapper.Map<IEnumerable<CategoryDto>>(categories);
    }

    public async Task<CategoryDto?> GetByIdAsync(long id)
    {
        var category = await _categoryRepository.GetByIdAsync(id);
        return category == null ? null : _mapper.Map<CategoryDto>(category);
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryDto createDto)
    {
        if (createDto == null)
        {
            throw new ArgumentNullException(nameof(createDto));
        }

        if (string.IsNullOrWhiteSpace(createDto.Name))
        {
            throw new ArgumentException("Category name is required", nameof(createDto));
        }

        var category = _mapper.Map<Category>(createDto);
        var createdCategory = await _categoryRepository.CreateAsync(category);
        return _mapper.Map<CategoryDto>(createdCategory);
    }

    public async Task<CategoryDto> UpdateAsync(long id, CreateCategoryDto updateDto)
    {
        if (updateDto == null)
        {
            throw new ArgumentNullException(nameof(updateDto));
        }

        if (string.IsNullOrWhiteSpace(updateDto.Name))
        {
            throw new ArgumentException("Category name is required", nameof(updateDto));
        }

        var existingCategory = await _categoryRepository.GetByIdAsync(id);
        if (existingCategory == null)
        {
            throw new KeyNotFoundException($"Category with ID {id} not found");
        }

        if (existingCategory.IsDefault)
        {
            throw new InvalidOperationException("Cannot modify default category");
        }

        _mapper.Map(updateDto, existingCategory);
        var updatedCategory = await _categoryRepository.UpdateAsync(existingCategory);
        return _mapper.Map<CategoryDto>(updatedCategory);
    }

    public async Task DeleteAsync(long id)
    {
        await _categoryRepository.DeleteAsync(id);
    }
}

