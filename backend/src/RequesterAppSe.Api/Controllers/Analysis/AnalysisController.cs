using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RequesterAppSe.Application.Analysis;

namespace RequesterAppSe.Api.Controllers.Analysis;

[ApiController]
[Authorize(Policy = "AnalysisAccess")]
[Route("api/analysis")]
public class AnalysisController : ControllerBase
{
    private readonly AnalysisService _analysisService;

    public AnalysisController(AnalysisService analysisService)
    {
        _analysisService = analysisService;
    }

    [HttpGet("overview")]
    public async Task<ActionResult<AnalysisOverviewDto>> GetOverview()
    {
        return Ok(await _analysisService.GetOverviewAsync());
    }
}
