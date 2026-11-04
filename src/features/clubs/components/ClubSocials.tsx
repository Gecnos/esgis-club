const networks: { label: string; handle: (s: string, n: string) => string; url: (s: string, n: string) => string }[] = [
  {
    label: 'Instagram',
    handle: (slug) => `@${slug}.esgis`,
    url: (slug) => `https://instagram.com/${slug}.esgis`,
  },
  {
    label: 'Facebook',
    handle: (_slug, name) => `Club ${name} ESGIS`,
    url: (_slug, name) => `https://facebook.com/club${name.toLowerCase().replace(/\s+/g, '')}esgis`,
  },
  {
    label: 'TikTok',
    handle: (slug) => `@${slug}.esgis`,
    url: (slug) => `https://tiktok.com/@${slug}.esgis`,
  },
  {
    label: 'LinkedIn',
    handle: (_slug, name) => `ESGIS ${name}`,
    url: (_slug, name) => `https://linkedin.com/company/esgis-club-${name.toLowerCase()}`,
  },
]

export default function ClubSocials({ slug, name }: { slug: string; name: string }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="m-0 text-xl/7 font-semibold">Suivre le Club {name}</h2>
      <div className="flex flex-wrap gap-2">
        {networks.map(({ label, handle, url }) => (
          <a
            key={label}
            href={url(slug, name)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Club ${name} ESGIS sur ${label}`}
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
