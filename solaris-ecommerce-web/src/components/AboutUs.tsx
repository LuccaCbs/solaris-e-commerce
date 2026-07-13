import { BriefcaseBusiness, Link, Mail, MessageCircle, Phone } from 'lucide-react'
import { useAppearance } from '../context/ThemeContext'

const AboutUs = () => {
  const appearance = useAppearance()
  const hasContact = appearance.contactPhone || appearance.contactEmail
  const hasSocial = appearance.instagramEnabled || appearance.facebookEnabled || appearance.linkedinEnabled

  if (!appearance.aboutUsTitle && !appearance.aboutUsText && !hasContact && !hasSocial) return null

  return (
    <section className="w-full py-12 md:py-16" style={{ backgroundColor: 'var(--color-primary)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center" style={{ color: 'var(--color-secondary)' }}>
          <h2 className="text-2xl md:text-3xl font-bold">{appearance.aboutUsTitle || 'About Us'}</h2>
          {appearance.aboutUsText && <p className="mt-4 text-base leading-relaxed opacity-85">{appearance.aboutUsText}</p>}
          {hasContact && (
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              {appearance.contactPhone && (
                <a href={`tel:${appearance.contactPhone}`} className="inline-flex items-center gap-2 hover:opacity-70">
                  <Phone className="w-5 h-5" />
                  {appearance.contactPhone}
                </a>
              )}
              {appearance.contactEmail && (
                <a href={`mailto:${appearance.contactEmail}`} className="inline-flex items-center gap-2 hover:opacity-70">
                  <Mail className="w-5 h-5" />
                  {appearance.contactEmail}
                </a>
              )}
            </div>
          )}
          {hasSocial && (
            <div className="mt-6 flex justify-center gap-4">
              {appearance.instagramEnabled && appearance.instagramUrl && (
                <a href={appearance.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:opacity-70">
                  <Link className="w-6 h-6" />
                </a>
              )}
              {appearance.facebookEnabled && appearance.facebookUrl && (
                <a href={appearance.facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:opacity-70">
                  <MessageCircle className="w-6 h-6" />
                </a>
              )}
              {appearance.linkedinEnabled && appearance.linkedinUrl && (
                <a href={appearance.linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:opacity-70">
                  <BriefcaseBusiness className="w-6 h-6" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default AboutUs
