import Link from 'next/link'
import { Trophy, Star, Zap, ArrowRight } from 'lucide-react'

export function FeaturesSection() {
  const features = [
    {
      icon: Trophy,
      title: 'Championship recipes',
      description: 'We have created a list of tried and true recipes from coffee brewing Champions.',
      linkText: 'See recipes',
      href: '/?sort=popular#recipes'
    },
    {
      icon: Star,
      title: 'Explore the latest',
      description: 'Stay up to date and check out our recently added recipes. You will not regret.',
      linkText: 'See recipes',
      href: '/?sort=latest#recipes'
    },
    {
      icon: Zap,
      title: 'Fast and furious',
      description: "Don't like standing at the table for a long time? Here you will find short but still good recipes.",
      linkText: 'See recipes',
      href: '/?time=30#recipes'
    }
  ]

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-start space-y-4 p-6 rounded-2xl transition-colors hover:bg-muted/50">
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
              <Link
                href={feature.href}
                className="inline-flex items-center text-sm font-medium hover:text-primary transition-colors border-b border-foreground/20 hover:border-primary pb-0.5"
              >
                {feature.linkText}
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
