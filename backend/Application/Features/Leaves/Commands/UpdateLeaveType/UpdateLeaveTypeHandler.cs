using Application.Abstractions;
using Application.Features.Leaves.DTOs;
using Domain.Common;
using Domain.Repositories;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace Application.Features.Leaves.Commands.UpdateLeaveType;

public class UpdateLeaveTypeHandler : IRequestHandler<UpdateLeaveTypeCommand, GenericBaseResponse<LeaveTypeDto>>
{
    private readonly IApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateLeaveTypeHandler(IApplicationDbContext context, IUnitOfWork unitOfWork)
    {
        _context = context;
        _unitOfWork = unitOfWork;
    }

    public async Task<GenericBaseResponse<LeaveTypeDto>> Handle(
        UpdateLeaveTypeCommand request,
        CancellationToken cancellationToken)
    {
        var leaveType = await _context.LeaveTypes
            .Include(t => t.LeaveRequests)
            .FirstOrDefaultAsync(t => t.Id == request.Id, cancellationToken);

        if (leaveType == null)
        {
            return GenericBaseResponse<LeaveTypeDto>.Fail("Leave type not found.", HttpStatusCode.NotFound);
        }

        var nameAr = !string.IsNullOrWhiteSpace(request.NameAr) ? request.NameAr.Trim() : null;
        var nameEn = !string.IsNullOrWhiteSpace(request.NameEn)
            ? request.NameEn.Trim()
            : (!string.IsNullOrWhiteSpace(request.Name) ? request.Name.Trim() : (nameAr ?? string.Empty));
        var descAr = !string.IsNullOrWhiteSpace(request.DescriptionAr) ? request.DescriptionAr.Trim() : null;
        var descEn = !string.IsNullOrWhiteSpace(request.DescriptionEn)
            ? request.DescriptionEn.Trim()
            : (!string.IsNullOrWhiteSpace(request.Description) ? request.Description.Trim() : null);

        leaveType.Name = nameEn;
        leaveType.NameAr = nameAr ?? nameEn;
        leaveType.Description = descEn;
        leaveType.DescriptionAr = descAr;
        leaveType.IsPaid = request.IsPaid;
        leaveType.RequiresAttachment = request.RequiresAttachment;
        leaveType.DefaultDaysPerYear = request.DefaultDaysPerYear;

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        var dto = new LeaveTypeDto
        {
            Id = leaveType.Id,
            Name = leaveType.Name,
            NameAr = leaveType.NameAr,
            Code = leaveType.Code,
            Description = leaveType.Description,
            DescriptionAr = leaveType.DescriptionAr,
            IsPaid = leaveType.IsPaid,
            RequiresAttachment = leaveType.RequiresAttachment,
            DefaultDaysPerYear = leaveType.DefaultDaysPerYear,
            IsActive = leaveType.IsActive,
            ActiveRequestsCount = leaveType.LeaveRequests.Count
        };

        return GenericBaseResponse<LeaveTypeDto>.Success(dto, "Leave type updated successfully.");
    }
}
