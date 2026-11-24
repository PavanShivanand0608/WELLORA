export interface DashboardSampleData {
  displayName: string
  weeklyTrend: Array<{ day: string; calories: number; goal: number }>
  observations: Array<{ title: string; description: string }>
  hydrationReminder: string
}

/** Static demonstration values for the dashboard; replace with an API query in a later phase. */
export const dashboardSampleData: DashboardSampleData = {
  displayName: 'Alex Morgan',
  weeklyTrend: [
    { day: 'Wed', calories: 1640, goal: 2000 },
    { day: 'Thu', calories: 2030, goal: 2000 },
    { day: 'Fri', calories: 1780, goal: 2000 },
    { day: 'Sat', calories: 1920, goal: 2000 },
    { day: 'Sun', calories: 1720, goal: 2000 },
    { day: 'Mon', calories: 1880, goal: 2000 },
    { day: 'Tue', calories: 1480, goal: 2000 },
  ],
  observations: [
    {
      title: 'A steady rhythm',
      description: 'This sample day includes regular meals with a snack between lunch and dinner.',
    },
    {
      title: 'Make room for balance',
      description: 'Pairing grains with a protein source and colourful produce can add variety.',
    },
  ],
  hydrationReminder: 'Keep water nearby and take a sip with your next break.',
}
