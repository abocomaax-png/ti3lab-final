import Link from 'next/link';

export default function Home() {
  return (
    <div style={{ background: '#0a0a0a', color: '#f1f1f1', fontFamily: 'sans-serif', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ padding: '80px 48px 72px', textAlign: 'center', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
        {/* Logo */}
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="40,8 68,22 68,52 40,72 12,52 12,22" fill="#1a0a0a" stroke="#e53e3e" strokeWidth="1.5"/>
            <polygon points="40,16 34,30 28,44 40,38 52,44 46,30" fill="#e53e3e" opacity="0.9"/>
            <polygon points="40,38 28,44 34,58 40,52 46,58 52,44" fill="#c53030" opacity="0.7"/>
            <line x1="40" y1="16" x2="40" y2="52" stroke="#fff" strokeWidth="1" opacity="0.3"/>
          </svg>
        </div>

        <div style={{
          display: 'inline-block', fontSize: '11px', letterSpacing: '0.14em',
          textTransform: 'uppercase', color: '#e53e3e',
          border: '0.5px solid rgba(229,62,62,0.3)', borderRadius: '4px',
          padding: '4px 12px', marginBottom: '24px'
        }}>
          Free · Practical · Arabic
        </div>

        <h1 style={{ fontSize: '50px', fontWeight: 500, lineHeight: 1.15, color: '#fff', maxWidth: '620px', margin: '0 auto 18px' }}>
          Stop reading about bugs.<br />
          <span style={{ color: '#e53e3e' }}>Start breaking them.</span>
        </h1>

        <p style={{ fontSize: '17px', color: '#9ca3af', maxWidth: '460px', margin: '0 auto 36px', lineHeight: 1.7 }}>
          Ti3lab is a hands-on web penetration testing platform built for those who learn by doing — not by reading endless theory.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/labs" style={{
            background: '#e53e3e', color: '#fff', border: 'none',
            padding: '13px 30px', borderRadius: '8px', fontSize: '15px',
            fontWeight: 500, textDecoration: 'none', display: 'inline-block'
          }}>
            Start for free
          </Link>
          <Link href="/labs" style={{
            background: 'transparent', color: '#e5e7eb',
            border: '0.5px solid rgba(255,255,255,0.2)',
            padding: '13px 30px', borderRadius: '8px', fontSize: '15px',
            fontWeight: 500, textDecoration: 'none', display: 'inline-block'
          }}>
            Browse labs
          </Link>
        </div>
      </section>

      {/* Story */}
      <section style={{ padding: '72px 48px', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#e53e3e', marginBottom: '18px' }}>
            Why Ti3lab exists
          </div>
          <blockquote style={{
            fontSize: '22px', fontWeight: 500, lineHeight: 1.55, color: '#fff',
            marginBottom: '18px', fontStyle: 'normal',
            borderLeft: '2px solid #e53e3e', paddingLeft: '20px', margin: '0 0 18px'
          }}>
            "When I was learning, I couldn't find anything that made it click. So I built what I wished had existed."
          </blockquote>
          <p style={{ fontSize: '15px', color: '#9ca3af', lineHeight: 1.8, paddingLeft: '20px' }}>
            Cybersecurity is full of theory. Courses, articles, videos — but very little of it puts you in front of a real vulnerability and lets you figure it out yourself. Ti3lab was built out of that frustration: a place where you download one file, spin up a real environment, and actually hack something.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '72px 48px', borderBottom: '0.5px solid rgba(255,255,255,0.08)', background: '#111111' }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 500, color: '#fff', marginBottom: '8px' }}>How it works</h2>
          <p style={{ fontSize: '14px', color: '#9ca3af' }}>Three steps, one ZIP, one real environment</p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1px', background: 'rgba(255,255,255,0.08)',
          border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '10px',
          overflow: 'hidden', maxWidth: '680px', margin: '0 auto'
        }}>
          {[
            { num: '01', label: 'Create a free account', desc: 'No credit card, no subscription' },
            { num: '02', label: 'Download a lab ZIP', desc: 'One file with everything inside' },
            { num: '03', label: 'Run it locally', desc: 'Docker spins it up in seconds' },
          ].map((step) => (
            <div key={step.num} style={{ background: '#111111', padding: '28px 22px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#e53e3e', letterSpacing: '0.1em', marginBottom: '12px', fontWeight: 500 }}>{step.num}</div>
              <h3 style={{ fontSize: '14px', fontWeight: 500, color: '#fff', marginBottom: '6px' }}>{step.label}</h3>
              <p style={{ fontSize: '12px', color: '#9ca3af', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ZIP contents */}
      <section style={{ padding: '72px 48px', borderBottom: '0.5px solid rgba(255,255,255,0.08)' }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 500, color: '#fff', marginBottom: '8px' }}>What's inside every ZIP</h2>
          <p style={{ fontSize: '14px', color: '#9ca3af' }}>Everything you need — nothing you don't</p>
        </div>

        <div style={{
          background: '#111111', border: '0.5px solid rgba(255,255,255,0.08)',
          borderRadius: '10px', padding: '28px', maxWidth: '520px', margin: '0 auto'
        }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#6b7280', marginBottom: '18px' }}>
            lab contents
          </div>

          {[
            { title: 'Docker environment', desc: 'A fully containerized, isolated lab that mirrors a real-world scenario. Runs offline.' },
            { title: 'README', desc: 'A clear breakdown of the vulnerability — what it is, how it works, and why it matters.' },
            { title: 'Gradual hints', desc: "Step-by-step nudges when you're stuck — without giving the answer away too early." },
          ].map((item, i, arr) => (
            <div key={item.title} style={{
              display: 'flex', gap: '14px', alignItems: 'flex-start',
              padding: '14px 0',
              borderBottom: i < arr.length - 1 ? '0.5px solid rgba(255,255,255,0.08)' : 'none'
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '6px',
                background: 'rgba(229,62,62,0.15)', border: '0.5px solid rgba(229,62,62,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0, color: '#e53e3e', fontSize: '15px'
              }}>
                {i === 0 ? '⬡' : i === 1 ? '≡' : '💡'}
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 500, color: '#fff', marginBottom: '3px' }}>{item.title}</h4>
                <p style={{ fontSize: '12px', color: '#9ca3af', lineHeight: 1.55 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Founder */}
      <section style={{ padding: '72px 48px', borderBottom: '0.5px solid rgba(255,255,255,0.08)', background: '#111111' }}>
        <div style={{ textAlign: 'center', marginBottom: '44px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 500, color: '#fff', marginBottom: '8px' }}>Built by someone who was in your shoes</h2>
          <p style={{ fontSize: '14px', color: '#9ca3af' }}>This isn't a corporate product — it's a personal mission</p>
        </div>

        <div style={{
          maxWidth: '560px', margin: '0 auto',
          background: '#0a0a0a', border: '0.5px solid rgba(255,255,255,0.08)',
          borderRadius: '12px', padding: '32px'
        }}>
          <div style={{
            display: 'flex', gap: '16px', alignItems: 'center',
            marginBottom: '20px', paddingBottom: '20px',
            borderBottom: '0.5px solid rgba(255,255,255,0.08)'
          }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: 'rgba(229,62,62,0.15)', border: '0.5px solid rgba(229,62,62,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', fontWeight: 500, color: '#e53e3e', flexShrink: 0
            }}>
              K
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 500, color: '#fff', marginBottom: '3px' }}>Khalid</div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>Founder of Ti3lab</div>
            </div>
          </div>

          <p style={{ fontSize: '14px', color: '#9ca3af', lineHeight: 1.8, marginBottom: '20px' }}>
            I built Ti3lab because I was once completely lost trying to learn web penetration testing. Everything I found was either too theoretical or too shallow to actually help. When things finally clicked for me, I made a decision: I'd build the platform that I desperately needed back then — and make it free for everyone.
          </p>

          <a
            href="https://www.linkedin.com/in/khalid-ti3lap-70171136a"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              fontSize: '13px', color: '#e53e3e', textDecoration: 'none',
              border: '0.5px solid rgba(229,62,62,0.3)', padding: '7px 14px',
              borderRadius: '6px', background: 'rgba(229,62,62,0.1)'
            }}
          >
            Connect on LinkedIn ↗
          </a>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 48px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '30px', fontWeight: 500, color: '#fff', marginBottom: '10px' }}>
          Ready to actually learn?
        </h2>
        <p style={{ fontSize: '15px', color: '#9ca3af', marginBottom: '32px' }}>
          New labs drop regularly. Every new category gets announced as soon as it's live.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/auth/signup" style={{
            background: '#e53e3e', color: '#fff', border: 'none',
            padding: '13px 30px', borderRadius: '8px', fontSize: '15px',
            fontWeight: 500, textDecoration: 'none', display: 'inline-block'
          }}>
            Create free account
          </Link>
          <Link href="/labs" style={{
            background: 'transparent', color: '#e5e7eb',
            border: '0.5px solid rgba(255,255,255,0.2)',
            padding: '13px 30px', borderRadius: '8px', fontSize: '15px',
            fontWeight: 500, textDecoration: 'none', display: 'inline-block'
          }}>
            See what's available
          </Link>
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          fontSize: '12px', color: '#e53e3e',
          background: 'rgba(229,62,62,0.1)', border: '0.5px solid rgba(229,62,62,0.3)',
          borderRadius: '6px', padding: '5px 12px', marginTop: '20px'
        }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#e53e3e', display: 'inline-block' }}></span>
          New labs added regularly
        </div>
      </section>

    </div>
  );
}
