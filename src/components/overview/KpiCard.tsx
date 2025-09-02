import { cn } from "@/lib/cn";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    label: string;
    isPositive?: boolean;
  };
  className?: string;
  onClick?: () => void;
}

export function KpiCard({ title, value, subtitle, trend, className, onClick }: KpiCardProps) {
  const isClickable = !!onClick;

  return (
    <div 
      className={cn(
        "bg-white p-6 rounded-lg border shadow-sm",
        isClickable && "cursor-pointer hover:shadow-md hover:border-blue-200 transition-all",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <div className="mt-2">
            <p className="text-3xl font-bold text-slate-900">{value}</p>
            {subtitle && (
              <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        
        {trend && (
          <div className="ml-4 flex flex-col items-end">
            <div className={cn(
              "flex items-center space-x-1 text-sm font-medium",
              trend.isPositive ? "text-green-600" : "text-red-600"
            )}>
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{trend.label}</p>
          </div>
        )}
      </div>
    </div>
  );
}