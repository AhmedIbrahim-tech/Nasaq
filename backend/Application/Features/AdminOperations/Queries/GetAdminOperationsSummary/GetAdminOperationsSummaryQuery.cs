using Application.Features.AdminOperations.DTOs;
using Domain.Common;
using MediatR;

namespace Application.Features.AdminOperations.Queries.GetAdminOperationsSummary;

public sealed record GetAdminOperationsSummaryQuery : IRequest<GenericBaseResponse<AdminOperationsSummaryDto>>;
