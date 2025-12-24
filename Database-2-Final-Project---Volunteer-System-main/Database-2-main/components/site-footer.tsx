import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';

const footerLinks = [
  {
    title: 'Program',
    links: [
      { name: 'About Aspire', href: '/#about' },
      { name: 'Community Caseworker Program', href: 'https://muslimfoodbank.com/aspire-community/' },
      { name: 'Caseworker Training', href: 'https://muslimfoodbank.com/aspire-caseworkertraining/' },
    ],
  },
  {
    title: 'Platform',
    links: [
      { name: 'Volunteer Login', href: '/login' },
      { name: 'Admin Login', href: '/login?role=admin' },
      { name: 'Support', href: '/#contact' },
    ],
  },
  {
    title: 'Organization',
    links: [
      { name: 'Muslim Food Bank & Community Services', href: 'https://muslimfoodbank.com/' },
      { name: 'Calgary Location', href: 'https://muslimfoodbank.com/location/muslim-food-bank-calgary/' },
    ],
  },
];

const socialLinks = [
  { name: 'Facebook', icon: Facebook, href: '#' },
  { name: 'Instagram', icon: Instagram, href: '#' },
  { name: 'Twitter', icon: Twitter, href: '#' },
  { name: 'LinkedIn', icon: Linkedin, href: '#' },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-background/50">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="font-heading text-xl font-bold text-text_primary">
                Aspire<span className="text-primary">Volunteer</span>
              </span>
            </div>
            <p className="text-sm text-text_muted">
              Supporting newcomers and refugees in Calgary through the Aspire Community Caseworker Program.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-text_muted transition-colors hover:text-text_primary"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-text_primary">{section.title}</h3>
              <ul className="mt-4 space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-text_muted transition-colors hover:text-text_primary"
                      target={link.href.startsWith('http') ? '_blank' : undefined}
                      rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 border-t pt-8">
          <p className="text-center text-sm text-text_muted">
            © {new Date().getFullYear()} Aspire Community Caseworker Program – Helping newcomers and refugees build self-reliance in Calgary.
          </p>
        </div>
      </div>
    </footer>
  );
}
