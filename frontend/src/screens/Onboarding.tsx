import { useState } from 'react'
import { ArrowRight, Heart, MapPin, Truck } from 'lucide-react'

interface OnboardingProps {
  onFinish: () => void
}

const slides = [
  {
    icon: Heart,
    color: 'bg-primary',
    lightColor: 'bg-primary-50',
    textColor: 'text-primary',
    img: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&h=500&fit=crop&auto=format',
    title: 'Share Food,\nShare Life',
    desc: 'Surplus meals from restaurants, events, and homes find their way to orphanages, shelters, and families in need — the same day.',
  },
  {
    icon: MapPin,
    color: 'bg-[#1565C0]',
    lightColor: 'bg-[#E3F2FD]',
    textColor: 'text-[#1565C0]',
    img: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600&h=500&fit=crop&auto=format',
    title: 'Find Help\nNear You',
    desc: 'Smart location matching connects donors with the nearest verified NGOs, shelters, and community kitchens in real time.',
  },
  {
    icon: Truck,
    color: 'bg-[#6A1B9A]',
    lightColor: 'bg-[#F3E5F5]',
    textColor: 'text-[#6A1B9A]',
    img: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=600&h=500&fit=crop&auto=format',
    title: 'Delivered by\nVolunteers',
    desc: 'Our network of community volunteers ensures every donation is picked up and delivered safely, quickly, and with care.',
  },
]

export default function Onboarding({ onFinish }: OnboardingProps) {
  const [step, setStep] = useState(0)
  const slide = slides[step]
  const isLast = step === slides.length - 1

  return (
    <div className="min-h-screen bg-surface flex flex-col font-inter overflow-hidden">
      {/* Skip */}
      <div className="flex justify-between items-center px-6 pt-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Heart className="w-4 h-4 text-white fill-white" />
          </div>
          <span className="text-sm font-bold text-text-primary font-poppins">FoodConnect</span>
        </div>
        <button onClick={onFinish} className="text-sm text-text-secondary font-medium hover:text-text-primary">
          Skip
        </button>
      </div>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center px-8 py-10">
        <div className="relative w-full max-w-sm">
          <div className={`absolute inset-0 rounded-3xl ${slide.lightColor} blur-3xl opacity-60 scale-95`} />
          <div className="relative rounded-3xl overflow-hidden aspect-[4/3] shadow-2xl border border-border">
            <img
              src={slide.img}
              alt={slide.title.replace('\n', ' ')}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className={`absolute top-4 left-4 w-10 h-10 rounded-xl ${slide.color} flex items-center justify-center shadow-lg`}>
              <slide.icon className="w-5 h-5 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 pb-12">
        <h2 className="text-3xl font-extrabold text-text-primary font-poppins leading-tight mb-3 whitespace-pre-line">
          {slide.title}
        </h2>
        <p className="text-text-secondary leading-relaxed text-base mb-8">{slide.desc}</p>

        {/* Dots */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`h-2 rounded-full transition-all ${
                  i === step ? `w-6 ${slide.color}` : 'w-2 bg-border'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => (isLast ? onFinish() : setStep((s) => s + 1))}
            className={`flex items-center gap-2 ${slide.color} text-white font-semibold px-6 py-3 rounded-xl shadow-lg text-sm`}
          >
            {isLast ? 'Get Started' : 'Next'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
