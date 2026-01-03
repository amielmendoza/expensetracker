using Microsoft.AspNetCore.Mvc;
using ExpenseTracker.Server.DTOs;
using ExpenseTracker.Server.Services;

namespace ExpenseTracker.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExpensesController : ControllerBase
{
    private readonly IExpenseService _expenseService;
    private readonly ILogger<ExpensesController> _logger;

    public ExpensesController(IExpenseService expenseService, ILogger<ExpensesController> logger)
    {
        _expenseService = expenseService ?? throw new ArgumentNullException(nameof(expenseService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ExpenseDto>>> GetAll([FromQuery] ExpenseFilterDto? filter)
    {
        try
        {
            var expenses = await _expenseService.GetAllAsync(filter ?? new ExpenseFilterDto());
            return Ok(expenses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving expenses: {Message}", ex.Message);
            _logger.LogError(ex, "Stack trace: {StackTrace}", ex.StackTrace);
            return StatusCode(500, new { message = "An error occurred while retrieving expenses", error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ExpenseDto>> GetById(Guid id)
    {
        try
        {
            var expense = await _expenseService.GetByIdAsync(id);
            if (expense == null)
            {
                return NotFound();
            }
            return Ok(expense);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving expense with ID {ExpenseId}", id);
            return StatusCode(500, "An error occurred while retrieving the expense");
        }
    }

    [HttpGet("today")]
    public async Task<ActionResult<IEnumerable<ExpenseDto>>> GetToday()
    {
        try
        {
            var expenses = await _expenseService.GetTodayAsync();
            return Ok(expenses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving today's expenses");
            return StatusCode(500, "An error occurred while retrieving today's expenses");
        }
    }

    [HttpGet("this-month")]
    public async Task<ActionResult<IEnumerable<ExpenseDto>>> GetThisMonth()
    {
        try
        {
            var expenses = await _expenseService.GetThisMonthAsync();
            return Ok(expenses);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving this month's expenses");
            return StatusCode(500, "An error occurred while retrieving this month's expenses");
        }
    }

    [HttpPost]
    public async Task<ActionResult<ExpenseDto>> Create([FromBody] CreateExpenseDto createDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var expense = await _expenseService.CreateAsync(createDto);
            return CreatedAtAction(nameof(GetById), new { id = expense.Id }, expense);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument when creating expense");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating expense");
            return StatusCode(500, "An error occurred while creating the expense");
        }
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ExpenseDto>> Update(Guid id, [FromBody] UpdateExpenseDto updateDto)
    {
        try
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var expense = await _expenseService.UpdateAsync(id, updateDto);
            return Ok(expense);
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid argument when updating expense {ExpenseId}", id);
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating expense {ExpenseId}", id);
            return StatusCode(500, "An error occurred while updating the expense");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _expenseService.DeleteAsync(id);
            return NoContent();
        }
        catch (KeyNotFoundException)
        {
            return NotFound();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting expense {ExpenseId}", id);
            return StatusCode(500, "An error occurred while deleting the expense");
        }
    }
}

