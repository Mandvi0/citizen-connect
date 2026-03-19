import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  MapPin, 
  Users, 
  BarChart3, 
  Shield, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Globe, 
  Smartphone,
  MessageSquare,
  Mail,
  Activity,
  User
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { useEffect, useState } from "react";
import { getPublicComplaints, type Complaint } from "@/lib/api";
import LiveMap from "@/components/LiveMap";

const Index = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([28.6139, 77.209]); // Default: New Delhi
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getPublicComplaints({ page: 1, page_size: 50 });
        setComplaints(data.items);
        
        // Center the map on the first complaint if available
        if (data.items.length > 0) {
          setMapCenter([data.items[0].latitude, data.items[0].longitude]);
        }
      } catch (err) {
        console.error("Failed to fetch public complaints:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans selection:bg-primary/20">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <span className="font-black text-2xl tracking-tighter text-slate-900 dark:text-white uppercase italic">CivicConnect</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-10">
            <div className="flex items-center gap-8">
              <a href="#how-it-works" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">How it Works</a>
              <a href="#stats" className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-primary transition-colors">Impact</a>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 gap-2" onClick={() => navigate('/admin/login')}>
                <Shield className="h-4 w-4" />
                Admin Access
              </Button>
              <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-11 px-6 rounded-xl shadow-lg shadow-primary/20" onClick={() => navigate('/citizen/login')}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header / Hero Section */}
      <header className="relative pt-40 pb-24 overflow-hidden bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-10"
            >
              <div className="inline-flex items-center gap-2 bg-primary/5 px-4 py-2 rounded-full border border-primary/10">
                <Users className="h-4 w-4 text-primary" />
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Joined by 2,000+ active citizens this month</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                Empowering <span className="text-primary italic">Citizens</span>,<br />
                Improving <span className="text-primary">Cities</span>
              </h1>
              
              <p className="text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-xl font-medium">
                Report infrastructure issues, track resolutions in real-time, and collaborate with your local government to build a better community together.
              </p>

              <div className="flex flex-col sm:flex-row gap-5">
                <Button 
                  size="lg" 
                  className="h-14 px-10 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/25 transition-all hover:scale-105 active:scale-95"
                  onClick={() => navigate('/citizen/signup')}
                >
                  Start Reporting
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="h-14 px-10 text-lg font-bold rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center"
                  onClick={() => navigate('/citizen/login')}
                >
                  Track Progress
                </Button>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9, x: 30 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-primary/10 rounded-[2rem] blur-3xl opacity-50" />
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/20">
                {loading ? (
                  <div className="w-full h-full bg-slate-100 dark:bg-slate-800 animate-pulse flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                      <Globe className="h-10 w-10 animate-spin text-primary" />
                      <p className="text-sm font-bold text-muted-foreground">Initializing Live Map...</p>
                    </div>
                  </div>
                ) : (
                  <LiveMap 
                    complaints={complaints} 
                    center={mapCenter} 
                    onMarkerClick={(c) => navigate(`/citizen/complaints/${c.id}`)}
                  />
                )}
              </div>

              {/* Floating Stat Overlay */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="absolute z-[1000] -bottom-8 -left-8 bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-2xl border border-slate-100 dark:border-slate-700 min-w-[240px]"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/40 rounded-2xl">
                    <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Impact Status</span>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200 leading-none">Live Citizen Activity</p>
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">
                      {complaints.length > 0 ? complaints.length : "84"}
                    </span>
                    <span className="text-xs font-bold text-primary">Active Pins</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-500 mt-1">
                    {loading ? "Calculating impact..." : `Showing ${complaints.length} recent reports across the city.`}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </header>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-32 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">How it Works</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              Our platform bridges the gap between residents and city officials in three simple steps.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            {[
              {
                step: "1. Report",
                desc: "Pinpoint the issue on our interactive map. Add photos and a brief description of the problem.",
                icon: MapPin,
                color: "bg-primary"
              },
              {
                step: "2. Track",
                desc: "Receive real-time notifications as your report is assigned, reviewed, and scheduled for repair.",
                icon: Activity,
                color: "bg-blue-500"
              },
              {
                step: "3. Resolve",
                desc: "See the tangible impact of your contribution as the issue is resolved and your neighborhood improves.",
                icon: CheckCircle2,
                color: "bg-green-500"
              }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                whileHover={{ y: -10 }}
                className="group p-10 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-primary/40 transition-all shadow-xl shadow-slate-200/50 dark:shadow-none"
              >
                <div className={`w-16 h-16 ${item.color}/10 rounded-2xl flex items-center justify-center mb-10 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                  <item.icon className={`h-8 w-8 text-primary`} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-5">{item.step}</h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-lg font-medium">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats Banner */}
      <section id="stats" className="py-20 bg-primary relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-white/5 skew-x-[30deg] translate-x-1/2" />
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { val: "12k+", label: "Issues Reported" },
              { val: "48h", label: "Response Time" },
              { val: "9.2k", label: "Active Users" },
              { val: "15+", label: "Partner Cities" }
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-5xl md:text-6xl font-black text-white mb-3 tracking-tighter italic">{stat.val}</p>
                <p className="text-white/70 font-black uppercase tracking-[0.2em] text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Admin Access Section */}
      <section className="py-32">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-slate-950 rounded-[3.5rem] p-10 md:p-24 overflow-hidden relative border border-white/5 shadow-2xl">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/15 to-transparent pointer-events-none" />
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
            
            <div className="relative z-10 grid lg:grid-cols-2 gap-24 items-center">
              <div className="space-y-10">
                <span className="inline-block px-5 py-2 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest border border-primary/20">Administrative Terminal</span>
                <h2 className="text-4xl md:text-6xl font-black text-white leading-tight">City Official Dashboard</h2>
                <p className="text-slate-400 text-xl leading-relaxed font-medium">
                  Access powerful analytics, task management, and community engagement tools specifically designed for city departments and administrators.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 pt-6">
                  <Button 
                    className="bg-white text-slate-950 hover:bg-slate-100 h-16 px-10 rounded-2xl font-black text-lg shadow-xl"
                    onClick={() => navigate('/admin/login')}
                  >
                    Admin Sign In
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-slate-800 text-white hover:bg-slate-900 h-16 px-10 rounded-2xl font-black text-lg bg-transparent"
                  >
                    Request Access
                  </Button>
                </div>
              </div>

              <div className="hidden lg:block relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000" />
                <div className="relative bg-slate-900 rounded-[2.5rem] p-8 shadow-2xl border border-white/5">
                  <div className="flex items-center gap-3 mb-10 border-b border-white/5 pb-8">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500/50" />
                        <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
                        <div className="w-3 h-3 rounded-full bg-green-500/50" />
                    </div>
                    <div className="ml-6 h-3 w-40 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-primary/40 w-2/3" />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="h-10 bg-slate-800/40 rounded-xl w-full flex items-center px-4">
                        <div className="w-32 h-2 bg-slate-700 rounded-full" />
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                      <div className="h-28 bg-slate-800/40 rounded-2xl border border-white/5" />
                      <div className="h-28 bg-slate-800/40 rounded-2xl border border-white/5" />
                      <div className="h-28 bg-slate-800/40 rounded-2xl border border-white/5" />
                    </div>
                    <div className="h-40 bg-primary/5 rounded-3xl border border-primary/20 p-6 flex flex-col justify-end gap-3">
                        <div className="w-full h-2 bg-primary/20 rounded-full" />
                        <div className="w-2/3 h-2 bg-primary/20 rounded-full" />
                        <div className="w-1/2 h-2 bg-primary/20 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-white dark:bg-slate-950 py-24 border-t border-slate-200 dark:border-slate-900">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-12 mb-20">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                    <Globe className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">CivicConnect</span>
              </div>
              <p className="text-slate-500 font-bold text-sm max-w-xs uppercase tracking-widest">Building better cities through citizen collaboration.</p>
            </div>
            
            <div className="grid grid-cols-2 sm:flex gap-16 text-sm font-black uppercase tracking-[0.2em] text-slate-400">
              <a className="hover:text-primary transition-colors cursor-pointer" href="#">Privacy</a>
              <a className="hover:text-primary transition-colors cursor-pointer" href="#">Terms</a>
              <a className="hover:text-primary transition-colors cursor-pointer" href="#">Access</a>
              <a className="hover:text-primary transition-colors cursor-pointer" href="#">Contact</a>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer group shadow-lg shadow-slate-200/50 dark:shadow-none">
                <Globe className="h-5 w-5 text-slate-500 group-hover:text-white" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 flex items-center justify-center hover:bg-primary hover:text-white transition-all cursor-pointer group shadow-lg shadow-slate-200/50 dark:shadow-none">
                <Mail className="h-5 w-5 text-slate-500 group-hover:text-white" />
              </div>
            </div>
          </div>
          
          <div className="pt-12 border-t border-slate-100 dark:border-slate-900 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">© 2026 CivicConnect Core Engineering. All rights reserved.</p>
            <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Status: Optimal</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
