using AutoMapper;
using ExpenseTracker.Server.Models;
using ExpenseTracker.Server.DTOs;

namespace ExpenseTracker.Server.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // Expense mappings
        CreateMap<Expense, ExpenseDto>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category.Name))
            .ForMember(dest => dest.CategoryIcon, opt => opt.MapFrom(src => src.Category.Icon))
            .ForMember(dest => dest.CategoryColor, opt => opt.MapFrom(src => src.Category.Color))
            .ForMember(dest => dest.Tags, opt => opt.Ignore())
            .AfterMap((src, dest) =>
            {
                if (string.IsNullOrEmpty(src.Tags))
                {
                    dest.Tags = new List<string>();
                }
                else
                {
                    dest.Tags = System.Text.Json.JsonSerializer.Deserialize<List<string>>(src.Tags) ?? new List<string>();
                }
            });

        CreateMap<CreateExpenseDto, Expense>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Category, opt => opt.Ignore())
            .ForMember(dest => dest.Tags, opt => opt.Ignore())
            .AfterMap((src, dest) =>
            {
                dest.Tags = System.Text.Json.JsonSerializer.Serialize(src.Tags ?? new List<string>());
            });

        CreateMap<UpdateExpenseDto, Expense>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.UpdatedAt, opt => opt.Ignore())
            .ForMember(dest => dest.Category, opt => opt.Ignore())
            .ForMember(dest => dest.Tags, opt => opt.Ignore())
            .AfterMap((src, dest) =>
            {
                dest.Tags = System.Text.Json.JsonSerializer.Serialize(src.Tags ?? new List<string>());
            });

        // Category mappings
        CreateMap<Category, CategoryDto>();
        CreateMap<CreateCategoryDto, Category>()
            .ForMember(dest => dest.Id, opt => opt.Ignore())
            .ForMember(dest => dest.IsDefault, opt => opt.MapFrom(src => false));

        // Budget mappings
        CreateMap<Budget, BudgetDto>()
            .ForMember(dest => dest.CategoryName, opt => opt.MapFrom(src => src.Category != null ? src.Category.Name : null));
    }
}

