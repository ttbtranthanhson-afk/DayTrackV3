import type { ComponentType, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface DesktopPageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function DesktopPageHeader({ title, subtitle, actions }: DesktopPageHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400 mt-1 font-medium">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
    </div>
  );
}

interface DesktopCardProps {
  title?: string;
  icon?: ComponentType<{ className?: string }>;
  accent?: string;
  action?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

export function DesktopCard({
  title,
  icon: Icon,
  accent = 'text-gray-500',
  action,
  className = '',
  bodyClassName = '',
  children,
}: DesktopCardProps) {
  return (
    <div className={`bg-white rounded-3xl border border-gray-100 shadow-sm ${className}`}>
      {title && (
        <div className="flex items-center gap-2.5 px-5 pt-4 pb-3 border-b border-gray-50">
          {Icon && <Icon className={`w-4 h-4 ${accent}`} />}
          <span className="text-sm font-bold text-gray-800 flex-1">{title}</span>
          {action}
        </div>
      )}
      <div className={bodyClassName || 'p-5'}>{children}</div>
    </div>
  );
}

export function DesktopEmpty({ label }: { label: string }) {
  return (
    <div className="text-center py-14">
      <p className="text-gray-300 font-semibold text-sm">{label}</p>
    </div>
  );
}

interface DesktopAnimatedSwitchProps {
  id: string;
  children: ReactNode;
  className?: string;
  direction?: number;
}

export function DesktopAnimatedSwitch({ id, children, className = '', direction = 1 }: DesktopAnimatedSwitchProps) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={id}
        initial={{ opacity: 0, x: direction * 24, scale: 0.985 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        exit={{ opacity: 0, x: direction * -24, scale: 0.985 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
