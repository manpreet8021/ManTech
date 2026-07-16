import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

function TrendTooltip({ active, payload, label, color, unit }) {
  if (!active || !payload?.length) return null

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-md">
      <p className="mb-1 text-xs text-[#52514e]">{label}</p>
      <div className="flex items-center gap-1.5">
        <span className="inline-block h-0.5 w-3" style={{ backgroundColor: color }} />
        <span className="text-sm font-semibold text-[#0b0b0b]">
          {payload[0].value}
          {unit ? ` ${unit}` : ''}
        </span>
      </div>
    </div>
  )
}

export default function AreaTrendChart({ data, dataKey, xKey, color, unit }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#e1e0d9" strokeWidth={1} />
        <XAxis
          dataKey={xKey}
          tick={{ fill: '#898781', fontSize: 12 }}
          axisLine={{ stroke: '#c3c2b7' }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#898781', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip content={<TrendTooltip color={color} unit={unit} />} />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={color}
          fillOpacity={0.1}
          dot={false}
          activeDot={{ r: 5, stroke: '#fcfcfb', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
