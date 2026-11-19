using System.IdentityModel.Tokens.Jwt;
using System.Text;
using API.ErrorHandling;
using Application;
using Application.Configuration;
using Infrastructure;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

namespace API.Extensions;

public static class ServiceCollectionExtensions
{
    public static IServiceCollection AddApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddApplication();
        services.AddInfrastructure(configuration);

        services.AddExceptionHandlingServices();
        services.AddCustomControllers();
        services.AddSwaggerDocumentation();
        services.AddJwtAuthentication();
        services.AddCustomAuthorization();
        services.AddCustomCors(configuration);
        services.AddSignalR();
        services.AddSingleton<Microsoft.AspNetCore.SignalR.IUserIdProvider, Infrastructure.Authentication.CustomUserIdProvider>();

        return services;
    }

    private static IServiceCollection AddExceptionHandlingServices(this IServiceCollection services)
    {
        services.AddProblemDetails();
        services.AddExceptionHandler<GlobalExceptionHandler>();
        return services;
    }

    private static IServiceCollection AddCustomControllers(this IServiceCollection services)
    {
        services.AddScoped<API.Filters.FluentValidationFilter>();
        services.AddControllers(options =>
            {
                options.Filters.Add<API.Filters.FluentValidationFilter>();
            })
            .ConfigureApiBehaviorOptions(options =>
            {
                options.InvalidModelStateResponseFactory = context =>
                {
                    var errors = context.ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => string.IsNullOrWhiteSpace(e.ErrorMessage)
                            ? e.Exception?.Message ?? "Invalid value"
                            : e.ErrorMessage)
                        .ToList();

                    return new BadRequestObjectResult(
                        GenericBaseResponse<object?>.Fail(
                            "Please review the provided information and correct the validation errors before continuing.",
                            HttpStatusCode.BadRequest,
                            errors));
                };
            });

        return services;
    }

    private static IServiceCollection AddSwaggerDocumentation(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Nasaq API",
                Version = "v1",
                Description = "Nasaq Employee Attendance Management API"
            });

            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Enter 'Bearer' [space] and then your valid token.\r\n\r\nExample: \"Bearer eyJhbGci...\""
            });

            options.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
            {
                [new OpenApiSecuritySchemeReference("Bearer")] = []
            });
        });

        return services;
    }

    private static IServiceCollection AddJwtAuthentication(this IServiceCollection services)
    {
        services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer();

        services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
            .Configure<IOptions<JwtSettings>>((bearer, jwtAccessor) =>
            {
                var jwt = jwtAccessor.Value;
                if (string.IsNullOrWhiteSpace(jwt.Secret) || jwt.Secret.Length < 32)
                    throw new InvalidOperationException("Jwt:Secret must be configured with at least 32 characters.");

                bearer.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = jwt.ValidateIssuer,
                    ValidateAudience = jwt.ValidateAudience,
                    ValidateLifetime = jwt.ValidateLifeTime,
                    ValidateIssuerSigningKey = jwt.ValidateIssuerSigningKey,
                    ValidIssuer = jwt.Issuer,
                    ValidAudience = jwt.Audience,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Secret)),
                    ClockSkew = TimeSpan.FromMinutes(1),
                    RoleClaimType = ClaimTypes.Role,
                    NameClaimType = ClaimTypes.Name
                };
                bearer.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var path = context.Request.Path;
                        if (path.StartsWithSegments("/api/v1/hubs/notifications"))
                        {
                            var accessToken = context.Request.Query["access_token"].FirstOrDefault();
                            if (!string.IsNullOrEmpty(accessToken))
                            {
                                context.Token = accessToken;
                            }
                        }
                        return Task.CompletedTask;
                    },
                    OnTokenValidated = async context =>
                    {
                        var userId = context.Principal?.FindFirstValue(ClaimTypes.NameIdentifier)
                            ?? context.Principal?.FindFirstValue(JwtRegisteredClaimNames.Sub)
                            ?? context.Principal?.FindFirstValue("sub");

                        if (string.IsNullOrWhiteSpace(userId))
                        {
                            context.Fail("User identifier claim is missing.");
                            return;
                        }

                        var db = context.HttpContext.RequestServices.GetService<ApplicationDbContext>();
                        if (db is null)
                        {
                            context.Fail("Database service unavailable for account validation.");
                            return;
                        }

                        try
                        {
                            var account = await db.Users
                                .AsNoTracking()
                                .Where(u => u.Id == userId)
                                .Select(u => new
                                {
                                    u.IsActive,
                                    u.SecurityStamp,
                                    u.MustChangePasswordOnNextLogin
                                })
                                .FirstOrDefaultAsync(context.HttpContext.RequestAborted);

                            if (account is null)
                            {
                                context.Fail("User account no longer exists.");
                                return;
                            }

                            if (!account.IsActive)
                            {
                                context.Fail("User account has been deactivated.");
                                return;
                            }

                            if (account.MustChangePasswordOnNextLogin)
                            {
                                context.Fail("Password change is required before accessing the system.");
                                return;
                            }

                            var tokenSecurityStamp = context.Principal?.FindFirstValue("AspNet.Identity.SecurityStamp")
                                ?? context.Principal?.FindFirstValue("security_stamp");

                            if (string.IsNullOrWhiteSpace(tokenSecurityStamp) ||
                                string.IsNullOrWhiteSpace(account.SecurityStamp) ||
                                !string.Equals(account.SecurityStamp, tokenSecurityStamp, StringComparison.Ordinal))
                            {
                                context.Fail("User session is invalid or credentials have changed. Please log in again.");
                                return;
                            }
                        }
                        catch (Exception ex)
                        {
                            context.Fail($"Error verifying account status: {ex.Message}");
                        }
                    },
                    OnChallenge = async context =>
                    {
                        if (context.Response.HasStarted)
                            return;

                        context.HandleResponse();
                        context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                        context.Response.ContentType = "application/json";

                        var message = context.AuthenticateFailure is { } failure &&
                                      !string.IsNullOrWhiteSpace(failure.Message) &&
                                      (failure.Message.Contains("deactivated", StringComparison.OrdinalIgnoreCase) ||
                                       failure.Message.Contains("not found", StringComparison.OrdinalIgnoreCase) ||
                                       failure.Message.Contains("no longer exists", StringComparison.OrdinalIgnoreCase) ||
                                       failure.Message.Contains("password change is required", StringComparison.OrdinalIgnoreCase) ||
                                       failure.Message.Contains("session is invalid", StringComparison.OrdinalIgnoreCase))
                            ? failure.Message
                            : "Authentication is required to access this resource. Please log in.";

                        var body = GenericBaseResponse<object?>.Fail(
                            message,
                            HttpStatusCode.Unauthorized);
                        await context.Response.WriteAsJsonAsync(body);
                    },
                    OnForbidden = async context =>
                    {
                        if (context.Response.HasStarted)
                            return;

                        context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
                        context.Response.ContentType = "application/json";
                        var body = GenericBaseResponse<object?>.Fail(
                            "You do not have permission to perform this action.",
                            HttpStatusCode.Forbidden);
                        await context.Response.WriteAsJsonAsync(body);
                    }
                };
            });

        return services;
    }

    private static IServiceCollection AddCustomAuthorization(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            options.FallbackPolicy = new AuthorizationPolicyBuilder()
                .RequireAuthenticatedUser()
                .Build();

            options.AddPolicy(PolicyNames.RequireSuperAdmin, policy =>
                policy.RequireRole(RoleNames.SuperAdmin));

            options.AddPolicy(PolicyNames.RequireAdmin, policy =>
                policy.RequireRole(RoleNames.SuperAdmin, RoleNames.Admin));

            options.AddPolicy(PolicyNames.RequireSupervisor, policy =>
                policy.RequireRole(RoleNames.SuperAdmin, RoleNames.Admin, RoleNames.Supervisor));

            options.AddPolicy(PolicyNames.RequireEmployee, policy =>
                policy.RequireRole(RoleNames.Employee));

            options.AddPolicy(PolicyNames.EmployeeManagement, policy =>
                policy.RequireRole(RoleNames.SuperAdmin, RoleNames.Admin));

            options.AddPolicy(PolicyNames.EmployeeView, policy =>
                policy.RequireRole(RoleNames.SuperAdmin, RoleNames.Admin, RoleNames.Supervisor, RoleNames.Employee));
        });

        return services;
    }

    private static IServiceCollection AddCustomCors(this IServiceCollection services, IConfiguration configuration)
    {
        var configuredOrigins = configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
            ?? Array.Empty<string>();

        var allowedOrigins = configuredOrigins
            .Where(origin => !string.IsNullOrWhiteSpace(origin))
            .Select(origin => origin.Trim().TrimEnd('/'))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToArray();

        services.AddCors(options =>
        {
            options.AddDefaultPolicy(policy =>
            {
                if (allowedOrigins.Length > 0)
                {
                    policy.WithOrigins(allowedOrigins)
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                }
                else
                {
                    policy.DisallowCredentials();
                }
            });
        });

        return services;
    }
}
