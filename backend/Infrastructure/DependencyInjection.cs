using System.Collections.Generic;
using Application.Abstractions;
using Application.Configuration;
using Domain.Identity;
using Domain.Repositories;
using Infrastructure.Authentication;
using Infrastructure.Data;
using Infrastructure.Data.Interceptors;
using Infrastructure.Email;
using Infrastructure.Repositories;
using Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;

namespace Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<EmailOptions>(configuration.GetSection(EmailOptions.SectionName));
        services.Configure<JwtSettings>(configuration.GetSection(JwtSettings.SectionName));
        services.Configure<DefaultAdminOptions>(configuration.GetSection(DefaultAdminOptions.SectionName));
        services.Configure<StorageOptions>(configuration.GetSection(StorageOptions.SectionName));

        var protectedUsersSection = configuration.GetSection(ProtectedUsersOptions.SectionName);
        if (protectedUsersSection.Exists())
        {
            var directList = protectedUsersSection.Get<List<string>>();
            if (directList is { Count: > 0 })
            {
                services.Configure<ProtectedUsersOptions>(options => options.Emails = directList);
            }
            else
            {
                services.Configure<ProtectedUsersOptions>(protectedUsersSection);
            }
        }
        else
        {
            services.Configure<ProtectedUsersOptions>(_ => { });
        }

        services.AddHttpContextAccessor();

        services.AddScoped<IEmailService, SmtpEmailService>();
        services.AddTransient<Microsoft.AspNetCore.Identity.UI.Services.IEmailSender, IdentityEmailSender>();

        services.AddScoped<AuditSaveChangesInterceptor>();
        services.AddDbContext<ApplicationDbContext>((sp, options) =>
        {
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName))
                .AddInterceptors(sp.GetRequiredService<AuditSaveChangesInterceptor>());
            options.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
        });

        services
            .AddIdentity<ApplicationUser, ApplicationRole>(options =>
            {
                options.SignIn.RequireConfirmedAccount = false;
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = false;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequiredLength = 6;
            })
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultUI();

        services.AddSingleton<IConfigureOptions<IdentityOptions>, DevelopmentIdentityOptionsConfiguration>();

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<INotificationRealtimePublisher, NotificationRealtimePublisher>();
        services.AddScoped<INotificationService, NotificationService>();
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IRefreshTokenService, RefreshTokenService>();
        services.AddScoped<ITokenService, JwtTokenService>();
        services.AddScoped<ICurrentUser, CurrentUser>();
        services.AddScoped<ICurrentLanguage, CurrentLanguage>();
        services.AddScoped<IApplicationDbContext>(sp => sp.GetRequiredService<ApplicationDbContext>());
        services.AddScoped<ITemporaryPasswordService, TemporaryPasswordService>();
        services.AddScoped<IFileService, FileService>();
        services.AddScoped<IFileValidationService, FileValidationService>();
        services.AddScoped<IFileAccessAuthorizer, FileAccessAuthorizer>();
        services.AddScoped<DbInitializer>();

        return services;
    }
}

internal sealed class DevelopmentIdentityOptionsConfiguration(
    IHostEnvironment env,
    IConfiguration config) : IConfigureOptions<IdentityOptions>
{
    public void Configure(IdentityOptions options)
    {
        if (env.IsDevelopment() && config.GetValue<bool>("Identity:AllowNumericOnlyPasswordInDevelopment", false))
        {
            options.Password.RequireLowercase = false;
        }
    }
}
