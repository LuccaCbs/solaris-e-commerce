import { BriefcaseBusiness, Link, Mail, MessageCircle, Phone } from 'lucide-react'
import { useAppearance } from '../context/ThemeContext'
import GoogleMapEmbed from './GoogleMapEmbed'
import { hasMapLocation } from '../utils/googleMaps'

const AboutUs = () => {
  const appearance = useAppearance()
  const hasContact = appearance.contactPhone || appearance.contactEmail
  const hasSocial = appearance.instagramEnabled || appearance.facebookEnabled || appearance.linkedinEnabled
  const showMap = hasMapLocation(appearance)
  const hasAboutContent = appearance.aboutUsTitle || appearance.aboutUsText

  if (!hasAboutContent && !showMap && !hasContact && !hasSocial) return null

  return (
    <section className="w-full py-12 md:py-16" style={{ backgroundColor: 'var(--color-primary)' }}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="text-left" style={{ color: 'var(--color-secondary)' }}>
            {appearance.aboutUsTitle && (
              <h2 className="text-2xl md:text-4xl font-bold leading-tight">{appearance.aboutUsTitle}</h2>
            )}
            {appearance.aboutUsText && (
              <p className="mt-4 text-base md:text-lg leading-relaxed opacity-90">{appearance.aboutUsText}</p>
            )}
            {(hasContact || hasSocial) && (
              <div className="mt-8 pt-6 border-t border-current/15">
                {hasContact && (
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 text-sm opacity-85">
                    {appearance.contactPhone && (
                      <a href={`tel:${appearance.contactPhone}`} className="inline-flex items-center gap-2 hover:opacity-70">
                        <Phone className="w-4 h-4 shrink-0" />
                        {appearance.contactPhone}
                      </a>
                    )}
                    {appearance.contactEmail && (
                      <a href={`mailto:${appearance.contactEmail}`} className="inline-flex items-center gap-2 hover:opacity-70">
                        <Mail className="w-4 h-4 shrink-0" />
                        {appearance.contactEmail}
                      </a>
                    )}
                  </div>
                )}
                {hasSocial && (
                  <div className={`flex gap-4 ${hasContact ? 'mt-4' : ''}`}>
                    {appearance.instagramEnabled && appearance.instagramUrl && (
                      <a href={appearance.instagramUrl} target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:opacity-70">
                        <Link className="w-5 h-5" />
                      </a>
                    )}
                    {appearance.facebookEnabled && appearance.facebookUrl && (
                      <a href={appearance.facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:opacity-70">
                        <MessageCircle className="w-5 h-5" />
                      </a>
                    )}
                    {appearance.linkedinEnabled && appearance.linkedinUrl && (
                      <a href={appearance.linkedinUrl} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="hover:opacity-70">
                        <BriefcaseBusiness className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {showMap && (
            <div className="w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden shadow-md">
              <GoogleMapEmbed
                latitude={appearance.mapLatitude}
                longitude={appearance.mapLongitude}
                address={appearance.mapAddress}
                zoom={appearance.mapZoom}
                title={appearance.aboutUsTitle || 'Location'}
              />
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default AboutUs
