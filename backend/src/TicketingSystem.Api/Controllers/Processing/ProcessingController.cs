using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TicketingSystem.Application.Processing;

namespace TicketingSystem.Api.Controllers.Processing;

[ApiController]
[Authorize(Policy = "ProcessingAccess")]
[Route("api/processing")]
public class ProcessingController : ControllerBase
{
    private readonly ProcessingService _processingService;

    public ProcessingController(ProcessingService processingService)
    {
        _processingService = processingService;
    }

    [HttpGet("queue")]
    public async Task<ActionResult<ProcessingQueueDto>> GetQueue()
    {
        return Ok(await _processingService.GetQueueAsync());
    }
}
