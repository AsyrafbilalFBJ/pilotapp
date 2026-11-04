<script setup lang="ts">
import {
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
  type ChartData,
  type ChartOptions,
  type ScriptableLineSegmentContext,
} from 'chart.js'
import annotationPlugin from 'chartjs-plugin-annotation'
import { Line } from 'vue-chartjs'
import type { FlightHoursChart } from '~/types/api'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, annotationPlugin)

const props = defineProps<{ chart: FlightHoursChart }>()

const COLORS = {
  line: '#22C5E8',
  limit: '#E63757',
  navy: '#0E2138',
  muted: '#6B7280',
  grid: '#EDF0F3',
} as const

const FONT = "'Plus Jakarta Sans', system-ui, sans-serif"

const reducedMotion = import.meta.client && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const todayIndex = computed(() => props.chart.series.findIndex((point) => point.isToday))
const todayPoint = computed(() => props.chart.series[todayIndex.value])

const data = computed<ChartData<'line'>>(() => {
  const { series } = props.chart
  return {
    labels: series.map((point) => point.formattedDate),
    datasets: [
      {
        label: 'Rolling sum',
        data: series.map((point) => point.rollingSum),
        borderColor: COLORS.line,
        borderWidth: 2.5,
        tension: 0.25,
        // Planned (future) days are drawn dashed.
        segment: {
          borderDash: (ctx: ScriptableLineSegmentContext) =>
            series[ctx.p1DataIndex]?.isFuture ? [5, 4] : undefined,
        },
        pointRadius: series.map((point) => (point.isToday ? 6 : 3)),
        pointHoverRadius: 7,
        pointBorderWidth: series.map((point) => (point.isToday ? 3 : 0)),
        pointBorderColor: '#fff',
        pointBackgroundColor: series.map((point) =>
          point.isExceeded ? COLORS.limit : point.isToday ? COLORS.navy : COLORS.line,
        ),
        // Lets a point above yAxisMax still be drawn instead of being cut off.
        clip: 8,
      },
    ],
  }
})

const options = computed<ChartOptions<'line'>>(() => {
  const { series, limitLine, yAxisMax } = props.chart
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: reducedMotion ? false : { duration: 300 },
    layout: { padding: { top: 12, right: 4 } },
    interaction: { mode: 'index', intersect: false },
    scales: {
      y: {
        min: 0,
        max: yAxisMax,
        border: { display: false },
        grid: { color: COLORS.grid },
        ticks: { color: COLORS.muted, font: { family: FONT, size: 11 }, maxTicksLimit: 6 },
      },
      x: {
        border: { display: false },
        grid: { display: false },
        ticks: {
          color: (ctx) => (ctx.index === todayIndex.value ? COLORS.navy : COLORS.muted),
          font: (ctx) => ({ family: FONT, size: 11, weight: ctx.index === todayIndex.value ? 700 : 500 }),
          maxRotation: 0,
          autoSkip: true,
          autoSkipPadding: 8,
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: COLORS.navy,
        titleFont: { family: FONT, weight: 700 },
        bodyFont: { family: FONT },
        displayColors: false,
        callbacks: {
          label: (ctx) => {
            const point = series[ctx.dataIndex]
            if (!point) return ''
            const lines = [`Rolling sum: ${point.rollingSum} h`, `That day: ${point.dailyHours} h`]
            if (point.isFuture) lines.push('Planned')
            if (point.isExceeded) lines.push('Above limit')
            return lines
          },
        },
      },
      annotation: {
        annotations: {
          limit: {
            type: 'line',
            yMin: limitLine,
            yMax: limitLine,
            borderColor: COLORS.limit,
            borderWidth: 1.5,
            label: {
              display: true,
              content: `Limit ${limitLine} h`,
              position: 'start',
              backgroundColor: 'transparent',
              color: COLORS.limit,
              font: { family: FONT, size: 11, weight: 700 },
              padding: 2,
              yAdjust: -10,
            },
          },
          today: {
            type: 'line',
            xMin: todayIndex.value,
            xMax: todayIndex.value,
            borderColor: 'rgba(14, 33, 56, 0.25)',
            borderWidth: 1,
            borderDash: [3, 3],
          },
        },
      },
    },
  }
})

const description = computed(() => {
  const today = todayPoint.value
  const { windowDays, limitLine } = props.chart
  if (!today) return ''
  return `Rolling ${windowDays}-day sum of flight hours. Today, ${today.formattedDate}: ${today.rollingSum} of ${limitLine} hours.`
})
</script>

<template>
  <figure class="trend-chart">
    <div class="trend-chart__canvas">
      <Line :data="data" :options="options" role="img" :aria-label="description" />
    </div>
    <figcaption class="trend-chart__legend">
      <span class="key key--line">Rolling sum</span>
      <span class="key key--planned">Planned</span>
      <span class="key key--limit">Limit</span>
    </figcaption>
  </figure>
</template>

<style scoped lang="scss">
.trend-chart {
  margin: 0;
}

.trend-chart__canvas {
  position: relative;
  height: 220px;
}

.trend-chart__legend {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-4);
  margin-top: var(--space-3);
  color: var(--color-text-muted);
  font-size: 12px;
}

.key {
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '';
    width: 16px;
    height: 0;
    border-top: 2.5px solid var(--color-chart);
  }

  &--planned::before {
    border-top-style: dashed;
  }

  &--limit::before {
    border-top: 1.5px solid var(--color-danger);
  }
}
</style>
