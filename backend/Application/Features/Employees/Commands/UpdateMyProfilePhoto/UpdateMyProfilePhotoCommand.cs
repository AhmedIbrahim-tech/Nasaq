using Application.Features.Employees.DTOs;
using Domain.Common;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Application.Features.Employees.Commands.UpdateMyProfilePhoto;

public sealed record UpdateMyProfilePhotoCommand : IRequest<GenericBaseResponse<EmployeeDto>>
{
    public IFormFile? Photo { get; init; }
    public bool RemovePhoto { get; init; }
}
