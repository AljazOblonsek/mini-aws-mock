type GetCreateScheduleResponseOptions = {
  scheduleArn: string;
};

export const getCreateScheduleJsonResponse = ({
  scheduleArn,
}: GetCreateScheduleResponseOptions): object => ({
  ScheduleArn: scheduleArn,
});
