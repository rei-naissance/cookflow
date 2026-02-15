'use client'

export function NewsletterSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container px-4 md:px-6">
        <div className="bg-card rounded-3xl p-8 md:p-12 lg:p-16 text-center border shadow-sm relative overflow-hidden">
          {/* Decorative shapes */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-accent/5 rounded-full translate-x-1/3 translate-y-1/3" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-8">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Fresh inspiration via email
            </h2>
            <p className="text-muted-foreground text-lg">
              Get our best recipes and cooking tips delivered strictly to your inbox.
            </p>

            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 min-w-0 rounded-full border border-input bg-background px-4 py-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                required
              />
              <button
                type="submit"
                className="bg-foreground text-background hover:bg-foreground/90 inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                Subscribe from
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
