using System.Net;
using Application.Abstractions;
using Application.Features.Employees.DTOs;
using Domain.Common;
using Domain.Entities;
using Domain.Enums;
using Domain.Identity;
using Domain.Repositories;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Application.Features.Employees.Commands.UpdateMyProfilePhoto;

public sealed class UpdateMyProfilePhotoHandler(
    IApplicationDbContext dbContext,
    IUnitOfWork unitOfWork,
    IFileService fileService,
    ICurrentUser currentUser,
    UserManager<ApplicationUser> userManager,
    ILogger<UpdateMyProfilePhotoHandler>? logger = null)
    : IRequestHandler<UpdateMyProfilePhotoCommand, GenericBaseResponse<EmployeeDto>>
{
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp"
    };

    public async Task<GenericBaseResponse<EmployeeDto>> Handle(
        UpdateMyProfilePhotoCommand request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrEmpty(currentUser.UserId))
        {
            return GenericBaseResponse<EmployeeDto>.Unauthorized("User session is unauthenticated or invalid.");
        }

        if (request.Photo != null && request.RemovePhoto)
        {
            return GenericBaseResponse<EmployeeDto>.Fail(
                "Cannot upload a new profile photo and request removal at the same time.",
                HttpStatusCode.BadRequest);
        }

        if (request.Photo == null && !request.RemovePhoto)
        {
            return GenericBaseResponse<EmployeeDto>.Fail(
                "No photo provided for upload and removal was not requested.",
                HttpStatusCode.BadRequest);
        }

        var employee = await dbContext.Employees
            .Include(e => e.Supervisor)
            .Include(e => e.WorkLocation)
            .FirstOrDefaultAsync(e => e.UserId == currentUser.UserId, cancellationToken);

        if (employee == null)
        {
            return GenericBaseResponse<EmployeeDto>.NotFound("No employee profile is currently linked to your user account.");
        }

        if (request.Photo != null)
        {
            var ext = Path.GetExtension(request.Photo.FileName);
            if (string.IsNullOrEmpty(ext) || !AllowedExtensions.Contains(ext))
            {
                return GenericBaseResponse<EmployeeDto>.Fail(
                    $"Unsupported image format '{ext}'. Allowed formats: {string.Join(", ", AllowedExtensions)}.",
                    HttpStatusCode.BadRequest);
            }

            if (request.Photo.Length > 5 * 1024 * 1024)
            {
                return GenericBaseResponse<EmployeeDto>.Fail(
                    "Profile photo file size exceeds the 5 MB limit.",
                    HttpStatusCode.BadRequest);
            }
        }

        string? oldPhysicalPathToDelete = null;
        string? newCommittedPath = null;
        var commitAttempted = false;
        var committed = false;

        await unitOfWork.BeginTransactionAsync(cancellationToken);

        try
        {
            if (request.RemovePhoto)
            {
                if (employee.ProfilePhoto.HasValue)
                {
                    var oldStoredFile = await dbContext.StoredFiles
                        .FirstOrDefaultAsync(f => f.Id == employee.ProfilePhoto.Value, cancellationToken);
                    if (oldStoredFile != null)
                    {
                        oldPhysicalPathToDelete = oldStoredFile.RelativePath;
                        dbContext.StoredFiles.Remove(oldStoredFile);
                    }
                    employee.ProfilePhoto = null;
                }
            }
            else if (request.Photo != null)
            {
                if (employee.ProfilePhoto.HasValue)
                {
                    var oldStoredFile = await dbContext.StoredFiles
                        .FirstOrDefaultAsync(f => f.Id == employee.ProfilePhoto.Value, cancellationToken);
                    if (oldStoredFile != null)
                    {
                        oldPhysicalPathToDelete = oldStoredFile.RelativePath;
                        dbContext.StoredFiles.Remove(oldStoredFile);
                    }
                }

                var newStoredFile = await fileService.SaveAsync(
                    request.Photo,
                    FileCategory.Employees,
                    employee.Id,
                    cancellationToken);

                newCommittedPath = newStoredFile.RelativePath;
                employee.ProfilePhoto = newStoredFile.Id;
            }

            await dbContext.SaveChangesAsync(cancellationToken);

            commitAttempted = true;
            await unitOfWork.CommitAsync();
            committed = true;

            if (oldPhysicalPathToDelete != null)
            {
                try
                {
                    await fileService.DeleteAsync(oldPhysicalPathToDelete, CancellationToken.None);
                }
                catch (Exception delEx)
                {
                    logger?.LogWarning(delEx, "Failed to delete old physical file '{Path}' after employee photo update.", oldPhysicalPathToDelete);
                }
            }

            string? userRole = null;
            var user = await userManager.FindByIdAsync(currentUser.UserId);
            if (user != null)
            {
                var roles = await userManager.GetRolesAsync(user);
                userRole = roles.FirstOrDefault();
            }

            var dto = new EmployeeDto
            {
                Id = employee.Id,
                EmployeeCode = employee.EmployeeCode,
                FirstName = employee.FirstName,
                LastName = employee.LastName,
                FullName = employee.FullName,
                Email = employee.Email,
                PhoneNumber = employee.PhoneNumber,
                Department = employee.Department,
                JobTitle = employee.JobTitle,
                HireDate = employee.HireDate,
                IsActive = employee.IsActive,
                UserId = employee.UserId,
                UserRole = userRole,
                SupervisorId = employee.SupervisorId,
                SupervisorName = employee.Supervisor?.FullName,
                SupervisorCode = employee.Supervisor?.EmployeeCode,
                WorkLocationId = employee.WorkLocationId,
                WorkLocationName = employee.WorkLocation?.Name,
                ProfilePhoto = employee.ProfilePhoto,
                Created_Utc = employee.Created_Utc,
                Created_By = employee.Created_By,
                Updated_Utc = employee.Updated_Utc,
                Updated_By = employee.Updated_By
            };

            return GenericBaseResponse<EmployeeDto>.Success(
                dto,
                request.RemovePhoto ? "Profile photo removed successfully." : "Profile photo updated successfully.");
        }
        catch (Exception ex)
        {
            if (!commitAttempted)
            {
                try { await unitOfWork.RollbackAsync(); }
                catch (Exception rbEx) { logger?.LogError(rbEx, "Rollback failed during employee photo update."); }
            }

            if (!committed && newCommittedPath != null)
            {
                try { await fileService.DeleteAsync(newCommittedPath, CancellationToken.None); }
                catch (Exception compEx) { logger?.LogWarning(compEx, "Failed to clean up orphaned new file '{Path}'.", newCommittedPath); }
            }

            logger?.LogError(ex, "Unexpected error occurred during self-service profile photo update.");
            return GenericBaseResponse<EmployeeDto>.Fail(
                "An unexpected error occurred while processing the profile photo.",
                HttpStatusCode.InternalServerError);
        }
    }
}
