import Link from "next/link";
import { Award, CheckCircle2, Clock3, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background_light to-background py-16 md:py-24">
        <div className="container grid gap-12 md:grid-cols-2 md:items-center">
          <div className="space-y-6">
            <Badge variant="outline" className="border-primary/30 bg-primary/5 text-primary">
              Aspire Community Caseworker Program
            </Badge>
            <h1 className="font-heading text-4xl font-semibold tracking-tight text-text_primary sm:text-5xl md:text-6xl">
              Rewarding the volunteers who guide newcomers home.
            </h1>
            <p className="max-w-xl text-lg text-text_muted">
              A simple web platform to track cases, recognize milestones, and celebrate the volunteers supporting
              newcomers and refugees in Calgary.
            </p>
            <ul className="space-y-2 text-sm text-text_muted">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <span>Track assigned, open, and closed cases in one place.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <span>Automatically issue milestone badges at 10, 20, and 30 closed cases.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <span>Celebrate impact with certificates and appreciation rewards.</span>
              </li>
            </ul>
            <div className="flex flex-wrap gap-4 pt-2">
              <Button
                size="lg"
                asChild
                className="bg-white text-primary shadow-sm transition-colors hover:bg-background_light hover:text-primary"
              >
                <Link href="/login">Open Volunteer Portal</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-white bg-white/90 text-primary shadow-sm transition-colors hover:border-primary hover:bg-white"
              >
                <Link href="/admin-demo">Admin Dashboard Demo</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-accent_soft_teal/30 blur-3xl" />
            <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-accent_gold/30 blur-3xl" />
            <div className="relative rounded-3xl border bg-white/80 p-6 shadow-xl backdrop-blur">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm font-medium text-text_muted">Today&rsquo;s Snapshot</span>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  Admin view
                </Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-1 rounded-2xl bg-background_light p-3">
                  <div className="flex items-center justify-between text-xs text-text_muted">
                    <span>Open Cases</span>
                    <Clock3 className="h-4 w-4 text-status_open" />
                  </div>
                  <p className="text-2xl font-semibold text-text_primary">48</p>
                </div>
                <div className="space-y-1 rounded-2xl bg-background_light p-3">
                  <div className="flex items-center justify-between text-xs text-text_muted">
                    <span>Closed Cases</span>
                    <CheckCircle2 className="h-4 w-4 text-status_closed" />
                  </div>
                  <p className="text-2xl font-semibold text-text_primary">132</p>
                </div>
                <div className="space-y-1 rounded-2xl bg-background_light p-3">
                  <div className="flex items-center justify-between text-xs text-text_muted">
                    <span>Badges Awarded</span>
                    <Award className="h-4 w-4 text-accent_gold" />
                  </div>
                  <p className="text-2xl font-semibold text-text_primary">39</p>
                </div>
              </div>
              <div className="mt-4 rounded-2xl border bg-background_light p-3">
                <div className="flex items-center justify-between text-xs text-text_muted">
                  <span>Top volunteer this month</span>
                  <span>Beacon of Hope</span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text_primary">Sarah Ahmed</p>
                    <p className="text-xs text-text_muted">18 closed cases</p>
                  </div>
                  <div className="rounded-full bg-badge_beacon/10 px-3 py-1 text-xs font-semibold text-badge_beacon">
                    Beacon of Hope
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="bg-background_light py-16 md:py-20">
        <div className="container grid gap-10 md:grid-cols-2 md:items-center">
          <div className="space-y-4">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-text_primary md:text-4xl">
              Built for the Aspire Community Caseworker Program
            </h2>
            <p className="text-lg text-text_muted">
              The Aspire Community Caseworker Program supports newcomers and refugees as they navigate housing,
              employment, education, and community life in Calgary. Volunteers act as companions, guides, and
              advocates. This platform turns their invisible work into visible impact with clear tracking and
              meaningful recognition.
            </p>
            <ul className="space-y-2 text-sm text-text_muted">
              <li>Centralized view of all volunteer casework.</li>
              <li>Aligned with values of respect, dignity, and self-reliance.</li>
              <li>Designed to complement Aspire training and case management practices.</li>
            </ul>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-accent_soft_teal/20 blur-2xl" />
            <div className="relative flex h-full min-h-[260px] items-center justify-center rounded-3xl bg-gradient-to-br from-primary_dark via-primary to-accent_gold p-6 text-left text-white">
              <div className="space-y-3 max-w-xs">
                <p className="text-sm font-medium uppercase tracking-wide text-white/80">
                  Community in focus
                </p>
                <p className="text-sm text-white/90">
                  Imagine a warm scene of a caseworker and newcomer family at a table, planning next steps with
                  Aspire-branded materials.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-background py-16 md:py-20">
        <div className="container space-y-10">
          <div className="max-w-3xl space-y-3">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-text_primary md:text-4xl">
              How the platform works
            </h2>
            <p className="text-lg text-text_muted">
              From training to badges in a few simple steps.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-5">
            {[
              {
                icon: <CheckCircle2 className="h-6 w-6" />,
                title: "1. Volunteers complete 3-day training",
                body: "Admin or senior caseworker marks training as complete.",
              },
              {
                icon: <Users className="h-6 w-6" />,
                title: "2. Senior caseworker assigns cases",
                body: "Each volunteer receives families or individuals to support.",
              },
              {
                icon: <Clock3 className="h-6 w-6" />,
                title: "3. Volunteers support and document",
                body: "Volunteers log meetings, notes, and recommend closure when goals are met.",
              },
              {
                icon: <CheckCircle2 className="h-6 w-6" />,
                title: "4. Senior caseworker closes the case",
                body: "Each closed case counts toward the volunteers badge milestones.",
              },
              {
                icon: <Award className="h-6 w-6" />,
                title: "5. Badges and rewards are issued",
                body: "Milestones at 10, 20, and 30 closed cases trigger badges and certificate-style emails.",
              },
            ].map((step, index) => (
              <Card key={index} className="h-full border-dashed border-primary/15 bg-background_light/60">
                <CardHeader className="flex flex-row items-center gap-3 pb-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {step.icon}
                  </div>
                  <CardTitle className="text-sm font-semibold leading-snug text-text_primary">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-text_muted">
                  {step.body}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Badges */}
      <section id="badges" className="bg-background_light py-16 md:py-20">
        <div className="container space-y-10">
          <div className="max-w-3xl space-y-3">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-text_primary md:text-4xl">
              Badges that tell a story of growth and impact
            </h2>
            <p className="text-lg text-text_muted">
              Each badge represents a deeper level of commitment to newcomers and refugees.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                name: "Cornerstone Companion",
                cases: 10,
                reward: "$25",
                color: "badge_cornerstone",
                description:
                  "Honors the volunteer&rsquo;s role in building the first foundation of trust and stability.",
              },
              {
                name: "Bridge Builder",
                cases: 20,
                reward: "$50",
                color: "badge_bridge",
                description:
                  "Recognizes volunteers who connect newcomers with services, communities, and opportunities.",
              },
              {
                name: "Beacon of Hope",
                cases: 30,
                reward: "$75",
                color: "badge_beacon",
                description:
                  "Celebrates exceptional volunteers whose consistent support becomes a symbol of hope.",
              },
            ].map((badge) => (
              <Card
                key={badge.name}
                className="relative overflow-hidden border-0 bg-white shadow-sm ring-1 ring-black/5"
              >
                <div
                  className={`h-1 w-full bg-gradient-to-r from-${badge.color} to-${badge.color}`}
                />
                <CardHeader className="space-y-1">
                  <p className="text-xs font-medium uppercase tracking-wide text-text_muted">
                    {badge.cases} closed cases • {badge.reward} reward
                  </p>
                  <CardTitle className="text-xl text-text_primary">
                    {badge.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-text_muted">
                  <p>{badge.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-text_primary">Track your progress</span>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href="/login">Log in</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section id="dashboard-preview" className="bg-background py-16 md:py-20">
        <div className="container space-y-8">
          <div className="max-w-3xl space-y-3">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-text_primary md:text-4xl">
              A clear view for admins and senior caseworkers
            </h2>
            <p className="text-lg text-text_muted">
              Monitor open, assigned, and closed cases and see which volunteers are unlocking badges.
            </p>
          </div>
          <Card className="overflow-hidden border-primary/10 bg-background_light">
            <CardHeader>
              <CardTitle className="text-base text-text_primary">Admin dashboard preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  { label: "Open Cases", value: "48" },
                  { label: "Closed Cases", value: "132" },
                  { label: "Active Volunteers", value: "27" },
                  { label: "Badges Awarded", value: "39" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-white px-4 py-3 shadow-sm"
                  >
                    <p className="text-xs text-text_muted">{item.label}</p>
                    <p className="text-xl font-semibold text-text_primary">{item.value}</p>
                  </div>
                ))}
              </div>
              <div className="overflow-x-auto rounded-2xl bg-white p-4 shadow-sm">
                <table className="min-w-full text-left text-xs text-text_muted">
                  <thead className="border-b text-[11px] uppercase">
                    <tr>
                      <th className="pb-2 pr-4 font-medium">Volunteer</th>
                      <th className="pb-2 pr-4 font-medium">Cases</th>
                      <th className="pb-2 pr-4 font-medium">Progress</th>
                      <th className="pb-2 font-medium">Badges</th>
                    </tr>
                  </thead>
                  <tbody className="align-middle text-[11px]">
                    <tr className="border-t">
                      <td className="py-2 pr-4 text-text_primary">Sarah Ahmed</td>
                      <td className="py-2 pr-4">20</td>
                      <td className="py-2 pr-4">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-background_light">
                          <div className="h-full w-3/4 rounded-full bg-primary" />
                        </div>
                      </td>
                      <td className="py-2">
                        <span className="rounded-full bg-badge_cornerstone/10 px-2 py-0.5 text-[10px] font-medium text-badge_cornerstone">
                          Cornerstone Companion
                        </span>
                      </td>
                    </tr>
                    <tr className="border-t">
                      <td className="py-2 pr-4 text-text_primary">Omar Hassan</td>
                      <td className="py-2 pr-4">32</td>
                      <td className="py-2 pr-4">
                        <div className="h-1.5 w-24 overflow-hidden rounded-full bg-background_light">
                          <div className="h-full w-full rounded-full bg-badge_beacon" />
                        </div>
                      </td>
                      <td className="py-2">
                        <span className="rounded-full bg-badge_beacon/10 px-2 py-0.5 text-[10px] font-medium text-badge_beacon">
                          Beacon of Hope
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Volunteer Experience */}
      <section id="volunteer-experience" className="bg-background_light py-16 md:py-20">
        <div className="container space-y-8">
          <div className="max-w-3xl space-y-3">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-text_primary md:text-4xl">
              Designed around the volunteer experience
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card className="bg-white/90">
              <CardHeader>
                <CardTitle className="text-base text-text_primary">
                  See all your cases in one place
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-text_muted">
                A simple case list shows which families you are supporting, their status, and any upcoming tasks
                or meetings.
              </CardContent>
            </Card>
            <Card className="bg-white/90">
              <CardHeader>
                <CardTitle className="text-base text-text_primary">
                  Track your impact over time
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-text_muted">
                A progress tracker shows how many cases you have closed and how close you are to your next badge.
              </CardContent>
            </Card>
            <Card className="bg-white/90">
              <CardHeader>
                <CardTitle className="text-base text-text_primary">
                  Celebrate with certificates you can keep
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-text_muted">
                Each badge comes with a personalized certificate-style email you can save, print, or share.
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-background py-16 md:py-20">
        <div className="container max-w-3xl space-y-8">
          <div className="space-y-3">
            <h2 className="font-heading text-3xl font-semibold tracking-tight text-text_primary md:text-4xl">
              Frequently asked questions
            </h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "Who is this platform for?",
                a: "It is for volunteers, senior caseworkers, and program administrators in the Aspire Community Caseworker Program supporting newcomers and refugees.",
              },
              {
                q: "How do badges get awarded?",
                a: "When a senior caseworker officially closes a case, that closure is counted towards the volunteers total. At 10, 20, and 30 closed cases, badges and certificate emails are automatically triggered.",
              },
              {
                q: "Do volunteers have to do anything special to claim rewards?",
                a: "No. Once the badge email is sent, the admin team uses the dashboard to track who has unlocked which badge and to process the $25, $50, or $75 appreciation rewards.",
              },
              {
                q: "Does this replace existing case management tools?",
                a: "This system is intended to complement existing tools by focusing on volunteer tracking, recognition, and high-level case status, not detailed clinical or legal records.",
              },
            ].map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-primary/10 bg-background_light px-4 py-3 text-sm text-text_muted"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-text_primary">
                  <span className="font-medium">{item.q}</span>
                  <span className="text-xs text-text_muted">
                    +
                  </span>
                </summary>
                <div className="pt-2 text-sm text-text_muted">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="bg-background_light py-12">
        <div className="container max-w-3xl space-y-4 text-center">
          <p className="text-sm text-text_muted">
            Need support with the platform? Use the Admin Dashboard or contact the Aspire coordination team through the
            Muslim Food Bank & Community Services Calgary office.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-primary_dark via-primary to-accent_soft_teal py-16 md:py-20">
        <div className="container">
          <div className="mx-auto max-w-3xl space-y-6 text-center text-white">
            <h2 className="font-heading text-3xl font-semibold tracking-tight md:text-4xl">
              Support the volunteers who support our city.
            </h2>
            <p className="text-lg text-white/90">
              Use this platform to make sure every hour of volunteer casework is seen, counted, and celebrated.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/login"
                className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm transition-colors hover:bg-background_light"
              >
                Open Volunteer Portal
              </Link>
              <Link
                href="/admin-demo"
                className="rounded-full border border-white/70 bg-transparent px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-white/10"
              >
                Admin Dashboard Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
