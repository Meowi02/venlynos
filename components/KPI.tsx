// components/KPI.tsx
export function KPI({label, value, delta}:{label:string; value:string; delta?:string}) {
  const isPositive = delta?.startsWith('+');
  const isNegative = delta?.startsWith('-');
  
  return (
    <section className="kpi">
      <div className="text-sm muted">{label}</div>
      <div className="mt-2 flex items-baseline gap-3">
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        {!!delta && (
          <span className={`rounded-full px-2 py-0.5 text-xs ${
            isPositive 
              ? 'bg-green-50 text-green-700 border border-green-200'
              : isNegative
                ? 'bg-red-50 text-red-700 border border-red-200'  
                : 'bg-gray-50 text-gray-700 border border-gray-200'
          }`}>
            {delta}
          </span>
        )}
      </div>
    </section>
  );
}