interface CategoryHeaderProps {
  category: string;
  count: number;
}

export default function CategoryHeader({ category, count }: CategoryHeaderProps) {
  return (
    <tr className="bg-slate-50/50 dark:bg-slate-800/60">
      <td className="px-4 py-2" colSpan={6}>
        <button className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200 w-full text-left py-1 hover:text-primary dark:hover:text-primary transition-colors">
          <span className="material-symbols-outlined text-lg transform rotate-90 transition-transform text-slate-400 dark:text-slate-500">
            chevron_right
          </span>
          {category}{' '}
          <span className="text-slate-400 font-normal ml-1 text-xs">({count})</span>
        </button>
      </td>
    </tr>
  );
}
