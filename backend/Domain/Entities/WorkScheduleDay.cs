namespace Domain.Entities;

public class WorkScheduleDay
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid WorkScheduleId { get; set; }
    public virtual WorkSchedule? Schedule { get; set; }

    public DayOfWeek DayOfWeek { get; set; }

    public bool IsWorkingDay { get; set; } = true;

    public Guid? WorkShiftId { get; set; }
    public virtual WorkShift? Shift { get; set; }
}
