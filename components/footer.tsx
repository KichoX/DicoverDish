import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 text-center">
        <p className="text-sm text-muted-foreground">
          © 2026 All rights reserved. Powered by{' '}
          <Link href="/" className="text-primary hover:underline font-medium">
            DiscoverDish
          </Link>
        </p>
      </div>
    </footer>
  )
}
