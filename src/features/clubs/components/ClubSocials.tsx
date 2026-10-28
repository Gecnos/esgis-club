const networks: [label: string, handle: (slug: string, name: string) => string, href: string][] = [
  ['Instagram', (slug) => `@${slug}.esgis`, 'https://instagram.com/'],
  ['Facebook', (_slug, name) => `Club ${name} ESGIS`, 'https://facebook.com/'],
  ['TikTok', (slug) => `@${slug}.esgis`, 'https://tiktok.com/'],
  ['LinkedIn', (_slug, name) => `ESGIS ${name}`, 'https://linkedin.com/'],
]

export default function ClubSocials({ slug, name }: { slug: string; name: string }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="m-0 text-xl/7 font-semibold">Suivre le club</h2>
      <div className="flex flex-wrap gap-2">
        {networks.map(([label, handle, href]) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener"
            className="flex h-11 items-center gap-2 rounded-full border-[1.5px] border-[#c9d1dd] px-4 text-sm text-navy no-underline hover:border-navy"
          >
            <strong className="font-semibold">{label}</strong>
            <span className="text-muted">{handle(slug, name)}</span>
          </a>
        ))}
      </div>
    </section>
  )
}
