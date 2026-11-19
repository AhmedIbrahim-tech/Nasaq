using System.Reflection;
using Application.Common.Behaviors;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;

namespace Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Register QuestPDF fonts once at startup
        Application.Features.Reports.Exporting.ReportExportEngine.InitializeFonts();

        var assembly = Assembly.GetExecutingAssembly();

        // Add FluentValidation validators
        services.AddValidatorsFromAssembly(assembly);

        // Add MediatR with automatic handler discovery and validation pipeline behavior
        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(assembly);
            cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
        });

        return services;
    }
}
