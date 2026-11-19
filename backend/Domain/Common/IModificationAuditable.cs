using System;

namespace Domain.Common;

public interface IModificationAuditable
{
    DateTime? Updated_Utc { get; set; }
    string? Updated_By { get; set; }
}
