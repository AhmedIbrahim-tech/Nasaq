namespace Application.Features.Shifts.Commands.DeleteShift;

public sealed record DeleteShiftCommand(Guid Id) : IRequest<GenericBaseResponse<object?>>;
