import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTruck, FiMapPin, FiCpu, FiShield, FiTrendingUp, FiClock } from 'react-icons/fi';
import Navbar from '../components/landing/Navbar';

const fadeUp = { initial: { opacity: 0, y: 30 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true } };

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden">
      <div className="fixed inset-0 bg-hero-pattern opacity-90" />
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.03\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] pointer-events-none" />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div {...fadeUp} transition={{ duration: 0.6 }}>
            <span className="inline-block px-4 py-1 rounded-full glass text-sm mb-6 text-lumina-200">Smart AI-Powered Logistics</span>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Ship Smarter with <span className="text-transparent bg-clip-text bg-gradient-to-r from-lumina-300 to-accent-light">Lumina</span>
            </h1>
            <p className="text-lg text-white/70 mb-8 max-w-xl">
              Book shipments, track deliveries in real-time, and let AI optimize routes, predict ETAs, and detect delays — all in one platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/register" className="btn-primary">Start Shipping Free</Link>
              <Link to="/track" className="btn-secondary text-white">Track Package</Link>
            </div>
          </motion.div>
          <motion.div animate={{ y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 6 }} className="relative">
            <div className="glass-card p-8 aspect-square max-w-md mx-auto flex items-center justify-center">
              <div className="relative w-full h-64">
                <motion.div className="absolute top-0 left-1/4 w-20 h-20 rounded-2xl bg-lumina-500/30 flex items-center justify-center" animate={{ x: [0, 40, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
                  <FiTruck className="text-4xl text-lumina-300" />
                </motion.div>
                <motion.div className="absolute bottom-8 right-8 w-16 h-16 rounded-full bg-accent/40 flex items-center justify-center" animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 3 }}>
                  <FiMapPin className="text-2xl" />
                </motion.div>
                <div className="absolute inset-0 border-2 border-dashed border-white/20 rounded-3xl" />
                <p className="absolute bottom-4 left-4 text-sm text-white/60">Live route visualization</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative py-16 px-4 border-y border-white/10">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[['50K+', 'Shipments'], ['99.2%', 'On-time Rate'], ['120+', 'Cities'], ['24/7', 'AI Support']].map(([n, l]) => (
            <motion.div key={l} {...fadeUp}>
              <p className="text-4xl font-bold text-lumina-300">{n}</p>
              <p className="text-white/60">{l}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative py-24 px-4 max-w-7xl mx-auto">
        <motion.h2 {...fadeUp} className="text-4xl font-bold text-center mb-4">Everything You Need</motion.h2>
        <p className="text-center text-white/60 mb-16 max-w-2xl mx-auto">Inspired by Delhivery, Shiprocket & Uber — built for modern logistics.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: FiTruck, title: 'Real-time Tracking', desc: 'Live shipment updates via Socket.io' },
            { icon: FiCpu, title: 'AI ETA Prediction', desc: 'Smart delivery time with confidence %' },
            { icon: FiShield, title: 'Secure Payments', desc: 'COD, UPI & Card with invoices' },
            { icon: FiMapPin, title: 'Route Optimization', desc: 'Fastest & fuel-efficient routes' },
            { icon: FiTrendingUp, title: 'Admin Analytics', desc: 'Revenue, delays & driver insights' },
            { icon: FiClock, title: 'Delay Detection', desc: 'AI alerts for inactive shipments' },
          ].map((f) => (
            <motion.div key={f.title} {...fadeUp} className="glass-card p-6 hover:scale-[1.02] transition">
              <f.icon className="text-3xl text-lumina-400 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{f.title}</h3>
              <p className="text-white/60 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Section */}
      <section id="ai" className="relative py-24 px-4">
        <div className="max-w-7xl mx-auto glass-card p-12 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">AI-Powered Delivery Intelligence</h2>
            <ul className="space-y-3 text-white/70">
              <li>• ETA prediction using distance, traffic & weather</li>
              <li>• Automatic delay detection & admin alerts</li>
              <li>• Lumina AI chatbot for support & tracking help</li>
              <li>• Route suggestions: fastest, shortest, fuel-efficient</li>
            </ul>
          </div>
          <div className="bg-slate-900/50 rounded-xl p-6 font-mono text-sm text-green-400">
            <p>{'>'} predictETA(shipment)</p>
            <p className="text-white/80 mt-2">ETA: Tomorrow 4:30 PM</p>
            <p className="text-lumina-300">Confidence: 87%</p>
            <p className="text-amber-400 mt-4">⚠ Delay check: OK</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative py-24 px-4 max-w-7xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {['Book', 'Pickup', 'Transit', 'Deliver'].map((step, i) => (
            <motion.div key={step} {...fadeUp} className="text-center">
              <div className="w-14 h-14 rounded-full bg-lumina-600 flex items-center justify-center mx-auto mb-4 text-xl font-bold">{i + 1}</div>
              <h3 className="font-semibold">{step}</h3>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Trusted by Businesses</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { name: 'Riya S.', role: 'E-commerce Seller', text: 'Lumina cut our delivery complaints by 40%. The AI ETA is surprisingly accurate!' },
            { name: 'Vikram M.', role: 'Fleet Manager', text: 'Driver dashboard and live tracking made operations so much easier.' },
            { name: 'Ananya K.', role: 'Startup Founder', text: 'Perfect internship project level — professional UI, clean MERN architecture.' },
          ].map((t) => (
            <div key={t.name} className="glass-card p-6">
              <p className="text-white/80 mb-4">&ldquo;{t.text}&rdquo;</p>
              <p className="font-semibold">{t.name}</p>
              <p className="text-sm text-white/50">{t.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 px-4 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">Simple Pricing</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { plan: 'Starter', price: '₹40', desc: 'Per kg base rate' },
            { plan: 'Business', price: '₹29', desc: 'Volume discounts', highlight: true },
            { plan: 'Enterprise', price: 'Custom', desc: 'Dedicated support' },
          ].map((p) => (
            <div key={p.plan} className={`glass-card p-8 text-center ${p.highlight ? 'ring-2 ring-lumina-400 scale-105' : ''}`}>
              <h3 className="text-xl font-bold">{p.plan}</h3>
              <p className="text-4xl font-extrabold my-4 text-lumina-300">{p.price}</p>
              <p className="text-white/60 text-sm">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-4 text-center text-white/50">
        <p className="font-bold text-white mb-2">Lumina Logistics</p>
        <p>Smart AI-Powered Shipment & Delivery Management Platform</p>
        <p className="mt-4 text-sm">© 2026 Lumina. Built with MERN Stack.</p>
      </footer>
    </div>
  );
}
