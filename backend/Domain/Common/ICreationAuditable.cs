using System;

namespace Domain.Common;

public interface ICreationAuditable
{
    DateTime Created_Utc { get; set; }
    string? Created_By { get; set; }
}
