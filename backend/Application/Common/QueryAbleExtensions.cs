using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace Application.Common;

public static class QueryAbleExtensions
{
    public static async Task<PaginationResult<T>> ToPaginationListAsync<T>(
        this IQueryable<T> source,
        int pageNumber,
        int pageSize,
        CancellationToken cancellationToken = default)
        where T : class
    {
        ArgumentNullException.ThrowIfNull(source);

        pageNumber = pageNumber <= 0 ? 1 : pageNumber;
        pageSize = pageSize <= 0 ? 10 : pageSize;

        int totalCount = await source
            .AsNoTracking()
            .CountAsync(cancellationToken);

        if (totalCount == 0)
        {
            return PaginationResult<T>.Success(
                new List<T>(),
                totalCount,
                pageNumber,
                pageSize);
        }

        // Avoid integer overflow in Skip calculation: (long)(pageNumber - 1) * pageSize
        // If the requested page is beyond total records, safely return an empty page with accurate metadata
        long skipCount = (long)(pageNumber - 1) * pageSize;
        if (skipCount >= totalCount || skipCount > int.MaxValue)
        {
            return PaginationResult<T>.Success(
                new List<T>(),
                totalCount,
                pageNumber,
                pageSize);
        }

        var items = await source
            .AsNoTracking()
            .Skip((int)skipCount)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return PaginationResult<T>.Success(
            items,
            totalCount,
            pageNumber,
            pageSize);
    }
}
