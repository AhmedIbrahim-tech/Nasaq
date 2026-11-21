using Application.Abstractions;
using Application.Features.Leaves.DTOs;
using Domain.Common;
using Domain.Entities;
using Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace Application.Features.Leaves.Commands.CreateLeaveType;

public class CreateLeaveTypeHandler : IRequestHandler<CreateLeaveTypeCommand, GenericBaseResponse<LeaveTypeDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;

    public CreateLeaveTypeHandler(IApplicationDbContext context, IUnitOfWork unitOfWork)
    {
        _context = context;
        _unitOfWork = unitOfWork;
    }

    public async Task<GenericBaseResponse<LeaveTypeDto>> Handle(
        CreateLeaveTypeCommand request,
        CancellationToken cancellationToken)
    {
        var normalizedCode = request.Code.Trim().ToUpperInvariant();

        var codeExists = await _context.LeaveTypes
            .AnyAsync(t => t.Code == normalizedCode, cancellationToken);

        if (codeExists)
        {
            return GenericBaseResponse<LeaveTypeDto>.Fail(
                $"A leave type with code '{normalizedCode}' already exists.",
                HttpStatusCode.Conflict);
        }

        var leaveType = new LeaveType
        {
            Id = Guid.NewGuid(),
            Name = request.Name.Trim(),
            NameAr = request.NameAr.Trim(),
            Code = normalizedCode,
            Description = request.Description?.Trim(),
            IsPaid = request.IsPaid,
            RequiresAttachment = request.RequiresAttachment,
            DefaultDaysPerYear = request.DefaultDaysPerYear,
            IsActive = true
        };

        await _context.LeaveTypes.AddAsync(leaveType, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new LeaveTypeDto
        {
            Id = leaveType.Id,
            Name = leaveType.Name,
            NameAr = leaveType.NameAr,
            Code = leaveType.Code,
            Description = leaveType.Description,
            IsPaid = leaveType.IsPaid,
            RequiresAttachment = leaveType.RequiresAttachment,
            DefaultDaysPerYear = leaveType.DefaultDaysPerYear,
            IsActive = leaveType.IsActive,
            ActiveRequestsCount = 0
        };

        return GenericBaseResponse<LeaveTypeDto>.Success(dto, "Leave type created successfully.", HttpStatusCode.Created);
    }
}
