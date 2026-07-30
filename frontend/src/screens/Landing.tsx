import { Heart, MapPin, Leaf, Users, ArrowRight, CheckCircle, Star, TrendingUp } from 'lucide-react'
import Logo from '../components/Logo'

interface LandingProps {
  onGetStarted: () => void
  onLogin: () => void
}

const stats = [
  { value: '48,200+', label: 'Meals Saved', icon: Heart },
  { value: '1,340+', label: 'Active Donors', icon: TrendingUp },
  { value: '280+', label: 'NGO Partners', icon: Users },
  { value: '32 Cities', label: 'Across India', icon: MapPin },
]

const features = [
  {
    icon: MapPin,
    title: 'Location-Based Matching',
    desc: 'Connects donors with the nearest recipients in real-time using GPS precision.',
    color: 'bg-primary-50 text-primary',
  },
  {
    icon: Leaf,
    title: 'Zero Food Waste',
    desc: 'Every meal donated reduces landfill waste and lowers carbon emissions.',
    color: 'bg-accent-50 text-accent',
  },
  {
    icon: Users,
    title: 'Volunteer Network',
    desc: 'A community of trained volunteers ensures timely and safe food delivery.',
    color: 'bg-[#EDE7F6] text-[#6A1B9A]',
  },
  {
    icon: CheckCircle,
    title: 'End-to-End Tracking',
    desc: 'Donors track every donation from posting to confirmed delivery.',
    color: 'bg-[#E3F2FD] text-[#1565C0]',
  },
]

const testimonials = [
  {
    name: 'Meera Iyer',
    role: 'Event Caterer, Bangalore',
    avatar: 'M',
    color: 'bg-primary',
    text: "We used to discard 30–40 kg of food after every event. With FoodConnect, that food now reaches children the same evening. It feels genuinely good.",
    stars: 5,
  },
  {
    name: 'Fr. Thomas Mathew',
    role: 'Director, Bethany Shelter, Kochi',
    avatar: 'T',
    color: 'bg-[#1565C0]',
    text: "Our residents receive warm, safe meals daily now. The platform is reliable, transparent, and the volunteers are wonderful.",
    stars: 5,
  },
  {
    name: 'Divya Menon',
    role: 'FoodConnect Volunteer, Chennai',
    avatar: 'D',
    color: 'bg-[#6A1B9A]',
    text: "I do two deliveries a week on my way home from work. The app makes it effortless — navigation, updates, everything in one place.",
    stars: 5,
  },
]

