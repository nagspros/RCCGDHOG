import type { ArchiveBlock } from '../data/churchData';

export function ArchiveContent({ blocks }: { blocks: ArchiveBlock[] }) {
  const sections: { kind: string; lines: string[] }[] = [];
  for (const block of blocks) {
    const previous = sections.at(-1);
    if (block.kind === 'list-item' && previous?.kind === 'list-item') {
      previous.lines.push(block.text);
    } else {
      sections.push({ kind: block.kind, lines: [block.text] });
    }
  }
  return (
    <div className="space-y-4 text-base leading-relaxed text-stone-800">
      {sections.map(({ kind, lines }, index) => {
        if (kind === 'heading') return <h3 key={index} className="font-serif-heading text-xl text-[#08281d]">{lines[0]}</h3>;
        if (kind === 'list-item') return (
          <ul key={index} className="list-disc space-y-2 pl-6">
            {lines.map((line, lineIndex) => <li key={lineIndex}>{line}</li>)}
          </ul>
        );
        return <p key={index}>{lines[0]}</p>;
      })}
    </div>
  );
}

export function ArchivePagination({ page, totalPages, onPage, label = 'Archive pages' }: {
  page: number;
  totalPages: number;
  onPage: (page: number) => void;
  label?: string;
}) {
  if (totalPages <= 1) return null;
  const button = 'min-h-11 rounded-lg border border-stone-300 px-3 py-2 text-sm font-semibold disabled:opacity-40';
  return (
    <nav aria-label={label} className="flex flex-wrap items-center justify-center gap-2">
      <button type="button" className={button} disabled={page === 1} onClick={() => onPage(page - 1)}>Previous</button>
      {Array.from({ length: totalPages }, (_, index) => (
        <button type="button" key={index} className={`${button} ${page === index + 1 ? 'bg-[#08281d] text-[#fae19c]' : 'bg-white'}`}
          aria-label={`Page ${index + 1}`} aria-current={page === index + 1 ? 'page' : undefined}
          onClick={() => onPage(index + 1)}>{index + 1}</button>
      ))}
      <button type="button" className={button} disabled={page === totalPages} onClick={() => onPage(page + 1)}>Next</button>
    </nav>
  );
}
