/**
 * "Today" (`YYYY-MM-DD`) from GET /health.
 * Pages render only after app.vue has loaded it, so it is always set here.
 */
export function useToday() {
  const app = useAppStore()
  return computed<string>(() => {
    if (!app.today) {
      throw new Error('useToday() was called before GET /health finished loading.')
    }
    return app.today
  })
}
