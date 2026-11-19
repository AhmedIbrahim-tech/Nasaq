using Application.Abstractions;
using Domain.Common;
using MediatR;
using Microsoft.AspNetCore.Http;

namespace Application.Features.Auth.Commands.UploadAvatar;

public sealed record UploadAvatarCommand(string? UserId, IFormFile File) : IRequest<GenericBaseResponse<string>>;
