import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"

export default function MethodologyPage() {
  return (
    <>
      <Header />
      <main className="container max-w-3xl px-4 py-24 space-y-12">
        <h1 className="text-4xl font-semibold">Security Methodology</h1>

        <p className="text-muted-foreground text-lg">
          CipherGuard combines deterministic security analysis with AI-assisted reasoning.
          We do not rely on probabilistic output alone.
        </p>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">1. Static Code Analysis</h2>
          <p className="text-muted-foreground">
            We analyze source code directly to identify vulnerable patterns such as injection flaws,
            authentication weaknesses, insecure deserialization, and misconfigurations.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">2. Rule-Based Security Engines</h2>
          <p className="text-muted-foreground">
            Findings are validated using known vulnerability rules derived from OWASP Top 10,
            CWE, and real-world exploit patterns.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">3. AI-Assisted Contextual Reasoning</h2>
          <p className="text-muted-foreground">
            AI is used to understand execution context, data flow, and exploit chains —
            not to hallucinate vulnerabilities.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold">4. Human-Readable Reports</h2>
          <p className="text-muted-foreground">
            Every issue includes severity, impact, affected code, and a recommended fix.
            Reports are designed for engineers, not marketing teams.
          </p>
        </section>

        <section className="border-t border-border pt-6 text-sm text-muted-foreground">
          CipherGuard never executes your code and never trains on customer repositories.
        </section>
      </main>
      <Footer />
    </>
  )
}