export default function Landing({ onGetStarted, onLogin }: LandingProps) {
  return (
    <div className="min-h-screen bg-surface font-inter overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 bg-surface/95 backdrop-blur-sm border-b border-border z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Logo size="md" variant="full" />
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-text-secondary hover:text-text-primary font-medium">Features</a>
            <a href="#how-it-works" className="text-sm text-text-secondary hover:text-text-primary font-medium">How It Works</a>
            <a href="#testimonials" className="text-sm text-text-secondary hover:text-text-primary font-medium">Stories</a>
          </nav>
          <div className="flex items-center gap-3">
            <button
              onClick={onLogin}
              className="text-sm font-medium text-text-primary hover:text-primary px-4 py-2"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="text-sm font-semibold bg-primary text-white px-5 py-2.5 rounded-xl hover:bg-primary-dark shadow-sm"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-surface to-accent-50 pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-primary-50 text-primary px-4 py-2 rounded-full text-sm font-semibold mb-6 border border-primary-100">
                <Leaf className="w-4 h-4" />
                Reducing Food Waste Across India
              </div>
              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-extrabold text-text-primary leading-tight font-poppins mb-6">
                Connecting{' '}
                <span className="text-primary">Food</span> with{' '}
                <span className="text-accent">People</span> Who Need It
              </h1>
              <p className="text-lg text-text-secondary leading-relaxed mb-8 max-w-xl">
                FoodConnect bridges the gap between food surplus and hunger. Donors post, recipients request, and volunteers deliver — all in real time.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={onGetStarted}
                  className="flex items-center gap-2 bg-primary text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-primary-dark shadow-lg shadow-primary/25 text-sm"
                >
                  Start Donating
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={onGetStarted}
                  className="flex items-center gap-2 bg-surface border border-border text-text-primary font-semibold px-7 py-3.5 rounded-xl hover:bg-bg text-sm shadow-sm"
                >
                  Find Food Near Me
                  <MapPin className="w-4 h-4 text-primary" />
                </button>
              </div>
              <div className="flex items-center gap-6 mt-8 pt-8 border-t border-border">
                {[
                  { label: 'Avg. pickup in', value: '28 min' },
                  { label: 'Food safety', value: '100%' },
                  { label: 'Verified NGOs', value: '280+' },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="text-xl font-bold text-text-primary font-poppins">{s.value}</p>
                    <p className="text-xs text-text-secondary">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Map card */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl border border-border bg-surface">
                  <img
                    src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&h=800&fit=crop&auto=format"
                    alt="Community food sharing"
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-text-primary/60 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="bg-surface/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                          <Heart className="w-5 h-5 text-primary fill-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-text-primary">12 kg Biriyani Available</p>
                          <p className="text-xs text-text-secondary">Arjun Sharma · 1.2 km away · Valid 3h</p>
                        </div>
                        <button className="ml-auto bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-lg">
                          Request
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 bg-surface rounded-2xl shadow-xl border border-border px-4 py-3">
                  <p className="text-xs text-text-secondary">Today saved</p>
                  <p className="text-2xl font-bold text-primary font-poppins">1,240 kg</p>
                </div>
                <div className="absolute -bottom-4 -left-4 bg-accent text-white rounded-2xl shadow-xl px-4 py-3">
                  <p className="text-xs opacity-80">Meals delivered</p>
                  <p className="text-2xl font-bold font-poppins">48,200+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-primary py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3">
                  <s.icon className="w-6 h-6 text-white" />
                </div>
                <p className="text-3xl font-extrabold text-white font-poppins">{s.value}</p>
                <p className="text-sm text-white/70 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-bg">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary font-poppins mb-4">
              Everything You Need
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              A complete ecosystem for food donation — from posting surplus to confirmed delivery.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="bg-surface rounded-2xl p-6 shadow-sm border border-border hover:shadow-md hover:-translate-y-0.5">
                <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center mb-4`}>
                  <f.icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-text-primary font-poppins mb-2">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-surface">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary font-poppins mb-4">
              How FoodConnect Works
            </h2>
            <p className="text-text-secondary max-w-xl mx-auto">
              Three simple steps to make a meal reach someone who needs it.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Donor Posts Food',
                desc: 'Upload a photo, add details — quantity, type, and pickup window. Takes 60 seconds.',
                img: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=280&fit=crop&auto=format',
                alt: 'Person photographing food for donation',
              },
              {
                step: '02',
                title: 'Recipient Requests',
                desc: 'Nearby NGOs and shelters browse available food and send a pickup request.',
                img: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=280&fit=crop&auto=format',
                alt: 'NGO staff coordinating food collection',
              },
              {
                step: '03',
                title: 'Volunteer Delivers',
                desc: 'A nearby volunteer picks up and delivers the food. You track it live.',
                img: 'https://images.unsplash.com/photo-1647427060118-4911c9821b82?w=400&h=280&fit=crop&auto=format',
                alt: 'Volunteer on bicycle delivering food',
              },
            ].map((item, i) => (
              <div key={i} className="group">
                <div className="rounded-2xl overflow-hidden mb-5 border border-border aspect-video bg-bg">
                  <img src={item.img} alt={item.alt} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex items-start gap-4">
                  <span className="text-4xl font-extrabold text-primary-100 font-poppins leading-none mt-1">{item.step}</span>
                  <div>
                    <h3 className="text-base font-semibold text-text-primary font-poppins mb-2">{item.title}</h3>
                    <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-bg">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl lg:text-4xl font-bold text-text-primary font-poppins mb-4">Real Stories</h2>
            <p className="text-text-secondary">From the people making it happen every day.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-surface rounded-2xl p-6 border border-border shadow-sm">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-accent fill-accent" />
                  ))}
                </div>
                <p className="text-sm text-text-secondary leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.color} text-white font-bold text-sm flex items-center justify-center font-poppins`}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">{t.name}</p>
                    <p className="text-xs text-text-secondary">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white font-poppins mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-white/75 text-lg mb-8">
            Join 48,200+ meals already saved. It takes less than two minutes to post your first donation.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={onGetStarted}
              className="flex items-center gap-2 bg-white text-primary font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-50 text-sm shadow-lg"
            >
              Join FoodConnect
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onLogin}
              className="text-sm font-semibold text-white/80 border border-white/30 px-8 py-3.5 rounded-xl hover:bg-white/10"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-text-primary py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <Heart className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-white font-bold font-poppins">FoodConnect</span>
          </div>
          <p className="text-sm text-white/50">© 2025 FoodConnect. Built with purpose.</p>
          <div className="flex gap-6">
            {['Privacy', 'Terms', 'Contact'].map((l) => (
              <a key={l} href="#" className="text-sm text-white/50 hover:text-white">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
